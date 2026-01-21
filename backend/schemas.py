from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from models import AttendanceStatus

class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email_address: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    employee_id: str

class Attendance(AttendanceBase):
    id: int
    employee_id: str
    
    class Config:
        from_attributes = True

class EmployeeWithAttendance(Employee):
    attendances: list[Attendance] = []
