import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("@vagaflow:token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "A API demorou para responder. Tente novamente.";
    }
    if (!error.response) {
      error.message =
        "Nao foi possivel conectar com a API. Verifique o backend e a URL configurada.";
    }
    return Promise.reject(error);
  },
);
