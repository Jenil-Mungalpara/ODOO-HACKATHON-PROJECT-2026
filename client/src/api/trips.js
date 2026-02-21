import API from './axios';

export const getTrips = (params) => API.get('/trips', { params });
export const getTrip = (id) => API.get(`/trips/${id}`);
export const getCompletedTrips = () => API.get('/trips/completed');
export const createTrip = (data) => API.post('/trips', data);
export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);
export const dispatchTrip = (id) => API.post(`/trips/${id}/dispatch`);
export const completeTrip = (id) => API.post(`/trips/${id}/complete`);
export const cancelTrip = (id) => API.post(`/trips/${id}/cancel`);
export const deleteTrip = (id) => API.delete(`/trips/${id}`);
