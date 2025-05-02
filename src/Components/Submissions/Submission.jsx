import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Submission.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;
const TEXT_UPDATE_ENDPOINT = `${BACKEND_URL}/text`;

function ErrorMessage({ message }) {
    return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
    message: PropTypes.string.isRequired,
};

function textsObjectToArray(data) {
    const keys = Object.keys(data);
    return keys.map(dictKey => ({ ...data[dictKey], key: dictKey }));
}

function Submission({ isAuthenticated }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [submissionText, setSubmissionText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updatingText, setUpdatingText] = useState(false);
    const [updateKey, setUpdateKey] = useState('');
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateContent, setUpdateContent] = useState('');

    const fetchSubmissionText = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(TEXT_READ_ENDPOINT);
            console.log('Fetched data:', data);

            const textsArray = Array.isArray(data) ? data : textsObjectToArray(data);
            
            // Find the SubmissionPage entry
            const submissionPage = textsArray.find(text => text.key === 'SubmissionPage');
            setSubmissionText(submissionPage);
        } catch (err) {
            setError(`Error fetching submission text: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteText = (key) => {
        axios.delete(TEXT_DELETE_ENDPOINT, {
            data: { key },
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
            .then(() => {
                fetchSubmissionText();
            })
            .catch((error) => {
                setError(`error message: ${error.response?.data?.message || error.message}`);
            });
    };

    // Confirmation wrapper
    const confirmAndDelete = (key) => {
        if (window.confirm("Are you sure you want to delete this submission text?")) {
            deleteText(key);
        }
    };

    const handleUpdate = (text) => {
        setUpdatingText(true);
        setUpdateKey(text.key);
        setUpdateTitle(text.title);
        setUpdateContent(text.text);
    };

    const updateText = useCallback(async (event) => {
        event.preventDefault();
        const updatedData = { key: updateKey, title: updateTitle, text: updateContent };
        try {
            await axios.put(TEXT_UPDATE_ENDPOINT, updatedData, {
                headers: { "Content-Type": "application/json", "Accept": "application/json" }
            });
            setUpdatingText(false);
            fetchSubmissionText();
        } catch (error) {
            setError(`error message: ${error.response?.data?.message || error.message}`);
        }
    }, [updateKey, updateTitle, updateContent]);

    useEffect(() => {
        fetchSubmissionText();
    }, []);

    // If not authenticated, redirect to login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="wrapper">
            {error && <ErrorMessage message={error} />}

            {loading ? (
                <div>Loading...</div>
            ) : submissionText ? (
                <div key={submissionText.key} className="text-item">
                    <h2>{submissionText.title}</h2>
                    <p>{submissionText.text}</p>
                    <button onClick={() => confirmAndDelete(submissionText.key)}>DELETE</button>
                    <button onClick={() => handleUpdate(submissionText)}>UPDATE</button>
                </div>
            ) : (
                <div>No submission guidelines found</div>
            )}

            {updatingText && (
                <form onSubmit={updateText} className="update-form">
                    <div className="key-display">{updateKey}</div>
                    <label>New Title:</label>
                    <input type="text" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)}/>
                    <label>New Content:</label>
                    <input type="text" value={updateContent} onChange={(e) => setUpdateContent(e.target.value)}/>
                    <div className="button-group">
                        <button type="button" onClick={() => setUpdatingText(false)}>Cancel</button>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            )}
        </div>
    );
}

Submission.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired
};

export default Submission; 