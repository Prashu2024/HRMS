# HRMS Lite - Human Resource Management System

A lightweight, web-based HR management system built with React (frontend) and FastAPI (backend).

## Features

### Employee Management
- Add new employees with unique ID, name, email, and department
- View all employees in a professional table format
- Delete employees with confirmation
- Email validation and duplicate prevention

### Attendance Management
- Mark attendance (Present/Absent) for employees
- View attendance records for each employee
- Summary statistics (total days, present days, absent days)
- Date-based attendance tracking

## Tech Stack

### Frontend
- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

### Backend
- FastAPI (Python)
- SQLAlchemy for ORM
- PostgreSQL database
- Pydantic for data validation

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up PostgreSQL database:
```bash
# Run the automated setup script
./setup_database.sh
```

The setup script will:
- Create the `hrms_db` database
- Set up the `postgres` user with password `postgres`
- Grant necessary permissions
- Provide the connection string for your .env file

5. Update the `.env` file with your database credentials:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrms_db
CORS_ORIGINS=["http://localhost:5173"]
```

6. Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Employees
- `GET /employees/` - Get all employees
- `POST /employees/` - Create a new employee
- `GET /employees/{employee_id}` - Get employee by ID with attendance
- `DELETE /employees/{employee_id}` - Delete an employee

### Attendance
- `GET /attendances/` - Get all attendance records
- `POST /attendances/` - Mark attendance
- `GET /attendances/employee/{employee_id}` - Get attendance for specific employee

## Usage

1. Start both the backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Add employees using the "Add Employee" button
4. Click the calendar icon next to any employee to manage their attendance
5. Mark attendance as Present or Absent for specific dates

## Error Handling

The application includes comprehensive error handling:
- Email format validation
- Duplicate employee ID/email prevention
- Duplicate attendance prevention for same date
- Meaningful error messages for all operations
- Proper HTTP status codes

## Production Considerations

For production deployment:
1. Use environment variables for sensitive data
2. Set up proper database connection pooling
3. Implement authentication/authorization
4. Use HTTPS
5. Set up proper logging
6. Consider using a production-ready WSGI server like Gunicorn

## License

This project is for demonstration purposes.
