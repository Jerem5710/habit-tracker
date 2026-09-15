import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import LoadingScreen from "../components/LoadingScreen"; // optional loading screen component
import "../styles/Login.css";

import habitLogo from "../assets/habit-tracker.png";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const showToast = useToast();
    const [loading, setLoading] = useState(false); // optional loading state

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true); // Show loading screen while logging in
        try {
        const data = await login(form.email, form.password);
        if (data.token) {
            localStorage.setItem("token", data.token);

            // Fetch current user from backend
            const res = await fetch("http://localhost:5000/auth/me", {
                headers: { Authorization: `Bearer ${data.token}` },
            });
            const currentUser = await res.json();
            localStorage.setItem("user", JSON.stringify(currentUser)); // optional: persist user
            // or setUser(currentUser) if you lift state up via context
            
            navigate("/dashboard"); // go to dashboard after login
        } else {
            setError("Invalid email or password");
            showToast("Login failed", "error"); // show toast on login failure
        }
        } catch (err) {
            setError("Server error, please try again");
            showToast("Error logging in", "error"); // show toast on server error
        } finally {
            setTimeout(() => setLoading(false), 500); // Hide loading screen after login attempt
        }
    }

    if (loading) {
        return <LoadingScreen message="Signing you in..." />;
    }

    return (
        <PageWrapper>
            <div className="auth-card">
            <div className="app-logo">
                <img src={habitLogo} alt="Habit Tracker Logo" className="logo-img" />
                <h1 className="logo-text">Habit Tracker</h1>
            </div>
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                    {error && <p className="error-message">{error}</p>}
            <button type="submit">Login</button>

            {/* Register button */}
            <p>
                Don’t have an account?{" "}
                <Link to="/register">Register here</Link>
            </p>
            </form>
            </div>
        </PageWrapper>
    );
}
