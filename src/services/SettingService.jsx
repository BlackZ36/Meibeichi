import api from "./api";

const SettingService = {
  getAll: () => api.get("/settings"),
  getById: (id) => api.get(`/settings/${id}`),
  add: (setting) => api.post("/settings", setting),
  edit: (id, setting) => api.put(`/settings/${id}`, setting),
  delete: (id) => api.delete(`/settings/${id}`),
};

export default SettingService;
