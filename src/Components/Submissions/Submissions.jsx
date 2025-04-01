import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';

const MANUSCRIPT_READ_ENDPOINT = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_CREATE_ENDPOINT = `${BACKEND_URL}/manuscript/create`;
const MANUSCRIPT_UPDATE_ENDPOINT = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT = `${BACKEND_URL}/manuscript/delete`;
const MANUSCRIPT_STATES_ENDPOINT = `${BACKEND_URL}/manuscript/states`;

function Submissions() {
    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError] = useState('');
    const [possibleStates, setPossibleStates] = useState([]);
    const [editingManuscript, setEditingManuscript] = useState(null);
    const [editedData, setEditedData] = useState({});

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            const array = Object.keys(data).map((key) => data[key]);
            setManuscripts(array);
        } catch (err) {
            setError(`Error fetching manuscripts: ${err.message}`);
        }
    };

    const fetchPossibleStates = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_STATES_ENDPOINT);
            if (data && data.states) {
                setPossibleStates(data.states);
            }
        } catch (err) {
            setError(`Error fetching states: ${err.message}`);
        }
    };

    const createManuscript = async (manuscriptData) => {
        try {
            const response = await axios.post(MANUSCRIPT_CREATE_ENDPOINT, manuscriptData);
            if (response.status === 200) {
                fetchManuscripts();
            } else {
                setError(`Create returned unexpected status: ${response.status}`);
            }
        } catch (err) {
            setError(`Error creating manuscript: ${err.message}`);
        }
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
        try {
            const response = await axios.delete(MANUSCRIPT_DELETE_ENDPOINT, {
                data: { title },
            });
            if (response.status === 200) {
                fetchManuscripts();
            } else {
                setError(`Delete returned unexpected status: ${response.status}`);
            }
        } catch (err) {
            setError(`Error deleting manuscript: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchManuscripts();
        fetchPossibleStates();
    }, []);

    const startEditing = (manuscript) => {
        setEditingManuscript(manuscript.title);
        setEditedData({ ...manuscript });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const cancelEditing = () => {
        setEditingManuscript(null);
        setEditedData({});
    };

    return (
        <div>
            <h1>Manuscripts</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button
                onClick={() => createManuscript({
                    title: 'Test Paper',
                    author: 'Alice',
                    author_email: 'alice@example.com',
                    text: 'Lorem ipsum...',
                    abstract: 'Short summary...',
                    editor_email: 'editor@example.com',
                    curr_state: 'Submitted'
                })}
            >
                Create a Test Manuscript
            </button>
            <div>
                {manuscripts.map((m) => (
                    <div
                        key={m.title}
                        style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}
                    >
                        {editingManuscript === m.title ? (
                            <div>
                                <label>
                                    Title:
                                    <input
                                        type="text"
                                        name="title"
                                        value={editedData.title}
                                        disabled
                                    />
                                </label>
                                <br/>
                                <label>
                                    Author:
                                    <input
                                        type="text"
                                        name="author"
                                        value={editedData.author}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <br/>
                                <label>
                                    Author Email:
                                    <input
                                        type="email"
                                        name="author_email"
                                        value={editedData.author_email}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <br/>
                                <label>
                                    Abstract:
                                    <textarea
                                        name="abstract"
                                        value={editedData.abstract}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <br/>
                                <label>
                                    Text:
                                    <textarea
                                        name="text"
                                        value={editedData.text}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <br/>
                                <label>
                                    Editor Email:
                                    <input
                                        type="email"
                                        name="editor_email"
                                        value={editedData.editor_email}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <br/>
                                <label>
                                    Current State:
                                    <select
                                        name="curr_state"
                                        value={editedData.curr_state || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Select State --</option>
                                        {possibleStates.map((stateOption) => (
                                            <option key={stateOption} value={stateOption}>
                                                {stateOption}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <br/>
                                <button onClick={updateManuscript}>Save</button>
                                <button onClick={cancelEditing}>Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <h2>{m.title}</h2>
                                <p><strong>Author:</strong> {m.author}</p>
                                <p><strong>Author Email:</strong> {m.author_email}</p>
                                <p><strong>Abstract:</strong> {m.abstract}</p>
                                <p><strong>Text:</strong> {m.text}</p>
                                <p><strong>Editor Email:</strong> {m.editor_email}</p>
                                <p><strong>Current State:</strong> {m.curr_state}</p>
                                <button onClick={() => startEditing(m)}>Edit</button>
                                <button onClick={() => deleteManuscript(m.title)}>Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Submissions;
