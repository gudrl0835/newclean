import api from './axios';

export const chatApi = {
  getChatRooms: () => api.get('/api/chat/rooms'),
  getMessages: (roomId) => api.get(`/api/chat/rooms/${roomId}/messages`),
};
