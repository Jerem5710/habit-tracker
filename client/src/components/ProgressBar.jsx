import React from "react";
import "../styles/ProgressBar.css";

export default function ProgressBar({ progress }) {
    return (
        <div className="progress-container">
            <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
            ></div>
            {progress >= 100 && (
                <span className="progress-message">🎉 Goal completed!</span>
            )}
        </div>
    );
}
