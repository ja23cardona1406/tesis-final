import axios from "axios";
import { supabase } from "../lib/supabase.js"; // Asegurar que el archivo existe y está en la ruta correcta

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
};

export const register = (name: string, email: string, password: string) =>
  api.post("/users/register", { name, email, password });

export const createDairyRecord = (data: {
  production_liters: number;
  temperature: number;
  humidity: number;
  feed_amount: number;
}) => api.post("/records", data);

export const getDairyRecords = () => api.get("/records");

export const getCows = () => api.get("/cows");

export default api;
