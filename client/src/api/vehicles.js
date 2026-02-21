import API from './axios';

export const getVehicles = (params) => API.get('/vehicles', { params });
export const getVehicle = (id) => API.get(`/vehicles/${id}`);
export const getAvailableVehicles = () => API.get('/vehicles/available');
export const createVehicle = (data) => API.post('/vehicles', data);
export const updateVehicle = (id, data) => API.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);
