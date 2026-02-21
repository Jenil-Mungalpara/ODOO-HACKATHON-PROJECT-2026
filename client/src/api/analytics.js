import API from './axios';

export const getDashboardStats = () => API.get('/analytics/dashboard');
export const getVehicleROI = (vehicleId) => API.get('/analytics/vehicle-roi', { params: { vehicleId } });
export const getFuelEfficiency = (start, end) => API.get('/analytics/fuel-efficiency', { params: { start, end } });
export const getUtilization = () => API.get('/analytics/utilization');
export const getAlerts = () => API.get('/alerts');
export const resolveAlert = (id, resolution_note) => API.post(`/alerts/${id}/resolve`, { resolution_note });
