// Set VITE_API_URL when the API is deployed on another host.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

export const isAdmin = (role) => String(role || "").trim().toUpperCase() === "ADMIN";
