import api from './axios';

export const getChatRooms = () => api.get('/chat/rooms');
export const getMessages = (roomId) => api.get(`/chat/rooms/${roomId}/messages`);
