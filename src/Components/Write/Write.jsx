import React, { useState } from 'react';
import './Write.css';

const Write = () => {
    const [entry, setEntry] = useState('');
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    const handleSubmit = () => {
        alert('Journal entry submitted!');
        setEntry('');
        setShowPlaceholder(true);
    };

    const handleFocus = () => {
        setShowPlaceholder(false);
    };

    const handleBlur = () => {
        if (entry.trim() === '') {
            setShowPlaceholder(true);
        }
    };

    return (
        <div className="write-container">
            <h1>New Journal Entry ✍️</h1>
            <div className="journal-section">
                <textarea
                    placeholder={showPlaceholder ? "Write your thoughts here..." : ""}
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
