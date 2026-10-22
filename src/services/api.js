import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Analytics Endpoints
export const getAgentWorkload = () => API.get('/users/analytics/workload');
export const getSLAViolations = () => API.get('/tickets/analytics/sla-violations');
export const getResolutionMetrics = () => API.get('/tickets/analytics/resolution-metrics');
export const getQueueVolume = () => API.get('/tickets/analytics/queue-volume');
export const getFRTMetrics = () => API.get('/messages/analytics/frt');

// Ticket CRUD Endpoints
export const getTickets = () => API.get('/tickets');
export const getTicketById = (id) => API.get(`/tickets/${id}`);
export const updateTicket = (id, payload) => API.put(`/tickets/${id}`, payload);
export const deleteTicket = (id, actorId) => API.delete(`/tickets/${id}`, { data: { actorId } });

// Messaging Endpoints
export const getTicketMessages = (ticketId, includeInternal = true) =>
  API.get(`/messages/ticket/${ticketId}?includeInternal=${includeInternal}`);
export const sendMessage = (payload) => API.post('/messages', payload);

export default API;