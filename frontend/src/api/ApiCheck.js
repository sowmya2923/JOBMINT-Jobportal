import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("Connecting to API at:", apiBaseURL);

const API = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default API;