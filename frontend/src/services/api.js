import axios from "axios";

const api = axios.create({
  baseURL: "https://printcafe-api.onrender.com/api",
});

export default api;