import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeList from './components/EmployeeList';
import AttendanceList from './components/AttendanceList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<EmployeeList />} />
            <Route path="/attendance/:employeeId" element={<AttendanceList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
