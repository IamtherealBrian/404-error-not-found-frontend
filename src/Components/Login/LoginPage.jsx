import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("User logged in:", { email, password });
        navigate("/");
    };

    // Container uses a green-themed gradient
    const containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #8CC152, #009444)",
    };

    // Form styling
    const formStyle = {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "300px",
    };

    // Input styling
    const inputStyle = {
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "16px",
    };

    // Button with a green color to match the theme
    const buttonStyle = {
        padding: "10px",
        border: "none",
        borderRadius: "4px",
        backgroundColor: "#009444",
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
    };

    const titleStyle = {
        textAlign: "center",
        marginBottom: "10px",
        fontFamily: "sans-serif",
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={titleStyle}>Login</h2>
                <input
                    style={inputStyle}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    style={inputStyle}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit" style={buttonStyle}>Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
