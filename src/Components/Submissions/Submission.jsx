import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Submission.css';               // <-- fixed

const READ_ENDPOINT   = `${BACKEND_URL}/manuscript/read`;
const CREATE_ENDPOINT = `${BACKEND_URL}/manuscript/create`;
const UPDATE_ENDPOINT = `${BACKEND_URL}/manuscript/update`;
const DELETE_ENDPOINT = `${BACKEND_URL}/manuscript/delete`;

const STATE_TRANSITIONS = {
    SUB: ['Rejected', 'Referee Review', 'Withdrawn'],
    Submitted: ['Rejected', 'Referee Review', 'Withdrawn'],
    REF: ['Rejected','Submitted','Copy Edit','Author Revisions','Referee Review','Withdrawn'],
    'Referee Review': ['Rejected','Submitted','Copy Edit','Author Revisions','Referee Review','Withdrawn'],
    AUTH: ['Editor Review','Withdrawn'],
    'Author Revisions': ['Editor Review','Withdrawn'],
    ED: ['Copy Edit','Withdrawn'],
    'Editor Review': ['Copy Edit','Withdrawn'],
    CE: ['Author Review','Withdrawn'],
    'Copy Edit': ['Author Review','Withdrawn'],
    AR: ['Formatting','Withdrawn'],
    'Author Review': ['Formatting','Withdrawn'],
    FOR: ['Published','Withdrawn'],
    Formatting: ['Published','Withdrawn'],
    PUB: ['Withdrawn'],
    Published: ['Withdrawn'],
    Rejected: [],
    Withdrawn: []
};

const getNextPossibleStates = current =>
    STATE_TRANSITIONS[current] || [];

export default function Submissions() {
    const navigate = useNavigate();

    const [manuscripts, setManuscripts]     = useState([]);
    const [error, setError]                 = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [newManuscript, setNewManuscript] = useState({
        title: '',
        author: '',
        author_email: '',
        abstract: '',
        text: '',
        editor_email: '',
        file: null,
    });

    const [editingTitle, setEditingTitle]  = useState(null);
    const [editedData, setEditedData]      = useState({});
    // const [editedFile, setEditedFile]      = useState(null);

    useEffect(() => {
        fetchManuscripts();
    }, []);

    async function fetchManuscripts() {
        try {
            const { data } = await axios.get(READ_ENDPOINT);
            const all = Object.values(data);
            setManuscripts(all.filter(m => m.state !== 'Rejected' && m.state !== 'Withdrawn'));
        } catch (err) {
            setError(`Error fetching manuscripts: ${err.message}`);
        }
    }

    function handleNewChange(e) {
        const { name, value } = e.target;
        setNewManuscript(prev => ({ ...prev, [name]: value }));
    }
    function handleFileChange(e) {
        setNewManuscript(prev => ({ ...prev, file: e.target.files[0] }));
    }

    async function createManuscript() {
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
            const payload = {
                title:          newManuscript.title,
                author:         newManuscript.author,
                author_email:   newManuscript.author_email,
                text:           newManuscript.text,
                abstract:       newManuscript.abstract,
                editor_email:   newManuscript.editor_email
            };
            const resp = await axios.post(
                CREATE_ENDPOINT,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (resp.status === 200) {
                await fetchManuscripts();
                setNewManuscript({
                    title: '', author: '', author_email: '',
                    abstract: '', text: '', editor_email: '', file: null
                });
                setShowCreateForm(false);
            } else {
                setError(`Create returned status: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error creating manuscript: ${err.message}`);
        }
    }

    function startEditing(m) {
        setEditingTitle(m.title);
        setEditedData({ ...m });
        // setEditedFile(null);
    }

    function handleEditInputChange(e) {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    }
    // function handleEditFileChange(e) {
    //     setEditedFile(e.target.files[0]);
    // }
    function cancelEditing() {
        if (!window.confirm('Discard your changes?')) return;
        setEditingTitle(null);
        setEditedData({});
        // setEditedFile(null);
    }

    async function updateManuscript() {
        try {
            const payload = { ...editedData };
            // backend update ignores "title" field, so no need to strip it here
            const resp = await axios.put(
                UPDATE_ENDPOINT,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (resp.status === 200) {
                await fetchManuscripts();
                cancelEditing();
            } else {
                setError(`Update returned status: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error updating manuscript: ${err.message}`);
        }
    }

    async function deleteManuscript(title) {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            const resp = await axios.delete(
                DELETE_ENDPOINT,
                { data: { title } }
            );
            if (resp.status === 200) {
                await fetchManuscripts();
            } else {
                setError(`Delete returned status: ${resp.status}`);
            }
        } catch (err) {
            setError(`Error deleting manuscript: ${err.message}`);
        }
    }

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
                        (Optional) Upload PDF/Word:<br/>
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
                    {editingTitle === m.title ? (
                        <div className="submission-edit-form">
                            <h3>Edit &quot;{m.title}&quot;</h3>

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
                                    onClick={e => { e.stopPropagation(); startEditing(m); }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); deleteManuscript(m.title); }}
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
