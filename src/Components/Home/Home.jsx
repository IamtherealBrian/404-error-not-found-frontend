import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import PropTypes from 'prop-types';

function Home({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    const handleLogout = () => {
        localStorage.removeItem("username");
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <div className="home-container" role="main">
            <header className="home-header">
                <h1>📖 Welcome to Your Journal</h1>
                <p>Document your thoughts, ideas, and experiences all in one place.</p>
            </header>

            <section className="home-intro">
                <h2>✨ Discover & Reflect</h2>
                <p>Write about your journey, keep track of your experiences, and share insights.</p>
            </section>

            <section className="home-actions">
                <div className="start-writing-prompt">
                    <p>🖋️ Ready to capture your thoughts?</p>
                </div>
                <button
                    className="journal-button"
                    onClick={() => navigate('/write')}
                    aria-label="Start a new journal entry"
                >
                    Start Writing
                </button>
                <button
                    className="browse-button"
                    onClick={() => navigate('/people')}
                    aria-label="Browse past journal entries"
                >
                    Browse Journals
                </button>
            </section>

            {isAuthenticated && (
                <section className="auth-section">
                    <p>Login as <strong>{username}</strong></p>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </section>
            )}
        </div>
    );
}

Home.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default Home;
