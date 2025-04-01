import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Masthead.css';

const MASTHEAD_READ_ENDPOINT = `${BACKEND_URL}/people/masthead`;

function Masthead() {
    const [mastheadData, setMastheadData] = useState({
        editors: [],
        managingEditors: [],
        consultingEditors: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMastheadData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(MASTHEAD_READ_ENDPOINT);
            console.log('Masthead API Response:', data);
            
            // Process the data based on your API response structure
            if (data) {
                // Option 1: If data is already structured as we need
                if (data.editors || data.managingEditors || data.consultingEditors) {
                    setMastheadData({
                        editors: data.editors || [],
                        managingEditors: data.managingEditors || [],
                        consultingEditors: data.consultingEditors || []
                    });
                } 
                // Option 2: If data is just an array of all editors with role properties
                else if (Array.isArray(data)) {
                    const processedData = {
                        editors: data.filter(editor => editor.role === 'editor'),
                        managingEditors: data.filter(editor => editor.role === 'managing'),
                        consultingEditors: data.filter(editor => editor.role === 'consulting')
                    };
                    setMastheadData(processedData);
                }
                // Option 3: If data is an object with editor IDs as keys
                else if (typeof data === 'object' && !Array.isArray(data)) {
                    const allEditors = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    
                    const processedData = {
                        editors: allEditors.filter(editor => editor.role === 'editor'),
                        managingEditors: allEditors.filter(editor => editor.role === 'managing'),
                        consultingEditors: allEditors.filter(editor => editor.role === 'consulting')
                    };
                    
                    setMastheadData(processedData);
                } else {
                    setError('Invalid masthead data format received from the API.');
                }
            } else {
                setError('No masthead data found or invalid response format.');
            }
        } catch (err) {
            setError(`There was a problem retrieving the masthead data: ${err.message}`);
            console.error('Error fetching masthead data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMastheadData();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    
    return (
        <div className="masthead-container">
            <h1 className="masthead-title">Masthead</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            {/* Editors Section */}
            <section className="editor-section">
                <h2 className="section-title">Editors</h2>
                <div className="editors-grid">
                    {mastheadData.editors.length > 0 ? (
                        mastheadData.editors.map((editor, index) => (
                            <div key={index} className="editor-card">
                                <h3 className="editor-name">{editor.name}</h3>
                                <p className="editor-affiliation">{editor.affiliation || editor.organization || editor.institution || ''}</p>
                            </div>
                        ))
                    ) : (
                        <p>No editors available</p>
                    )}
                </div>
            </section>
            
            {/* Managing Editors Section */}
            <section className="editor-section">
                <h2 className="section-title">Managing Editors</h2>
                <div className="editors-grid">
                    {mastheadData.managingEditors.length > 0 ? (
                        mastheadData.managingEditors.map((editor, index) => (
                            <div key={index} className="editor-card">
                                <h3 className="editor-name">{editor.name}</h3>
                                <p className="editor-affiliation">{editor.affiliation || editor.organization || editor.institution || ''}</p>
                            </div>
                        ))
                    ) : (
                        <p>No managing editors available</p>
                    )}
                </div>
            </section>
            
            {/* Consulting Editors Section */}
            <section className="editor-section">
                <h2 className="section-title">Consulting Editors</h2>
                <div className="editors-grid">
                    {mastheadData.consultingEditors.length > 0 ? (
                        mastheadData.consultingEditors.map((editor, index) => (
                            <div key={index} className="editor-card">
                                <h3 className="editor-name">{editor.name}</h3>
                                <p className="editor-affiliation">{editor.affiliation || editor.organization || editor.institution || ''}</p>
                            </div>
                        ))
                    ) : (
                        <p>No consulting editors available</p>
                    )}
                </div>
            </section>
            
            <footer className="masthead-footer">
                <p>* Executive committee</p>
            </footer>
        </div>
    );
}

export default Masthead; 