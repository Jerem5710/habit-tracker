import React from "react";
import "../styles/Modal.css";

export default function Modal({ show, title, children, onClose }) {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>{title}</h3>
                <div className="modal-content">{children}</div>
                <button className="modal-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}