import axios from "axios";

const api = axios.create({
  baseURL: "http://10.241.118.228:3000/api"
});

export default api;