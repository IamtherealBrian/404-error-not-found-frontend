import React from 'react';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>📖 Welcome to Your Journal</h1>
                <p>Document your thoughts, ideas, and experiences all in one place.</p>
            </header>

            <section className="home-intro">
                <h2>✨ Discover & Reflect</h2>
                <p>Write about your journey, keep track of your experiences, and share insights.</p>
            </section>

            <section className="home-actions">
                <button className="journal-button">Start Writing</button>
                <button className="browse-button">Browse Journals</button>
            </section>
        </div>
    );
}

export default Home;
