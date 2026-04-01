import axios from "axios";

let apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// AUTO-FIX: If the URL doesn't end with /api, add it automatically
if (apiBaseURL && !apiBaseURL.endsWith("/api")) {
  apiBaseURL = apiBaseURL.endsWith("/") ? `${apiBaseURL}api` : `${apiBaseURL}/api`;
}

console.log("Connecting to API at:", apiBaseURL);

const API = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default API;