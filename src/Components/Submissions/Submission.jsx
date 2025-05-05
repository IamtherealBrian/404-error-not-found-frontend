import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Submission.css';

const MANUSCRIPT_READ_ENDPOINT   = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_CREATE_ENDPOINT = `${BACKEND_URL}/manuscript/create`;
const MANUSCRIPT_UPDATE_ENDPOINT = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT = `${BACKEND_URL}/manuscript/delete`;

const STATE_TRANSITIONS = {
    SUB: ['Rejected', 'Referee Review', 'Withdrawn'],
    Submitted: ['Rejected', 'Referee Review', 'Withdrawn'],
    REF: ['Rejected', 'Submitted', 'Copy Edit', 'Author Revisions', 'Referee Review', 'Withdrawn'],
    'Referee Review': ['Rejected', 'Submitted', 'Copy Edit', 'Author Revisions', 'Referee Review', 'Withdrawn'],
    AUTH: ['Editor Review', 'Withdrawn'],
    'Author Revisions': ['Editor Review', 'Withdrawn'],
    ED: ['Copy Edit', 'Withdrawn'],
    'Editor Review': ['Copy Edit', 'Withdrawn'],
    CE: ['Author Review', 'Withdrawn'],
    'Copy Edit': ['Author Review', 'Withdrawn'],
    AR: ['Formatting', 'Withdrawn'],
    'Author Review': ['Formatting', 'Withdrawn'],
    FOR: ['Published', 'Withdrawn'],
    Formatting: ['Published', 'Withdrawn'],
    PUB: ['Withdrawn'],
    Published: ['Withdrawn'],
    Rejected: [],
    Withdrawn: []
};

const getNextPossibleStates = currentState =>
    STATE_TRANSITIONS[currentState] || [];

export default function Submissions() {
    const navigate = useNavigate();

    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError]             = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [newManuscript, setNewManuscript] = useState({
        title: '',
        author: '',
        author_email: '',
        abstract: '',
        text: '',
        editor_email: '',
        state: 'SUB',
        file: null
    });

    const [editingManuscript, setEditingManuscript] = useState(null);
    const [editedData, setEditedData]               = useState({});
    const [editedFile, setEditedFile]               = useState(null);

    useEffect(() => {
        fetchManuscripts();
    }, []);

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            const all = Object.values(data);
            setManuscripts(all.filter(m => m.state !== 'Rejected' && m.state !== 'Withdrawn'));
        } catch (err) {
            setError(`Error fetching manuscripts: ${err.message}`);
        }
    };

    const handleNewChange = e => {
        const { name, value } = e.target;
        setNewManuscript(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = e => {
        setNewManuscript(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const createManuscript = async () => {
        setError('');
        if (!newManuscript.title.trim()) {
            setError('Title cannot be blank.');
            return;
        }
        if (manuscripts.some(m => m.title === newManuscript.title)) {
            setError('A manuscript with this title already exists.');
            return;
        }
        try {
            const formData = new FormData();
            Object.entries(newManuscript).forEach(([key, val]) => {
                if (val != null) formData.append(key, val);
            });
            const resp = await axios.post(
                MANUSCRIPT_CREATE_ENDPOINT,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (resp.status === 200) {
                fetchManuscripts();
                setNewManuscript({
                    title: '',
                    author: '',
                    author_email: '',
                    abstract: '',
                    text: '',
                    editor_email: '',
                    state: 'SUB',
                    file: null
                });
                setShowCreateForm(false);
            } else {
                setError(`Create returned status: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error creating manuscript: ${err.message}`);
        }
    };

    const startEditing = m => {
        setEditingManuscript(m.title);
        setEditedData({ ...m });
        setEditedFile(null);
    };

    const handleEditInputChange = e => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFileChange = e => {
        setEditedFile(e.target.files[0]);
    };

    const cancelEditing = () => {
        if (!window.confirm('Discard your changes?')) return;
        setEditingManuscript(null);
        setEditedData({});
        setEditedFile(null);
    };

    const updateManuscript = async () => {
        try {
            const formData = new FormData();
            Object.entries(editedData).forEach(([key, val]) => {
                if (val != null) formData.append(key, val);
            });
            if (editedFile) formData.append('file', editedFile);
            const resp = await axios.put(
                MANUSCRIPT_UPDATE_ENDPOINT,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (resp.status === 200) {
                fetchManuscripts();
                setEditingManuscript(null);
                setEditedData({});
                setEditedFile(null);
            } else {
                setError(`Update returned status: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error updating manuscript: ${err.message}`);
        }
    };

    const deleteManuscript = async title => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            const resp = await axios.delete(
                MANUSCRIPT_DELETE_ENDPOINT,
                { data: { title } }
            );
            if (resp.status === 200) {
                fetchManuscripts();
            } else {
                setError(`Delete returned status: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error deleting manuscript: ${err.message}`);
        }
    };

    return (
        <div className="wrapper">
            {error && <div className="error-message">{error}</div>}

            {!showCreateForm && (
                <button onClick={() => setShowCreateForm(true)}>
                    Create a New Submission
                </button>
            )}

            {showCreateForm && (
                <div className="submission-create-form">
                    <h2>Create New Manuscript</h2>

                    <label>
                        Title:<br/>
                        <input
                            type="text"
                            name="title"
                            value={newManuscript.title}
                            onChange={handleNewChange}
                        />
                    </label><br/>

                    <label>
                        Author:<br/>
                        <input
                            type="text"
                            name="author"
                            value={newManuscript.author}
                            onChange={handleNewChange}
                        />
                    </label><br/>

                    <label>
                        Author Email:<br/>
                        <input
                            type="email"
                            name="author_email"
                            value={newManuscript.author_email}
                            onChange={handleNewChange}
                        />
                    </label><br/>

                    <label>
                        Abstract:<br/>
                        <textarea
                            name="abstract"
                            className="large-textarea"
                            value={newManuscript.abstract}
                            onChange={handleNewChange}
                        />
                    </label><br/>

                    <label>
                        Text:<br/>
                        <textarea
                            name="text"
                            className="large-textarea"
                            value={newManuscript.text}
                            onChange={handleNewChange}
                        />
                    </label><br/>

                    <label>
                        Editor Email:<br/>
                        <input
                            type="email"
                            name="editor_email"
                            value={newManuscript.editor_email}
                            onChange={handleNewChange}
                        />
                    </label><br/>

                    <label>
                        Upload PDF/Word:<br/>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                        />
                    </label><br/>

                    <div className="button-group">
                        <button onClick={createManuscript}>Create</button>
                        <button onClick={() => setShowCreateForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <h2>Existing Manuscripts</h2>
            {manuscripts.map(m => (
                <div key={m.title} className="submission-container">
                    {editingManuscript === m.title ? (
                        <div className="submission-edit-form">
                            <h3>Edit &quot;{m.title}&quot;</h3>

                            <label>
                                Title:<br/>
                                <input type="text" value={editedData.title} disabled />
                            </label><br/>

                            <label>
                                Author:<br/>
                                <input
                                    type="text"
                                    name="author"
                                    value={editedData.author}
                                    onChange={handleEditInputChange}
                                />
                            </label><br/>

                            <label>
                                Author Email:<br/>
                                <input
                                    type="email"
                                    name="author_email"
                                    value={editedData.author_email}
                                    onChange={handleEditInputChange}
                                />
                            </label><br/>

                            <label>
                                Abstract:<br/>
                                <textarea
                                    name="abstract"
                                    className="large-textarea"
                                    value={editedData.abstract}
                                    onChange={handleEditInputChange}
                                />
                            </label><br/>

                            <label>
                                Text:<br/>
                                <textarea
                                    name="text"
                                    className="large-textarea"
                                    value={editedData.text}
                                    onChange={handleEditInputChange}
                                />
                            </label><br/>

                            <label>
                                Editor Email:<br/>
                                <input
                                    type="email"
                                    name="editor_email"
                                    value={editedData.editor_email}
                                    onChange={handleEditInputChange}
                                />
                            </label><br/>

                            <label>
                                State:<br/>
                                <select
                                    name="state"
                                    value={editedData.state}
                                    onChange={handleEditInputChange}
                                >
                                    <option value={editedData.state}>{editedData.state}</option>
                                    {getNextPossibleStates(editedData.state).map(ns => (
                                        <option key={ns} value={ns}>{ns}</option>
                                    ))}
                                </select>
                            </label><br/>

                            <label>
                                Upload New PDF/Word:<br/>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleEditFileChange}
                                />
                            </label><br/>

                            <div className="button-group">
                                <button onClick={updateManuscript}>Save</button>
                                <button onClick={cancelEditing}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="submission-display"
                            onClick={() =>
                                navigate(`/submissions/${encodeURIComponent(m.title)}`)
                            }
                        >
                            <h3>{m.title}</h3>
                            <p><strong>Author:</strong> {m.author}</p>
                            <p><strong>Current State:</strong> {m.state}</p>
                            <div className="submission-actions">
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        startEditing(m);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        deleteManuscript(m.title);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
