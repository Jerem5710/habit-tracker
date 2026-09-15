// src/components/LoadingScreen.jsx
import React, { useEffect, useState } from "react";
import "../styles/LoadingScreen.css"; // optional styling file

export default function LoadingScreen({ message = "Loading..." }) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // When component unmounts, trigger fade-out
        return () => setFadeOut(true);
    }, []);

    return (
        <div className={`loading-screen ${fadeOut ? "fade-out" : "fade-in"}`}>
            <div className="spinner"></div>
            <p>{message}</p>
        </div>
    );
}
