import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Dashboard.css';

const MANUSCRIPT_READ_ENDPOINT    = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_UPDATE_ENDPOINT  = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT  = `${BACKEND_URL}/manuscript/delete`;

const STATE_TRANSITIONS = {
    'SUB': ['REJ', 'REF', 'WITH'],
    'REF': ['REJ', 'SUB', 'COPY', 'AUTH', 'WITH'],
    'AUTH': ['EDIT', 'WITH'],
    'EDIT': ['COPY', 'WITH'],
    'COPY': ['AUTH', 'WITH'],
    'AUTH_REV': ['FORM', 'WITH'],
    'FORM': ['PUB', 'WITH'],
    'PUB': ['WITH'],
    'REJ': [],
    'WITH': []
};

const STATE_DISPLAY_NAMES = {
    'SUB': 'Submitted',
    'REF': 'Referee Review',
    'AUTH': 'Author Revisions',
    'EDIT': 'Editor Review',
    'COPY': 'Copy Edit',
    'AUTH_REV': 'Author Review',
    'FORM': 'Formatting',
    'PUB': 'Published',
    'REJ': 'Rejected',
    'WITH': 'Withdrawn'
};

const getNextPossibleStates = (currentState) => STATE_TRANSITIONS[currentState] || [];
const getStateDisplayName = (stateCode) => STATE_DISPLAY_NAMES[stateCode] || stateCode;

export default function Dashboard() {
    const navigate = useNavigate();
    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError] = useState('');
    const [editingManuscript, setEditingManuscript] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [editedFile, setEditedFile] = useState(null);

    useEffect(() => {
        fetchManuscripts();
    }, []);

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            console.log('Fetched manuscripts:', data);
            setManuscripts(
                Object.values(data).filter(
                    m => m.state !== 'REJ' && m.state !== 'WITH'
                )
            );
        } catch (err) {
            setError(`Error fetching manuscripts: ${err.message}`);
        }
    };

    const startEditing = (m) => {
        setEditingManuscript(m.title);
        setEditedData({ ...m });
        setEditedFile(null);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFileChange = (e) => setEditedFile(e.target.files[0]);
    const cancelEditing = () => {
        if (!window.confirm("Discard your changes?")) return;
        setEditingManuscript(null);
        setEditedData({});
        setEditedFile(null);
    };

    const updateManuscript = async () => {
        try {
            const formData = new FormData();
            for (const key in editedData) {
                formData.append(key, editedData[key]);
            }
            if (editedFile) formData.append('file', editedFile);

            const resp = await axios.put(MANUSCRIPT_UPDATE_ENDPOINT, formData);
            if (resp.status === 200) {
                fetchManuscripts();
                setEditingManuscript(null);
            } else {
                setError(`Update failed: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error updating manuscript: ${err.message}`);
        }
    };

    const deleteManuscript = async (title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            const resp = await axios.delete(MANUSCRIPT_DELETE_ENDPOINT, {
                data: { title }
            });
            if (resp.status === 200) fetchManuscripts();
            else setError(`Delete failed: ${resp.status}`);
        } catch (err) {
            setError(`Error deleting manuscript: ${err.message}`);
        }
    };

    return (
        <div className="wrapper">
            <h1>Manuscripts</h1>

            {error && <div className="error-message">{error}</div>}

            <h2>Existing Manuscripts</h2>
            {manuscripts.map(m => (
                <div key={m.title} className="submission-container">
                    {editingManuscript === m.title ? (
                        <div className="submission-edit-form">
                            <label>Title:<br/><input type="text" name="title" value={editedData.title} disabled /></label><br/>
                            <label>Author:<br/><input type="text" name="author" value={editedData.author} onChange={handleEditInputChange} /></label><br/>
                            <label>Author Email:<br/><input type="email" name="author_email" value={editedData.author_email} onChange={handleEditInputChange} /></label><br/>
                            <label>Abstract:<br/><textarea name="abstract" className="large-textarea" value={editedData.abstract} onChange={handleEditInputChange} /></label><br/>
                            <label>Text:<br/><textarea name="text" className="large-textarea" value={editedData.text} onChange={handleEditInputChange} /></label><br/>
                            <label>Editor Email:<br/><input type="email" name="editor_email" value={editedData.editor_email} onChange={handleEditInputChange} /></label><br/>
                            <label>State:<br/>
                                <select name="state" value={editedData.state} onChange={handleEditInputChange}>
                                    <option value={editedData.state}>{getStateDisplayName(editedData.state)}</option>
                                    {getNextPossibleStates(editedData.state).map(ns => (
                                        <option key={ns} value={ns}>{getStateDisplayName(ns)}</option>
                                    ))}
                                </select>
                            </label><br/>
                            <label>Upload New PDF/Word:<br/>
                                <input type="file" accept=".pdf,.doc,.docx" onChange={handleEditFileChange} />
                            </label><br/>
                            <button onClick={updateManuscript}>Save</button>
                            <button onClick={cancelEditing}>Cancel</button>
                        </div>
                    ) : (
                        <div
                            className="submission-display"
                            onClick={() => navigate(`/dashboard/${encodeURIComponent(m.title)}`)}
                        >
                            <h3>{m.title}</h3>
                            <p><strong>Author:</strong> {m.author}</p>
                            <p><strong>Current State:</strong> {getStateDisplayName(m.state) || '(not set)'}</p>
                            <div className="submission-actions">
                                <button onClick={e => { e.stopPropagation(); startEditing(m); }}>Edit</button>
                                <button onClick={e => { e.stopPropagation(); deleteManuscript(m.title); }}>Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
