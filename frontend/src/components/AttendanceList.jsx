import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceAPI, employeeAPI } from '../api';
import { Calendar, Plus, Users, ArrowLeft, CheckCircle, XCircle, Filter, X } from 'lucide-react';
import AttendanceForm from './AttendanceForm';

const AttendanceList = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchEmployeeData = async () => {
    try {
      const [employeeResponse, attendanceResponse] = await Promise.all([
        employeeAPI.getById(employeeId),
        attendanceAPI.getByEmployee(employeeId, startDate || null, endDate || null)
      ]);
      setEmployee(employeeResponse.data);
      setAttendances(attendanceResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId, startDate, endDate]);

  const handleAttendanceAdded = () => {
    fetchEmployeeData();
  };

  const getPresentDays = () => {
    return attendances.filter(att => att.status === 'present').length;
  };

  const getAbsentDays = () => {
    return attendances.filter(att => att.status === 'absent').length;
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Employee not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Back to Employees
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Mark Attendance
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Attendance Records</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
          {(startDate || endDate) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Active filters: {startDate && `From ${startDate}`} {startDate && endDate && 'to'} {endDate && `to ${endDate}`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-gray-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{employee.full_name}</h2>
            <p className="text-sm text-gray-600">
              ID: {employee.employee_id} | {employee.department} | {employee.email_address}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{attendances.length}</div>
            <div className="text-sm text-gray-600">Total Days</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{getPresentDays()}</div>
            <div className="text-sm text-gray-600">Present Days</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{getAbsentDays()}</div>
            <div className="text-sm text-gray-600">Absent Days</div>
          </div>
        </div>
      </div>

      {attendances.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Attendance Records</h3>
          <p className="text-gray-500 mb-4">Start tracking attendance for this employee</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Mark First Attendance
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(attendance.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {attendance.status === 'present' ? (
                            <>
                              <CheckCircle className="text-green-500" size={16} />
                              <span className="text-sm font-medium text-green-600">Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500" size={16} />
                              <span className="text-sm font-medium text-red-600">Absent</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <AttendanceForm
          employeeId={employeeId}
          onAttendanceAdded={handleAttendanceAdded}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default AttendanceList;
