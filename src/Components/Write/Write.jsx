import React, { useState } from 'react';
import './Write.css';

const Write = () => {
    const [entry, setEntry] = useState('');
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    // const handleSubmit = () => {
    //     alert('Journal entry submitted!');
    //     setEntry('');
    //     setShowPlaceholder(true);
    // };
    const handleSubmit = () => {
        // 1) Prevent empty submissions
        if (entry.trim().length === 0) {
            alert('Please write something before submitting!');
            return;
        }

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

    const countWords = (text) => {
        return text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
    };

    const handleClear = () => {
        setEntry('');
        setShowPlaceholder(true);
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

                {/* 2) Add a character count display */}
                <div className="character-count">
                    Characters: {entry.length}
                </div>

                <div className="word-count">
                    Words: {countWords(entry)}
                </div>
                <button className="submit-entry" onClick={handleSubmit}>
                    Submit
                </button>
                <button className="clear-entry" onClick={handleClear}>
                    Clear
                </button>
            </div>
        </div>
    );
};

export default Write;
