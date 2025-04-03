import api from "./api";

const ProductService = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  add: (product) => api.post("/products", product),
  edit: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

export default ProductService;
