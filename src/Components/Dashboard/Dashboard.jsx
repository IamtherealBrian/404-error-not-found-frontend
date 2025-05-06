import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Dashboard.css';

const MANUSCRIPT_READ_ENDPOINT    = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_UPDATE_ENDPOINT  = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT  = `${BACKEND_URL}/manuscript/delete`;
const MANUSCRIPT_CREATE_ENDPOINT  = `${BACKEND_URL}/manuscript/create`;

const STATE_TRANSITIONS = {
    Submitted: ['Rejected', 'Referee Review', 'Withdrawn'],
    'Referee Review': ['Rejected', 'Submitted', 'Copy Edit', 'Author Revisions', 'Withdrawn'],
    'Author Revisions': ['Editor Review', 'Withdrawn'],
    'Editor Review': ['Copy Edit', 'Withdrawn'],
    'Copy Edit': ['Author Review', 'Withdrawn'],
    'Author Review': ['Formatting', 'Withdrawn'],
    Formatting: ['Published', 'Withdrawn'],
    Published: ['Withdrawn'],
    Rejected: [],
    Withdrawn: []
};

const getNextPossibleStates = (currentState) => STATE_TRANSITIONS[currentState] || [];

export default function Dashboard() {
    const navigate = useNavigate();
    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError] = useState('');
    const [editingManuscript, setEditingManuscript] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [editedFile, setEditedFile] = useState(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newManuscript, setNewManuscript] = useState({
        title: '', author: '', author_email: '',
        text: '', abstract: '', editor_email: '', curr_state: 'Submitted'
    });

    useEffect(() => {
        fetchManuscripts();
    }, []);

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            setManuscripts(
                Object.values(data).filter(
                    m => m.state !== 'Rejected' && m.state !== 'Withdrawn'
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

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewManuscript(prev => ({ ...prev, [name]: value }));
    };

    const createManuscript = async () => {
        try {
            const resp = await axios.post(MANUSCRIPT_CREATE_ENDPOINT, newManuscript, {
                headers: { "Content-Type": "application/json" }
            });
            if (resp.status === 200) {
                fetchManuscripts();
                setShowCreateForm(false);
                setNewManuscript({
                    title: '', author: '', author_email: '',
                    text: '', abstract: '', editor_email: '', curr_state: 'Submitted'
                });
            } else {
                setError(`Create failed: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error creating manuscript: ${err.message}`);
        }
    };

    return (
        <div className="wrapper">
            <h1>Manuscripts</h1>

            {error && <div className="error-message">{error}</div>}

            <button onClick={() => setShowCreateForm(prev => !prev)}>
                {showCreateForm ? "Cancel Create" : "Create New Manuscript"}
            </button>

            {showCreateForm && (
                <div className="submission-create-form">
                    <h3>Create New Manuscript</h3>
                    <label>Title:<br/><input name="title" value={newManuscript.title} onChange={handleNewChange} /></label><br/>
                    <label>Author:<br/><input name="author" value={newManuscript.author} onChange={handleNewChange} /></label><br/>
                    <label>Author Email:<br/><input name="author_email" value={newManuscript.author_email} onChange={handleNewChange} /></label><br/>
                    <label>Abstract:<br/><textarea name="abstract" className="large-textarea" value={newManuscript.abstract} onChange={handleNewChange} /></label><br/>
                    <label>Text:<br/><textarea name="text" className="large-textarea" value={newManuscript.text} onChange={handleNewChange} /></label><br/>
                    <label>Editor Email:<br/><input name="editor_email" value={newManuscript.editor_email} onChange={handleNewChange} /></label><br/>
                    <label>Initial State:<br/>
                        <select name="curr_state" value={newManuscript.curr_state} onChange={handleNewChange}>
                            {Object.keys(STATE_TRANSITIONS).map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </label><br/>
                    <button onClick={createManuscript}>Submit</button>
                </div>
            )}

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
                                    <option value={editedData.state}>{editedData.state}</option>
                                    {getNextPossibleStates(editedData.state).map(ns => (
                                        <option key={ns} value={ns}>{ns}</option>
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
                            <p><strong>Current State:</strong> {m.state || '(not set)'}</p>
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
