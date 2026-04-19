import client from './client';

export const getPlants = () => client.get('/api/plants').then(r => r.data);
export const getPlant = (id) => client.get(`/api/plants/${id}`).then(r => r.data);
export const createPlant = (data) => client.post('/api/plants', data).then(r => r.data);
export const updatePlant = (id, data) => client.put(`/api/plants/${id}`, data).then(r => r.data);
export const deletePlant = (id) => client.delete(`/api/plants/${id}`);
