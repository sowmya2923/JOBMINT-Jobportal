import React, { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/ApiCheck";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check session when page reloads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // LOGIN FUNCTION
  const loginUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);

    const role = data.user?.role;
    if (role === "admin") navigate("/admin/profile");
    else if (role === "recruiter") navigate("/recruiter/profile");
    else if (role === "jobseeker") navigate("/jobseeker/profile");
    else navigate("/");
  };

  // UPDATE USER FUNCTION (Sync after profile edit)
  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  // LOGOUT FUNCTION
  const logoutUser = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout: logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
