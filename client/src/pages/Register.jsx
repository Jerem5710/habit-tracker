import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import PageWrapper from "../components/PageWrapper";
import LoadingScreen from "../components/LoadingScreen";
import "../styles/Register.css";

import habitLogo from "../assets/habit-tracker.png";
import logoutIcon from "../assets/logout.svg";

export default function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // optional loading state

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true); // Show loading screen while registering
        try {
            const data = await register(form.username, form.email, form.password);
            if (data) {
                navigate("/login"); // redirect after success
            }
        } catch (err) {
            console.error("Registration failed:", err);
        } finally {
            setTimeout(() => setLoading(false), 500); // Hide loading screen after registration attempt
        }
    }

    if (loading) {
        return <LoadingScreen message="Creating your account..." />;
    }

    return (
        <PageWrapper>
            <div className="auth-card">
            <div className="app-logo">
                <img src={habitLogo} alt="Habit Tracker Logo" className="logo-img" />
                <h1 className="logo-text">Habit Tracker</h1>
            </div>
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
            />
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
                    <button type="submit">Register</button>
                    {/* Go to Login button */}
                    <Link to="/login" className="login-redirect-btn">
                        <img src={logoutIcon} alt="Login" className="icon white-icon" />Go to Login
                    </Link>
                </form>
            </div>
        </PageWrapper>
    );
}
