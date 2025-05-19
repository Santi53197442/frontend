const API_URL = "http://back-production-7af9.up.railway.app/api";

export const login = async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return res.json();
};

export const register = async (userData) => {
    const res = await fetch(`${API_URL}/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    return res.json();
};
