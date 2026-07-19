import api from './axios';

export const getChatRooms = () => api.get('/api/chat/rooms');
export const getMessages = (roomId) => api.get(`/api/chat/rooms/${roomId}/messages`);

// 업체와의 채팅방 열기 (없으면 생성) - 의뢰 확정 전 가격 협상 등 1:1 문의용
export const openRoomWithCompany = (companyId) => api.post(`/api/chat/rooms/company/${companyId}`);
