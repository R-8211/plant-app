import client from './client';

export const getWaterings = (plantId) => client.get(`/api/waterings/${plantId}`).then(r => r.data);
export const createWatering = (plantId, data) => client.post(`/api/waterings/${plantId}`, data).then(r => r.data);
export const deleteWatering = (id) => client.delete(`/api/waterings/${id}`);
