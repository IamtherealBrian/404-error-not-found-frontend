import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';

const MANUSCRIPT_READ_ENDPOINT = `${BACKEND_URL}/manuscript/read`;

function DashboardDetail() {
    const { title } = useParams();
    const navigate = useNavigate();
    const [manuscript, setManuscript] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchManuscript = async () => {
            try {
                const { data } = await axios.get(MANUSCRIPT_READ_ENDPOINT);
                const manuscriptData = Object.values(data).find(m => m.title === title);
                if (manuscriptData) {
                    setManuscript(manuscriptData);
                } else {
                    setError('Manuscript not found');
                }
            } catch (err) {
                setError(`Error fetching manuscript: ${err.message}`);
            }
        };

        fetchManuscript();
    }, [title]);

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!manuscript) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px' }}>
                ← Back to Dashboard
            </button>
            <h1>{manuscript.title}</h1>
            <div style={{ marginTop: '20px' }}>
                <p><strong>Author:</strong> {manuscript.author}</p>
                <p><strong>Author Email:</strong> {manuscript.author_email}</p>
                <p><strong>Abstract:</strong> {manuscript.abstract}</p>
                <p><strong>Text:</strong> {manuscript.text}</p>
                <p><strong>Editor Email:</strong> {manuscript.editor_email}</p>
                <p><strong>Current State:</strong> {manuscript.state || '(not set)'}</p>
            </div>
        </div>
    );
}

export default DashboardDetail; 