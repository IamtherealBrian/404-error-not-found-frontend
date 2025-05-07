import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Submission.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;
const TEXT_UPDATE_ENDPOINT = `${BACKEND_URL}/text`;
const MANUSCRIPT_CREATE_ENDPOINT = `${BACKEND_URL}/manuscript/create`;

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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newManuscript, setNewManuscript] = useState({
        title: '', author: '', author_email: '',
        text: '', abstract: '', editor_email: '', curr_state: 'SUB'
    });

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

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewManuscript(prev => ({ ...prev, [name]: value }));
    };

    const createManuscript = async () => {
        try {
            // 创建一个新的对象，将 curr_state 改为 state
            const requestData = {
                ...newManuscript,
                state: newManuscript.curr_state,
            };
            delete requestData.curr_state;

            console.log('Sending manuscript data:', requestData);

            const resp = await axios.post(MANUSCRIPT_CREATE_ENDPOINT, requestData, {
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            console.log('Server response:', resp.data);
            
            if (resp.status === 200) {
                setShowCreateForm(false);
                setNewManuscript({
                    title: '', author: '', author_email: '',
                    text: '', abstract: '', editor_email: '', curr_state: 'SUB'
                });
                navigate('/dashboard');
            } else {
                setError(`Create failed: ${resp.status}`);
            }
        } catch (err) {
            console.error('Error details:', err.response?.data || err.message);
            console.error('Request data:', newManuscript);
            setError(`Error creating manuscript: ${err.response?.data?.message || err.message}`);
        }
    };

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

            <button onClick={() => setShowCreateForm(prev => !prev)}>
                {showCreateForm ? "Cancel Create" : "Submit"}
            </button>

            {showCreateForm && (
                <div className="submission-create-form">
                    <h3>Submit</h3>
                    <label>Title:<br/><input name="title" value={newManuscript.title} onChange={handleNewChange} /></label><br/>
                    <label>Author:<br/><input name="author" value={newManuscript.author} onChange={handleNewChange} /></label><br/>
                    <label>Author Email:<br/><input name="author_email" value={newManuscript.author_email} onChange={handleNewChange} /></label><br/>
                    <label>Abstract:<br/><textarea name="abstract" className="large-textarea" value={newManuscript.abstract} onChange={handleNewChange} /></label><br/>
                    <label>Text:<br/><textarea name="text" className="large-textarea" value={newManuscript.text} onChange={handleNewChange} /></label><br/>
                    <label>Editor Email:<br/><input name="editor_email" value={newManuscript.editor_email} onChange={handleNewChange} /></label><br/>
                    <label>Initial State:<br/>
                        <select name="curr_state" value={newManuscript.curr_state} onChange={handleNewChange}>
                            <option value="SUB">Submitted</option>
                            <option value="REF">Referee Review</option>
                            <option value="AUTH">Author Revisions</option>
                            <option value="EDIT">Editor Review</option>
                            <option value="COPY">Copy Edit</option>
                            <option value="AUTH_REV">Author Review</option>
                            <option value="FORM">Formatting</option>
                            <option value="PUB">Published</option>
                            <option value="REJ">Rejected</option>
                            <option value="WITH">Withdrawn</option>
                        </select>
                    </label><br/>
                    <button onClick={createManuscript}>Submit</button>
                </div>
            )}

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