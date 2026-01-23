from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import re
from datetime import datetime
import ast
import os
from database import get_db, engine, Base
from models import Employee, Attendance
from schemas import EmployeeCreate, Employee as EmployeeSchema, AttendanceCreate, Attendance as AttendanceSchema, EmployeeWithAttendance

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", '["http://localhost:5173","https://hrms-lemon-one.vercel.app"]')
try:
    allowed_origins = ast.literal_eval(cors_origins)
except (ValueError, SyntaxError):
    allowed_origins = ["http://localhost:5173","https://hrms-lemon-one.vercel.app"]
print(allowed_origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.get("/")
def read_root():
    return {"message": "HRMS Lite API is running"}

@app.post("/employees/", response_model=EmployeeSchema, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    # Validate email format
    if not validate_email(employee.email_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Check for duplicate employee ID
    existing_employee = db.query(Employee).filter(Employee.employee_id == employee.employee_id).first()
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already exists"
        )
    
    # Check for duplicate email
    existing_email = db.query(Employee).filter(Employee.email_address == employee.email_address).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already exists"
        )
    
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.get("/employees/", response_model=Dict[str, Any])
def get_employees(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for employee name, email, or department")
):
    query = db.query(Employee)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Employee.full_name.ilike(search_term)) |
            (Employee.email_address.ilike(search_term)) |
            (Employee.department.ilike(search_term)) |
            (Employee.employee_id.ilike(search_term))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    employees = query.offset(skip).limit(limit).all()
    
    # Convert SQLAlchemy models to Pydantic schemas
    employee_schemas = [EmployeeSchema.model_validate(emp) for emp in employees]
    
    return {
        "employees": employee_schemas,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_next": skip + limit < total,
        "has_prev": skip > 0
    }

@app.get("/employees/{employee_id}", response_model=EmployeeWithAttendance)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee

@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Delete related attendance records first
    db.query(Attendance).filter(Attendance.employee_id == employee_id).delete()
    
    db.delete(employee)
    db.commit()
    return None

@app.post("/attendances/", response_model=AttendanceSchema, status_code=status.HTTP_201_CREATED)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.employee_id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Check for duplicate attendance record
    existing_attendance = db.query(Attendance).filter(
        Attendance.employee_id == attendance.employee_id,
        Attendance.date == attendance.date
    ).first()
    
    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this date"
        )
    
    db_attendance = Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return AttendanceSchema.model_validate(db_attendance)

@app.get("/attendances/employee/{employee_id}", response_model=List[AttendanceSchema])
def get_employee_attendance(
    employee_id: str, 
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)")
):
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)
    
    # Apply date filters if provided
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Attendance.date >= start_datetime)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD"
            )
    
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Attendance.date <= end_datetime)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD"
            )
    
    attendances = query.order_by(Attendance.date.desc()).all()
    return [AttendanceSchema.model_validate(att) for att in attendances]

@app.get("/attendances/", response_model=List[AttendanceSchema])
def get_all_attendances(db: Session = Depends(get_db)):
    attendances = db.query(Attendance).all()
    return [AttendanceSchema.model_validate(att) for att in attendances]
