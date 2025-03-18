import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import Write from './Components/Write/Write';
import Texts from './Components/Texts';
import People from './Components/People/People';
import LoginPage from './Components/Login/LoginPage';
import './App.css';

function PersonPage() {
    return <h1>Person Page</h1>;
}

function ProtectedRoute({ element, isAuthenticated }) {
    return isAuthenticated ? element : <Navigate to="/login" />;
}

ProtectedRoute.propTypes = {
    element: PropTypes.node.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("username"));
    useEffect(() => {
        const checkAuth = () => setIsAuthenticated(!!localStorage.getItem("username"));
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/" element={<ProtectedRoute element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} />} />
                <Route path="/write" element={<ProtectedRoute element={<Write />} isAuthenticated={isAuthenticated} />} />
                <Route path="/people/:name" element={<ProtectedRoute element={<PersonPage />} isAuthenticated={isAuthenticated} />} />
                <Route path="/texts" element={<ProtectedRoute element={<Texts />} isAuthenticated={isAuthenticated} />} />
                <Route path="/people" element={<ProtectedRoute element={<People />} isAuthenticated={isAuthenticated} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
