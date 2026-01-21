import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const employeeAPI = {
  getAll: (skip = 0, limit = 10, search = null) => {
    let url = '/employees/';
    const params = new URLSearchParams();
    
    if (skip > 0) params.append('skip', skip);
    if (limit !== 10) params.append('limit', limit);
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return api.get(url);
  },
  getById: (employeeId) => api.get(`/employees/${employeeId}`),
  create: (employeeData) => api.post('/employees/', employeeData),
  delete: (employeeId) => api.delete(`/employees/${employeeId}`),
};

export const attendanceAPI = {
  getAll: () => api.get('/attendances/'),
  getByEmployee: (employeeId, startDate = null, endDate = null) => {
    let url = `/attendances/employee/${employeeId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return api.get(url);
  },
  create: (attendanceData) => api.post('/attendances/', attendanceData),
};

export default api;
