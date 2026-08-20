import axios from "axios";

// const devUrl = "http://localhost:3000/api";
const devUrl = "https://inspire-backend-3zkb.onrender.com";

const parentAPI = axios.create({
  baseURL: devUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

parentAPI.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("parent_auth");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore invalid stored auth
  }
  return config;
});

export default parentAPI;
