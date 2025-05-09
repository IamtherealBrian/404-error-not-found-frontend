import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Submission.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// API Endpoints
const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;
const TEXT_UPDATE_ENDPOINT = `${BACKEND_URL}/text`;
const MANUSCRIPT_CREATE_ENDPOINT = `${BACKEND_URL}/manuscript/create`;

// Form Fields
const FORM_FIELDS = {
    TITLE: 'title',
    AUTHOR: 'author',
    AUTHOR_EMAIL: 'author_email',
    TEXT: 'text',
    ABSTRACT: 'abstract',
    EDITOR_EMAIL: 'editor_email',
    CURR_STATE: 'curr_state',
    STATE: 'state',
    KEY: 'key'
};

// Manuscript States
const MANUSCRIPT_STATES = {
    SUBMITTED: 'SUB',
    REFEREE_REVIEW: 'REF',
    AUTHOR_REVISIONS: 'AUTH',
    EDITOR_REVIEW: 'EDIT',
    COPY_EDIT: 'COPY',
    AUTHOR_REVIEW: 'AUTH_REV',
    FORMATTING: 'FORM',
    PUBLISHED: 'PUB',
    REJECTED: 'REJ',
    WITHDRAWN: 'WITH'
};

// State Display Names
const STATE_DISPLAY_NAMES = {
    [MANUSCRIPT_STATES.SUBMITTED]: 'Submitted',
    [MANUSCRIPT_STATES.REFEREE_REVIEW]: 'Referee Review',
    [MANUSCRIPT_STATES.AUTHOR_REVISIONS]: 'Author Revisions',
    [MANUSCRIPT_STATES.EDITOR_REVIEW]: 'Editor Review',
    [MANUSCRIPT_STATES.COPY_EDIT]: 'Copy Edit',
    [MANUSCRIPT_STATES.AUTHOR_REVIEW]: 'Author Review',
    [MANUSCRIPT_STATES.FORMATTING]: 'Formatting',
    [MANUSCRIPT_STATES.PUBLISHED]: 'Published',
    [MANUSCRIPT_STATES.REJECTED]: 'Rejected',
    [MANUSCRIPT_STATES.WITHDRAWN]: 'Withdrawn'
};

// Messages
const MESSAGES = {
    DELETE_CONFIRM: 'Are you sure you want to delete this submission text?',
    CREATE_FAILED: (status) => `Create failed: ${status}`,
    FETCH_ERROR: (err) => `Error fetching submission text: ${err.message || JSON.stringify(err)}`,
    CREATE_ERROR: (err) => `Error creating manuscript: ${getSafeValue(err, 'response.data.message') || err.message}`,
    DELETE_ERROR: (err) => `error message: ${getSafeValue(err, 'response.data.message') || err.message}`
};

// Safe object access helper
const getSafeValue = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    return path.split('.').reduce((curr, key) => 
        (curr && typeof curr === 'object' ? curr[key] : defaultValue), obj);
};

function ErrorMessage({ message }) {
    return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
    message: PropTypes.string.isRequired,
};

function textsObjectToArray(data) {
    if (!data || typeof data !== 'object') return [];
    const keys = Object.keys(data);
    return keys.map(dictKey => ({
        ...data[dictKey],
        [FORM_FIELDS.KEY]: dictKey
    }));
}

// Initial manuscript state
const INITIAL_MANUSCRIPT_STATE = {
    [FORM_FIELDS.TITLE]: '',
    [FORM_FIELDS.AUTHOR]: '',
    [FORM_FIELDS.AUTHOR_EMAIL]: '',
    [FORM_FIELDS.TEXT]: '',
    [FORM_FIELDS.ABSTRACT]: '',
    [FORM_FIELDS.EDITOR_EMAIL]: '',
    [FORM_FIELDS.CURR_STATE]: MANUSCRIPT_STATES.SUBMITTED
};

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
    const [newManuscript, setNewManuscript] = useState(INITIAL_MANUSCRIPT_STATE);

    const fetchSubmissionText = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(TEXT_READ_ENDPOINT);
            console.log('Fetched data:', data);

            const textsArray = Array.isArray(data) ? data : textsObjectToArray(data);

            // Find the SubmissionPage entry
            const submissionPage = textsArray.find(text => getSafeValue(text, FORM_FIELDS.KEY) === 'SubmissionPage');
            setSubmissionText(submissionPage);
        } catch (err) {
            setError(MESSAGES.FETCH_ERROR(err));
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
                setError(MESSAGES.DELETE_ERROR(error));
            });
    };

    const confirmAndDelete = (key) => {
        if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
            deleteText(key);
        }
    };

    const handleUpdate = (text) => {
        setUpdatingText(true);
        setUpdateKey(getSafeValue(text, FORM_FIELDS.KEY));
        setUpdateTitle(getSafeValue(text, FORM_FIELDS.TITLE));
        setUpdateContent(getSafeValue(text, FORM_FIELDS.TEXT));
    };

    const updateText = useCallback(async (event) => {
        event.preventDefault();
        const updatedData = {
            [FORM_FIELDS.KEY]: updateKey,
            [FORM_FIELDS.TITLE]: updateTitle,
            [FORM_FIELDS.TEXT]: updateContent
        };
        try {
            await axios.put(TEXT_UPDATE_ENDPOINT, updatedData, {
                headers: { "Content-Type": "application/json", "Accept": "application/json" }
            });
            setUpdatingText(false);
            fetchSubmissionText();
        } catch (error) {
            setError(MESSAGES.DELETE_ERROR(error));
        }
    }, [updateKey, updateTitle, updateContent]);

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewManuscript(prev => ({ ...prev, [name]: value }));
    };

    const createManuscript = async () => {
        try {
            const requestData = {
                ...newManuscript,
                [FORM_FIELDS.STATE]: newManuscript[FORM_FIELDS.CURR_STATE]
            };
            delete requestData[FORM_FIELDS.CURR_STATE];

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
                setNewManuscript(INITIAL_MANUSCRIPT_STATE);
                navigate('/dashboard');
            } else {
                setError(MESSAGES.CREATE_FAILED(resp.status));
            }
        } catch (err) {
            console.error('Error details:', getSafeValue(err, 'response.data') || err.message);
            console.error('Request data:', newManuscript);
            setError(MESSAGES.CREATE_ERROR(err));
        }
    };

    useEffect(() => {
        fetchSubmissionText();
    }, []);

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
                    <label>Title:<br/><input name={FORM_FIELDS.TITLE} value={getSafeValue(newManuscript, FORM_FIELDS.TITLE)} onChange={handleNewChange} /></label><br/>
                    <label>Author:<br/><input name={FORM_FIELDS.AUTHOR} value={getSafeValue(newManuscript, FORM_FIELDS.AUTHOR)} onChange={handleNewChange} /></label><br/>
                    <label>Author Email:<br/><input name={FORM_FIELDS.AUTHOR_EMAIL} value={getSafeValue(newManuscript, FORM_FIELDS.AUTHOR_EMAIL)} onChange={handleNewChange} /></label><br/>
                    <label>Abstract:<br/><textarea name={FORM_FIELDS.ABSTRACT} className="large-textarea" value={getSafeValue(newManuscript, FORM_FIELDS.ABSTRACT)} onChange={handleNewChange} /></label><br/>
                    <label>Text:<br/><textarea name={FORM_FIELDS.TEXT} className="large-textarea" value={getSafeValue(newManuscript, FORM_FIELDS.TEXT)} onChange={handleNewChange} /></label><br/>
                    <label>Editor Email:<br/><input name={FORM_FIELDS.EDITOR_EMAIL} value={getSafeValue(newManuscript, FORM_FIELDS.EDITOR_EMAIL)} onChange={handleNewChange} /></label><br/>
                    <label>Initial State:<br/>
                        <select name={FORM_FIELDS.CURR_STATE} value={getSafeValue(newManuscript, FORM_FIELDS.CURR_STATE)} onChange={handleNewChange}>
                            {Object.entries(STATE_DISPLAY_NAMES).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </label><br/>
                    <button onClick={createManuscript}>Submit</button>
                </div>
            )}

            {loading ? (
                <div>Loading...</div>
            ) : submissionText ? (
                <div key={getSafeValue(submissionText, FORM_FIELDS.KEY)} className="text-item">
                    <h2>{getSafeValue(submissionText, FORM_FIELDS.TITLE)}</h2>
                    <p>{getSafeValue(submissionText, FORM_FIELDS.TEXT)}</p>
                    <button onClick={() => confirmAndDelete(getSafeValue(submissionText, FORM_FIELDS.KEY))}>DELETE</button>
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