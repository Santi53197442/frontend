import axios from "axios";

const API = axios.create({
    baseURL: "https://back-production-7af9.up.railway.app", // Cambia esto
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
