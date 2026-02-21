import API from './axios';

export const getExpenses = (params) => API.get('/expenses', { params });
export const createExpense = (data) => API.post('/expenses', data);
