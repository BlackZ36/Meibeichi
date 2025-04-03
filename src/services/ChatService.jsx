import api from "./api";

const ChatService = {
  getAll: () => api.get("/chats"),
  getById: (id) => api.get(`/chats/${id}`),
  add: (chat) => api.post("/chats", chat),
  edit: (id, chat) => api.put(`/chats/${id}`, chat),
  delete: (id) => api.delete(`/chats/${id}`),
};

export default ChatService;
