import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cyberCafeName, setCyberCafeName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        cyberCafeName,
      });

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <h1>CyberCafe</h1>
        <p className="register-subtitle">Create your cybercafé owner account</p>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Cybercafé Name</label>
            <input
              type="text"
              placeholder="Enter cybercafé name"
              value={cyberCafeName}
              onChange={(e) => setCyberCafeName(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-login">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
