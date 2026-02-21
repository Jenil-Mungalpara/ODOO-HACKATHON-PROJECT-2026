import API from './axios';

export const getDrivers = (params) => API.get('/drivers', { params });
export const getDriver = (id) => API.get(`/drivers/${id}`);
export const getEligibleDrivers = () => API.get('/drivers/eligible');
export const createDriver = (data) => API.post('/drivers', data);
export const updateDriver = (id, data) => API.put(`/drivers/${id}`, data);
export const suspendDriver = (id) => API.post(`/drivers/${id}/suspend`);
export const banDriver = (id) => API.post(`/drivers/${id}/ban`);
export const reinstateDriver = (id) => API.post(`/drivers/${id}/reinstate`);
