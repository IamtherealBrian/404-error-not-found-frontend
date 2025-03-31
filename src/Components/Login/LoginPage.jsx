import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import "./LoginPage.css";

const LoginPage = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const endpoint = isLoginMode ? "/login" : "/register";

        try {
            const response = await axios.post(`${BACKEND_URL}${endpoint}`, {
                email: email.trim(),
                password: password.trim()
            });

            if (response.status === 200 || response.status === 201) {
                localStorage.setItem("username", email.trim());
                setIsAuthenticated(true);
                // To refresh
                navigate("/");
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid email or password.");
            } else if (err.response?.status === 409) {
                setError("User already exists.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2 className="login-title">
                    {isLoginMode ? "Login" : "Register"}
                </h2>

                {error && <p className="login-error">{error}</p>}

                {/*<input*/}
                {/*    type="email"*/}
                {/*    value={email}*/}
                {/*    onChange={(e) => setEmail(e.target.value)}*/}
                {/*    placeholder="Email"*/}
                {/*    required*/}
                {/*    className="login-input"*/}
                {/*/>*/}
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

                {/*<button type="submit" className="login-button">*/}
                {/*    {isLoginMode ? "Login" : "Register"}*/}
                {/*</button>*/}

                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? "Loading..." : isLoginMode ? "Login" : "Register"}
                </button>

                <p className="login-toggle">
                    {isLoginMode
                        ? "Don't have an account?"
                        : "Already have an account?"}{" "}
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
