import api from "./api";

const taskInterface = {
  async getTasks() {
    const response = await api.get("/tasks");
    return response.data;
  },

  async addTask(taskData) {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  async updateTask(id, updates) {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  async deleteTask(id) {
    await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskInterface;
