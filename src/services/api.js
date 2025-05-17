import axios from "axios";

const API = axios.create({
    baseURL: "https://<TU_BACKEND>.railway.app", // Cambia esto
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
