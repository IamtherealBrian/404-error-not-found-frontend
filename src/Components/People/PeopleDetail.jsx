import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';

const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;

function PeopleDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [people, setPeople] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const { data } = await axios.get(PEOPLE_READ_ENDPOINT);
                const peopleData = Object.values(data).find(p => p.name === name);
                if (peopleData) {
                    setPeople(peopleData);
                } else {
                    setError('People not found');
                }
            } catch (err) {
                setError(`Error fetching people: ${err.message}`);
            }
        };

        fetchPeople();
    }, [name]);

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!people) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/people')} style={{ marginBottom: '20px' }}>
                ← Back to People
            </button>
            <h1>{people.name}</h1>
            <div style={{marginTop: '20px'}}>
                <p><strong>Email:</strong> {people.email}</p>
                {/*<p><strong>Affiliation:</strong> {people.affiliation}</p>*/}
                <p><strong>Affiliation:</strong> {people.affiliation || 'No affiliation provided'}</p>
                <p>
                    {/*<strong>Roles:</strong> {Array.isArray(people.roles) ? people.roles.join(', ') : people.roles}*/}
                    <strong>Roles:</strong>{' '}
                    {
                        Array.isArray(people.roles) && people.roles.length > 0
                            ? people.roles.join(', ')
                            : 'No roles defined'
                    }
                </p>
            </div>
        </div>
    );
}

export default PeopleDetail;
