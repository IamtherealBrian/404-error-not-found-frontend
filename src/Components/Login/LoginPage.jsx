import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import "./LoginPage.css";

const ROLE_OPTIONS = [
    "Author",
    "Consulting Editor",
    "Editor",
    "Managing Editor",
];

const LoginPage = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const endpoint = isLoginMode ? "/login" : "/register";

        try {
            const payload = {
                email: email.trim(),
                password: password.trim()
            };

            if (!isLoginMode) payload.role = role;

            const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload);

            if (response.status === 200 || response.status === 201) {
                localStorage.setItem("username", email.trim());
                const userResp = await axios.get(`${BACKEND_URL}/users?email=${email.trim()}`);
                localStorage.setItem("role", userResp.data.role);
                setIsAuthenticated(true);
                navigate("/");
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid email or password.");
            } else if (err.response?.status === 409) {
                setError("User already exists.");
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2 className="login-title">{isLoginMode ? "Login" : "Register"}</h2>

                {error && <p className="login-error">{error}</p>}

                <label htmlFor="email" className="login-label">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="login-input"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="login-input"
                />

                {!isLoginMode && (
                    <>
                        <label htmlFor="role" className="login-label">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="login-input"
                        >
                            <option value="">Select a role</option>
                            {ROLE_OPTIONS.map(r => (
                                <option key={r} value={r.toLowerCase()}>{r}</option>
                            ))}
                        </select>
                    </>
                )}

                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? "Loading..." : isLoginMode ? "Login" : "Register"}
                </button>

                <p className="login-toggle">
                    {isLoginMode ? "Don't have an account?" : "Already have an account?"} {" "}
                    <button
                        type="button"
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="login-toggle-button"
                    >
                        {isLoginMode ? "Register here" : "Login here"}
                    </button>
                </p>
            </form>
        </div>
    );
};

LoginPage.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default LoginPage;