import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import "./LoginPage.css";

const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;

const LoginPage = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [people, setPeople] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const { data } = await axios.get(PEOPLE_READ_ENDPOINT);
                setPeople(Object.values(data));
            } catch (error) {
                if (error.response) {
                    setError(`Fetch failed with status ${error.response.status}: ${error.response.data.message || 'Unknown server error.'}`);
                } else if (error.request) {
                    setError("No response received from server. Please check your connection or try again later.");
                } else {
                    setError(`An unexpected error occurred: ${error.message}`);
                }
            }
        };
        fetchPeople();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        const user = people.find(person => person.email === email.trim() && person.name === name.trim());
        if (user) {
            localStorage.setItem("username", user.name);
            setIsAuthenticated(true);
            navigate("/");
        } else {
            setError("Invalid email or name. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2 className="login-title">Login</h2>
                {error && <p className="login-error">{error}</p>}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="login-input"
                />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    className="login-input"
                />
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

LoginPage.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default LoginPage;
