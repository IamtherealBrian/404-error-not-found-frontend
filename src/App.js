import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import People from './Components/People/People';
import LoginPage from './Components/Login/LoginPage';
import Dashboard from './Components/Dashboard/Dashboard';
import DashboardDetail from './Components/Dashboard/DashboardDetail';
import Masthead from './Components/Masthead';
import PeopleDetail from './Components/People/PeopleDetail';
import Submission from './Components/Submissions/Submission';

import './App.css';

// function PersonPage() {
//     return <h1>Person Page</h1>;
// }

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
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem("username"));
        };
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);


    return (
        <BrowserRouter>
            <Navbar isAuthenticated={isAuthenticated} />
            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/" element={<ProtectedRoute element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} />} />
                <Route path="/people/:name" element={<ProtectedRoute element={<PeopleDetail />} isAuthenticated={isAuthenticated} />} />
                <Route path="/people" element={<ProtectedRoute element={<People />} isAuthenticated={isAuthenticated} />} />
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />
                <Route path="/dashboard/:title" element={<ProtectedRoute element={<DashboardDetail />} isAuthenticated={isAuthenticated} />} />
                <Route path="/masthead" element={<ProtectedRoute element={<Masthead />} isAuthenticated={isAuthenticated} />} />
                <Route path="/submission" element={<ProtectedRoute element={<Submission isAuthenticated={isAuthenticated} />} isAuthenticated={isAuthenticated} />} />
                
                {/* Redirects from old paths to new paths */}
                <Route path="/submissions" element={<Navigate to="/dashboard" replace />} />
                <Route path="/submissions/:title" element={<Navigate to={location => `/dashboard/${location.pathname.split('/').pop()}`} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
