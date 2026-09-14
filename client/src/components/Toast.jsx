import React from "react";
import "../styles/Toast.css";

export default function Toast({ message, type }) {
    if (!message) return null;

    return (
        <div className={`toast toast-${type}`}>
            {message}
        </div>
    );
}