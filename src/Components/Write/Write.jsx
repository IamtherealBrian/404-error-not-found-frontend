import React, { useState } from 'react';
import './Write.css';

const Write = () => {
    const [entry, setEntry] = useState('');

    const handleSubmit = () => {
        alert('Journal entry submitted!');
        setEntry('');
    };

    return (
        <div className="write-container">
            <h1>New Journal Entry ✍️</h1>
            <div className="journal-section">
                <textarea
                    placeholder="Write your thoughts here..."
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="journal-input"
                />
                <button className="submit-entry" onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Write;
