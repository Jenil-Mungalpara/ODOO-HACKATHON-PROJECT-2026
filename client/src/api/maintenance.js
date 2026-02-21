import API from './axios';

export const getMaintenanceLogs = (params) => API.get('/maintenance', { params });
export const createMaintenanceLog = (data) => API.post('/maintenance', data);
export const completeMaintenanceLog = (id) => API.post(`/maintenance/${id}/complete`);
