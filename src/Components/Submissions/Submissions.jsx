import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Submissions.css';

const MANUSCRIPT_READ_ENDPOINT    = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_CREATE_ENDPOINT  = `${BACKEND_URL}/manuscript/create`;
const MANUSCRIPT_UPDATE_ENDPOINT  = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT  = `${BACKEND_URL}/manuscript/delete`;

const STATE_TRANSITIONS = {
    'SUB': ['Rejected', 'Referee Review', 'Withdrawn'],
    'Submitted': ['Rejected', 'Referee Review', 'Withdrawn'],
    'REF': ['Rejected', 'Submitted', 'Copy Edit', 'Author Revisions', 'Referee Review', 'Withdrawn'],
    'Referee Review': ['Rejected', 'Submitted', 'Copy Edit', 'Author Revisions', 'Referee Review', 'Withdrawn'],
    'AUTH': ['Editor Review', 'Withdrawn'],
    'Author Revisions': ['Editor Review', 'Withdrawn'],
    'ED': ['Copy Edit', 'Withdrawn'],
    'Editor Review': ['Copy Edit', 'Withdrawn'],
    'CE': ['Author Review', 'Withdrawn'],
    'Copy Edit': ['Author Review', 'Withdrawn'],
    'AR': ['Formatting', 'Withdrawn'],
    'Author Review': ['Formatting', 'Withdrawn'],
    'FOR': ['Published', 'Withdrawn'],
    'Formatting': ['Published', 'Withdrawn'],
    'PUB': ['Withdrawn'],
    'Published': ['Withdrawn'],
    'Rejected': [],
    'Withdrawn': []
};
const getNextPossibleStates = (currentState) =>
    STATE_TRANSITIONS[currentState] || [];

function Submissions() {
    const navigate = useNavigate();
    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingManuscript, setEditingManuscript] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [newManuscript, setNewManuscript] = useState({
        title: '',
        author: '',
        author_email: '',
        abstract: '',
        text: '',
        editor_email: '',
        state: 'SUB'
    });

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            const array = Object.values(data);
            const filtered = array.filter(m => m.state !== 'Rejected' && m.state !== 'Withdrawn');
            setManuscripts(filtered);
        } catch (err) {
            setError(`Error fetching manuscripts: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchManuscripts();
    }, []);

    const handleNewManuscriptChange = (e) => {
        const { name, value } = e.target;
        setNewManuscript(prev => ({ ...prev, [name]: value }));
    };

    const createManuscript = async () => {
        setError('');
        if (!newManuscript.title.trim()) {
            setError("Title cannot be blank.");
            return;
        }
        if (manuscripts.some(m => m.title === newManuscript.title)) {
            setError("A manuscript with this title already exists. Please choose a different title.");
            return;
        }

        try {
            const response = await axios.post(MANUSCRIPT_CREATE_ENDPOINT, newManuscript);
            if (response.status === 200) {
                fetchManuscripts();
                setNewManuscript({
                    title: '',
                    author: '',
                    author_email: '',
                    abstract: '',
                    text: '',
                    editor_email: '',
                    state: 'SUB'
                });
                setShowCreateForm(false);
            } else {
                setError(`Create returned unexpected status: ${response.status}`);
            }
        } catch (err) {
            setError(`Error creating manuscript: ${err.message}`);
        }
    };

    const startEditing = (m) => {
        setEditingManuscript(m.title);
        setEditedData({ ...m });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const cancelEditing = () => {
        if (!window.confirm("Are you sure you want to discard your changes?")) return;
        setEditingManuscript(null);
        setEditedData({});
    };

    const updateManuscript = async () => {
        try {
            const response = await axios.put(MANUSCRIPT_UPDATE_ENDPOINT, editedData);
            if (response.status === 200) {
                fetchManuscripts();
                setEditingManuscript(null);
                setEditedData({});
            } else {
                setError(`Update returned unexpected status: ${response.status}`);
            }
        } catch (err) {
            setError(`Error updating manuscript: ${err.message}`);
        }
    };

    const deleteManuscript = async (title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            const response = await axios.delete(MANUSCRIPT_DELETE_ENDPOINT, { data: { title } });
            if (response.status === 200) {
                fetchManuscripts();
            } else {
                setError(`Delete returned unexpected status: ${response.status}`);
            }
        } catch (err) {
            setError(`Error deleting manuscript: ${err.message}`);
        }
    };

    return (
        <div className="wrapper">
            <h1>Manuscripts</h1>

            <div className="submission-guidelines">
                <h2>Submission Guidelines</h2>
                <ul>
                    <li>Include Title, Author, Author Email, Abstract, Main Text, and Editor Email.</li>
                    <li>Work must be original and not under review elsewhere.</li>
                </ul>
            </div>

            {error && <div className="error-message">{error}</div>}

            {!showCreateForm && (
                <button onClick={() => setShowCreateForm(true)}>
                    Create a new submission
                </button>
            )}

            {showCreateForm && (
                <div className="submission-create-form">
                    <h2>Create New Manuscript</h2>

                    <label>
                        Title:<br />
                        <input
                            type="text"
                            name="title"
                            value={newManuscript.title}
                            onChange={handleNewManuscriptChange}
                        />
                    </label>
                    <br />

                    <label>
                        Author:<br />
                        <input
                            type="text"
                            name="author"
                            value={newManuscript.author}
                            onChange={handleNewManuscriptChange}
                        />
                    </label>
                    <br />

                    <label>
                        Author Email:<br />
                        <input
                            type="email"
                            name="author_email"
                            value={newManuscript.author_email}
                            onChange={handleNewManuscriptChange}
                        />
                    </label>
                    <br />

                    <label>
                        Abstract:<br />
                        <textarea
                            name="abstract"
                            className="large-textarea"
                            value={newManuscript.abstract}
                            onChange={handleNewManuscriptChange}
                        />
                    </label>
                    <br />

                    <label>
                        Text:<br />
                        <textarea
                            name="text"
                            className="large-textarea"
                            value={newManuscript.text}
                            onChange={handleNewManuscriptChange}
                        />
                    </label>
                    <br />

                    <label>
                        Editor Email:<br />
                        <input
                            type="email"
                            name="editor_email"
                            value={newManuscript.editor_email}
                            onChange={handleNewManuscriptChange}
                        />
                    </label>
                    <br />

                    <button onClick={createManuscript}>Create</button>
                    <button onClick={() => setShowCreateForm(false)}>Cancel</button>
                </div>
            )}

            <h2>Existing Manuscripts</h2>
            {manuscripts.map(m => (
                <div key={m.title} className="submission-container">
                    {editingManuscript === m.title ? (
                        <div>
                            <label>
                                Title:<br />
                                <input type="text" name="title" value={editedData.title} disabled />
                            </label>
                            <br />

                            <label>
                                Author:<br />
                                <input
                                    type="text"
                                    name="author"
                                    value={editedData.author}
                                    onChange={handleEditInputChange}
                                />
                            </label>
                            <br />

                            <label>
                                Author Email:<br />
                                <input
                                    type="email"
                                    name="author_email"
                                    value={editedData.author_email}
                                    onChange={handleEditInputChange}
                                />
                            </label>
                            <br />

                            <label>
                                Abstract:<br />
                                <textarea
                                    name="abstract"
                                    className="large-textarea"
                                    value={editedData.abstract}
                                    onChange={handleEditInputChange}
                                />
                            </label>
                            <br />

                            <label>
                                Text:<br />
                                <textarea
                                    name="text"
                                    className="large-textarea"
                                    value={editedData.text}
                                    onChange={handleEditInputChange}
                                />
                            </label>
                            <br />

                            <label>
                                Editor Email:<br />
                                <input
                                    type="email"
                                    name="editor_email"
                                    value={editedData.editor_email}
                                    onChange={handleEditInputChange}
                                />
                            </label>
                            <br />

                            <label>
                                Current State:<br />
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
                            </label>
                            <br />

                            <button onClick={updateManuscript}>Save</button>
                            <button onClick={cancelEditing}>Cancel</button>
                        </div>
                    ) : (
                        <div className="submission-display" onClick={() => navigate(`/submissions/${encodeURIComponent(m.title)}`)}>
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

export default Submissions;
