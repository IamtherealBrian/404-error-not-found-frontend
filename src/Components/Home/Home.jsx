import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Home.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_CREATE_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;
const TEXT_UPDATE_ENDPOINT = `${BACKEND_URL}/text`;

function AddTextForm({ visible, cancel, fetchTexts, setError }) {
    const [keyValue, setKeyValue] = useState('');
    const [title, setTitle] = useState('');
    const [textContent, setTextContent] = useState('');

    const changeKey = (e) => setKeyValue(e.target.value);
    const changeTitle = (e) => setTitle(e.target.value);
    const changeText = (e) => setTextContent(e.target.value);

    const addText = async (event) => {
        event.preventDefault();
        const newText = { key: keyValue, title, text: textContent };
        try {
            await axios.post(TEXT_CREATE_ENDPOINT, newText, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            fetchTexts();
            cancel();
        } catch (error) {
            setError(`error: ${error.response?.data?.message || error.message}`);
        }
    };

    if (!visible) return null;
    return (
        <form className="add-text-form">
            <label htmlFor="key">Key</label>
            <input
                required
                type="text"
                id="key"
                value={keyValue}
                onChange={changeKey}
            />

            <label htmlFor="title">Title</label>
            <input
                required
                type="text"
                id="title"
                value={title}
                onChange={changeTitle}
            />

            <label htmlFor="text">Content</label>
            <input
                required
                type="text"
                id="text"
                value={textContent}
                onChange={changeText}
            />

            <button type="button" onClick={cancel}>Cancel</button>
            <button type="submit" onClick={addText}>Submit</button>
        </form>
    );
}

AddTextForm.propTypes = {
    visible: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    fetchTexts: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
};

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

function Home({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const [error, setError] = useState('');
    const [texts, setTexts] = useState([]);
    const [addingText, setAddingText] = useState(false);
    const [loading, setLoading] = useState(false);
    const [updatingText, setUpdatingText] = useState(false);
    const [updateKey, setUpdateKey] = useState('');
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateContent, setUpdateContent] = useState('');

    const fetchTexts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(TEXT_READ_ENDPOINT);
            console.log('Fetched data:', data);

            const textsArray = Array.isArray(data) ? data : textsObjectToArray(data);
            setTexts(textsArray);
        } catch (err) {
            setError({ err });
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
                fetchTexts();
            })
            .catch((error) => {
                setError(`error message: ${error.response?.data?.message || error.message}`);
            });
    };

    // Confirmation wrapper
    const confirmAndDelete = (key) => {
        if (window.confirm("Are you sure you want to delete this journal text?")) {
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
            fetchTexts();
        } catch (error) {
            setError(`error message: ${error.response?.data?.message || error.message}`);
        }
    }, [updateKey, updateTitle, updateContent]);

    const handleLogout = () => {
        localStorage.removeItem("username");
        setIsAuthenticated(false);
        navigate("/login");
    };

    useEffect(() => {
        fetchTexts();
    }, []);

    return (
        <div className="wrapper">
            {isAuthenticated && (
                <section className="auth-section">
                    <p>Login as <strong>{username}</strong></p>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </section>
            )}

            <header>
                <h1>Journal Text</h1>
                <button type="button" onClick={() => setAddingText(true)}>add text</button>
            </header>

            {error && <ErrorMessage message={error} />}

            {loading ? (
                <div>loading...</div>
            ) : (
                texts.map((text) => (
                    <div key={text.key} className="text-item">
                        <h2>{text.title}</h2>
                        <p>{text.text}</p>
                        <button onClick={() => confirmAndDelete(text.key)}>DELETE</button>
                        <button onClick={() => handleUpdate(text)}>UPDATE</button>
                    </div>
                ))
            )}

            {addingText && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close" onClick={() => setAddingText(false)}>&times;</button>
                        <AddTextForm
                            visible={true}
                            cancel={() => setAddingText(false)}
                            fetchTexts={fetchTexts}
                            setError={setError}
                        />
                    </div>
                </div>
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

Home.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default Home;
