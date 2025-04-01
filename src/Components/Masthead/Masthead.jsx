import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Masthead.css';

// Use the standard people endpoint instead of a special masthead endpoint
const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;

// Role code constants
const EDITOR_ROLE = 'ED';
const MANAGING_EDITOR_ROLE = 'ME';
const CONSULTING_EDITOR_ROLE = 'CE';

function Masthead() {
    const [mastheadData, setMastheadData] = useState({
        editors: [],
        managingEditors: [],
        consultingEditors: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper function to check if a role string contains a specific role
    const hasRole = (rolesValue, roleToCheck) => {
        if (!rolesValue) return false;
        
        // Handle both array and string formats
        if (Array.isArray(rolesValue)) {
            return rolesValue.includes(roleToCheck);
        }
        
        // If it's a string, split by comma and check
        if (typeof rolesValue === 'string') {
            const rolesArray = rolesValue.split(',').map(r => r.trim());
            return rolesArray.includes(roleToCheck);
        }
        
        return false;
    };

    const fetchMastheadData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(PEOPLE_READ_ENDPOINT);
            console.log('People API Response:', data);
            
            // Process the data based on your API response structure
            if (data) {
                // If data is an object with emails as keys (standard /people response)
                if (typeof data === 'object' && !Array.isArray(data)) {
                    // Convert the object to an array of people
                    const allPeople = Object.keys(data).map(key => ({
                        email: key,
                        ...data[key]
                    }));
                    
                    console.log('All people:', allPeople);
                    
                    const processedData = {
                        editors: allPeople.filter(person => hasRole(person.roles, EDITOR_ROLE)),
                        managingEditors: allPeople.filter(person => hasRole(person.roles, MANAGING_EDITOR_ROLE)),
                        consultingEditors: allPeople.filter(person => hasRole(person.roles, CONSULTING_EDITOR_ROLE))
                    };
                    
                    console.log('Processed masthead data:', processedData);
                    setMastheadData(processedData);
                } 
                // If data is already an array
                else if (Array.isArray(data)) {
                    const processedData = {
                        editors: data.filter(person => hasRole(person.roles, EDITOR_ROLE)),
                        managingEditors: data.filter(person => hasRole(person.roles, MANAGING_EDITOR_ROLE)),
                        consultingEditors: data.filter(person => hasRole(person.roles, CONSULTING_EDITOR_ROLE))
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
                                <p className="editor-affiliation">{editor.affiliation || ''}</p>
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
                                <p className="editor-affiliation">{editor.affiliation || ''}</p>
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
                                <p className="editor-affiliation">{editor.affiliation || ''}</p>
                            </div>
                        ))
                    ) : (
                        <p>No consulting editors available</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Masthead; 