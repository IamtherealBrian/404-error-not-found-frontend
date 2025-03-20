import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';

const MANUSCRIPT_READ_ENDPOINT = `${BACKEND_URL}/manuscript/read`;
const MANUSCRIPT_CREATE_ENDPOINT = `${BACKEND_URL}/manuscript/create`;
const MANUSCRIPT_UPDATE_ENDPOINT = `${BACKEND_URL}/manuscript/update`;
const MANUSCRIPT_DELETE_ENDPOINT = `${BACKEND_URL}/manuscript/delete`;

function Submissions() {
    const [manuscripts, setManuscripts] = useState([]);
    const [error, setError] = useState('');

    const fetchManuscripts = async () => {
        try {
            const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
            // If 'data' is a dict keyed by title, convert to array if needed
            const array = Object.keys(data).map((key) => data[key]);
            setManuscripts(array);
        } catch (err) {
            setError(`Error fetching manuscripts: ${err.message}`);
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

    const updateManuscript = async (updates) => {
        try {
            const response = await axios.put(MANUSCRIPT_UPDATE_ENDPOINT, updates);
            if (response.status === 200) {
                fetchManuscripts();
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
    }, []);

    return (
        <div>
            <h1>Manuscripts</h1>
            {error && <div style={{color:'red'}}>{error}</div>}
            <button onClick={() => createManuscript({
                title: 'Test Paper',
                author: 'Alice',
                author_email: 'alice@example.com',
                text: 'Lorem ipsum...',
                abstract: 'Short summary...',
                editor_email: 'editor@example.com'
            })}>
                Create a Test Manuscript
            </button>
            <ul>
                {manuscripts.map((m) => (
                    <li key={m.title}>
                        <strong>{m.title}</strong> by {m.author} - {m.author_email}
                        <button onClick={() => updateManuscript({
                            title: m.title,
                            text: 'Updated text content',
                            author_email: 'new-author@example.com',
                            abstract: 'New abstract',
                            editor_email: 'editor@example.com',
                            author: 'New Author'
                        })}>
                            Update
                        </button>
                        <button onClick={() => deleteManuscript(m.title)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Submissions;
