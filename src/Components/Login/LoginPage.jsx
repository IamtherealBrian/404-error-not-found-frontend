import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { BACKEND_URL } from "../../constants";

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
                setError("Unable to fetch users, please check your connection.");
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(to right, #8CC152, #009444)" }}>
            <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column", gap: "20px", width: "300px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "10px", fontFamily: "sans-serif" }}>Login</h2>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "16px" }}
                />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "16px" }}
                />
                <button type="submit" style={{ padding: "10px", border: "none", borderRadius: "4px", backgroundColor: "#009444", color: "white", fontSize: "16px", cursor: "pointer" }}>Login</button>
            </form>
        </div>
    );
};

LoginPage.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default LoginPage;
