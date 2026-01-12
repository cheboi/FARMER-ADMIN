import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-card">
      <h2>Admin Login</h2>
      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Login</button>
    </form>
  );
}
