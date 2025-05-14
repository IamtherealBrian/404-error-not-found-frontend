import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Dashboard.css';

const MANUSCRIPT_READ_ENDPOINT   = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_UPDATE_ENDPOINT = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT = `${BACKEND_URL}/manuscript/delete`;

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx';

const FORM_FIELDS = {
    TITLE: 'title',
    AUTHOR: 'author',
    AUTHOR_EMAIL: 'author_email',
    ABSTRACT: 'abstract',
    TEXT: 'text',
    EDITOR_EMAIL: 'editor_email',
    STATE: 'state',
    FILE: 'file'
};

const MESSAGES = {
    DELETE_CONFIRM: (title) => `Delete "${title}"?`,
    DISCARD_CHANGES: 'Discard your changes?',
    UPDATE_ERROR: (status) => `Update failed: ${status}`,
    DELETE_ERROR: (status) => `Delete failed: ${status}`,
    FETCH_ERROR: (message) => `Error fetching manuscripts: ${message}`,
    UPDATE_ERROR_DETAIL: (message) => `Error updating manuscript: ${message}`,
    DELETE_ERROR_DETAIL: (message) => `Error deleting manuscript: ${message}`
};

const STATE_TRANSITIONS = {
    SUB: ['REJ', 'REF'],
    REF: ['REJ', 'SUB', 'COPY', 'AUTH'],
    AUTH: ['EDIT'],
    EDIT: ['COPY'],
    COPY: ['AUTH'],
    AUTH_REV: ['FORM'],
    FORM: ['PUB'],
    PUB: [],
    REJ: [],
    WITH: []
};

const STATE_DISPLAY_NAMES = {
    SUB: 'Submitted',
    REF: 'Referee Review',
    AUTH: 'Author Revisions',
    EDIT: 'Editor Review',
    COPY: 'Copy Edit',
    AUTH_REV: 'Author Review',
    FORM: 'Formatting',
    PUB: 'Published',
    REJ: 'Rejected',
    WITH: 'Withdrawn'
};

const getNextPossibleStates = (state) => STATE_TRANSITIONS[state] || [];
const getStateDisplayName = (code) => STATE_DISPLAY_NAMES[code] || code;

const STATE_CODE_ORDER = [
    'SUB', 'REF', 'AUTH', 'EDIT', 'COPY', 'AUTH_REV', 'FORM', 'PUB'
];

const getSafeValue = (obj, key, defaultValue = '') => {
    return obj && typeof obj === 'object' ? obj[key] || defaultValue : defaultValue;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError] = useState('');
    const [editingManuscript, setEditingManuscript] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [editedFile, setEditedFile] = useState(null);

    const currentRole = localStorage.getItem("role");
    const currentUser = localStorage.getItem("username");
    const isEditor = ["editor", "consulting editor", "managing editor"].includes(currentRole);
    const isAuthor = currentRole === "author";

    useEffect(() => {
        fetchManuscripts();
    }, []);

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            const all = Object.values(data);

            const filtered = all.filter(m => {
                if (m.state === 'REJ' || m.state === 'WITH') {
                    return false;
                }
                if (isEditor) {
                    return true;
                }
                if (isAuthor) {
                    return m.author_email === currentUser;
                }
                return false;
            });
            
            const sorted = filtered.sort((a, b) => {
                const ia = STATE_CODE_ORDER.indexOf(a.state);
                const ib = STATE_CODE_ORDER.indexOf(b.state);
                const pa = ia === -1 ? STATE_CODE_ORDER.length : ia;
                const pb = ib === -1 ? STATE_CODE_ORDER.length : ib;
                return pa - pb;
            });

            setManuscripts(sorted);
        } catch (err) {
            setError(MESSAGES.FETCH_ERROR(err.message));
        }
    };

    const startEditing = (m) => {
        setEditingManuscript(getSafeValue(m, FORM_FIELDS.TITLE));
        setEditedData({ ...m });
        setEditedFile(null);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFileChange = (e) => {
        setEditedFile(e.target.files[0]);
    };

    const cancelEditing = () => {
        if (!window.confirm(MESSAGES.DISCARD_CHANGES)) return;
        setEditingManuscript(null);
        setEditedData({});
        setEditedFile(null);
    };

    const updateManuscript = async () => {
        try {
            const formData = new FormData();
            Object.keys(editedData).forEach(key => {
                formData.append(key, getSafeValue(editedData, key));
            });
            if (editedFile) formData.append(FORM_FIELDS.FILE, editedFile);

            const resp = await axios.put(MANUSCRIPT_UPDATE_ENDPOINT, formData);
            if (resp.status === 200) {
                fetchManuscripts();
                setEditingManuscript(null);
            } else {
                setError(MESSAGES.UPDATE_ERROR(resp.status));
            }
        } catch (err) {
            setError(MESSAGES.UPDATE_ERROR_DETAIL(err.message));
        }
    };

    const deleteManuscript = async (title) => {
        if (!window.confirm(MESSAGES.DELETE_CONFIRM(title))) return;
        try {
            const resp = await axios.delete(MANUSCRIPT_DELETE_ENDPOINT, {
                data: { title }
            });
            if (resp.status === 200) {
                fetchManuscripts();
            } else {
                setError(MESSAGES.DELETE_ERROR(resp.status));
            }
        } catch (err) {
            setError(MESSAGES.DELETE_ERROR_DETAIL(err.message));
        }
    };

    const updateManuscriptStateToWithdraw = async (title) => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("state", "WITH");

            const resp = await axios.put(MANUSCRIPT_UPDATE_ENDPOINT, formData);
            if (resp.status === 200) {
                fetchManuscripts();
            } else {
                setError(`Withdraw failed: ${resp.status}`);
            }
        } catch (err) {
            setError(`Withdraw failed: ${err.message}`);
        }
    };

    return (
        <div className="wrapper">
            <h1>Manuscripts</h1>
            {error && <div className="error-message">{error}</div>}
            <h2>Existing Manuscripts</h2>
            {manuscripts.map(m =>
                editingManuscript === m.title ? (
                    <div key={m.title} className="submission-edit-form">
                        <label>Title:<br />
                            <input type="text" name={FORM_FIELDS.TITLE} value={getSafeValue(editedData, FORM_FIELDS.TITLE)} disabled />
                        </label><br />
                        <label>Author:<br />
                            <input type="text" name={FORM_FIELDS.AUTHOR} value={getSafeValue(editedData, FORM_FIELDS.AUTHOR)} onChange={handleEditInputChange} />
                        </label><br />
                        <label>Author Email:<br />
                            <input type="email" name={FORM_FIELDS.AUTHOR_EMAIL} value={getSafeValue(editedData, FORM_FIELDS.AUTHOR_EMAIL)} onChange={handleEditInputChange} />
                        </label><br />
                        <label>Abstract:<br />
                            <textarea name={FORM_FIELDS.ABSTRACT} className="large-textarea" value={getSafeValue(editedData, FORM_FIELDS.ABSTRACT)} onChange={handleEditInputChange} />
                        </label><br />
                        <label>Text:<br />
                            <textarea name={FORM_FIELDS.TEXT} className="large-textarea" value={getSafeValue(editedData, FORM_FIELDS.TEXT)} onChange={handleEditInputChange} />
                        </label><br />
                        <label>Editor Email:<br />
                            <input type="email" name={FORM_FIELDS.EDITOR_EMAIL} value={getSafeValue(editedData, FORM_FIELDS.EDITOR_EMAIL)} onChange={handleEditInputChange} />
                        </label><br />
                        <label>State:<br />
                            <select name={FORM_FIELDS.STATE} value={getSafeValue(editedData, FORM_FIELDS.STATE)} onChange={handleEditInputChange}>
                                <option value={getSafeValue(editedData, FORM_FIELDS.STATE)}>{getStateDisplayName(getSafeValue(editedData, FORM_FIELDS.STATE))}</option>
                                {getNextPossibleStates(getSafeValue(editedData, FORM_FIELDS.STATE)).map(ns => (
                                    <option key={ns} value={ns}>{getStateDisplayName(ns)}</option>
                                ))}
                            </select>
                        </label><br />
                        <label>Upload New PDF/Word:<br />
                            <input type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleEditFileChange} />
                        </label><br />
                        <button onClick={updateManuscript}>Save</button>
                        <button onClick={cancelEditing}>Cancel</button>
                    </div>
                ) : (
                    <div key={m.title} className="submission-display" onClick={() => navigate(`/dashboard/${encodeURIComponent(m.title)}`)}>
                        <h3>{m.title}</h3>
                        <p><strong>Author:</strong> {m.author}</p>
                        <p><strong>Current State:</strong> {getStateDisplayName(m.state)}</p>
                        {isEditor && (
                            <div className="submission-actions">
                                <button onClick={e => { e.stopPropagation(); startEditing(m); }}>Edit</button>
                                <button onClick={e => { e.stopPropagation(); deleteManuscript(m.title); }}>Delete</button>
                            </div>
                        )}
                        {isAuthor && m.author_email === currentUser && (
                            <div className="submission-actions">
                                <button onClick={e => { e.stopPropagation(); updateManuscriptStateToWithdraw(m.title); }}>Withdraw</button>
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
