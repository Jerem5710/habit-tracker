import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Toast from "./components/Toast.jsx"; 
import { ToastContext } from "./context/ToastContext.jsx"; // import the context

export default function App() {
    const [toast, setToast] = useState(null);

    function showToast(message, type = "success", duration = 3000) {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }
    return (
        <ToastContext.Provider value={ showToast }>
        <BrowserRouter>
            {/* Toast is global, always mounted */}
            {toast && <Toast message={toast.message} type={toast.type} />}
            <Routes>
                <Route path="/" element={<Login />} />   {/* default route */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
        </ToastContext.Provider>
    );
}
