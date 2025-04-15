import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './People.css';

const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;
const PEOPLE_CREATE_ENDPOINT = `${BACKEND_URL}/people`;
const PEOPLE_DELETE_ENDPOINT = `${BACKEND_URL}/people`;
const ROLES_ENDPOINT = `${BACKEND_URL}/roles`;

// 添加人员表单组件，支持多选 roles
function AddPersonForm({ visible, cancel, fetchPeople, setError }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [affiliation, setAffiliation] = useState('');
    // roles 用数组存储，初始为空数组
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleOptions, setRoleOptions] = useState({});

    const changeName = (event) => setName(event.target.value);
    const changeEmail = (event) => setEmail(event.target.value);
    const changeAffiliation = (event) => setAffiliation(event.target.value);
    // 处理多选下拉菜单，收集所有被选中的 option 的值
    const changeRoles = (event) => {
        const selected = Array.from(event.target.selectedOptions, option => option.value);
        setRoles(selected);
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(ROLES_ENDPOINT);
                setRoleOptions(response.data.data.roles);
            } catch (error) {
                setError('Failed to fetch roles');
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, [setError]);

    const addPerson = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const newPerson = {
            name: name.trim(),
            email: email.trim(),
            // 此处发送的是角色数组
            roles: roles,
            affiliation: affiliation.trim(),
        };

        try {
            const response = await axios.post(
                PEOPLE_CREATE_ENDPOINT,
                JSON.stringify(newPerson),
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                fetchPeople();
                cancel();
            } else {
                setError(`Unexpected response from server: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            if (error.response) {
                setError(`Server error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                setError('No response received from server. Please check if the API is running and accessible.');
            } else {
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <form onSubmit={addPerson}>
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input required type="text" id="name" value={name} onChange={changeName} />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input required type="text" id="email" value={email} onChange={changeEmail} />
            </div>

            <div className="form-group">
                <label htmlFor="affiliation">Affiliation</label>
                <input
                    required
                    type="text"
                    id="affiliation"
                    value={affiliation}
                    onChange={changeAffiliation}
                />
            </div>

            <div className="form-group">
                <label htmlFor="roles">Roles (multiple selection):</label>
                <select
                    id="roles"
                    className="form-control"
                    value={roles}
                    onChange={changeRoles}
                    multiple    // 增加 multiple 属性
                    required
                >
                    {/* 多选时可以不显示默认空选项，也可以保留一个提示 */}
                    <option value="" disabled>
                        Select one or more roles
                    </option>
                    {Object.entries(roleOptions).map(([code, role]) => (
                        <option key={code} value={code}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            <div className="button-group">
                <button type="button" onClick={cancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </form>
    );
}

AddPersonForm.propTypes = {
    visible: propTypes.bool.isRequired,
    cancel: propTypes.func.isRequired,
    fetchPeople: propTypes.func.isRequired,
    setError: propTypes.func.isRequired,
};

function ErrorMessage({ message }) {
    return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
    message: propTypes.string.isRequired,
};

function Person({ person, onUpdate, onDelete, isUpdating, updateForm }) {
    const { name, email, affiliation, roles } = person;
    return (
        <div className="person-container">
            <Link to={name}>
                <h2>{name}</h2>
                <p>Email: {email}</p>
                <p>Affiliation: {affiliation}</p>
                <p>Roles: {Array.isArray(roles) ? roles.join(', ') : roles}</p>
            </Link>
            <div className="person-actions">
                <button onClick={() => onUpdate(person)}>Update</button>
                <button onClick={() => onDelete(email)}>Delete</button>
            </div>
            {isUpdating && updateForm}
        </div>
    );
}

Person.propTypes = {
    person: propTypes.shape({
        name: propTypes.string.isRequired,
        email: propTypes.string.isRequired,
        affiliation: propTypes.string.isRequired,
        roles: propTypes.oneOfType([propTypes.string, propTypes.array]).isRequired,
    }).isRequired,
    onUpdate: propTypes.func.isRequired,
    onDelete: propTypes.func.isRequired,
    isUpdating: propTypes.bool.isRequired,
    updateForm: propTypes.node,
};

function peopleObjectToArray(data) {
    const keys = Object.keys(data);
    return keys.map((key) => data[key]);
}

function People() {
    const [error, setError] = useState('');
    const [people, setPeople] = useState([]);
    const [addingPerson, setAddingPerson] = useState(false);
    const [updatingPersonId, setUpdatingPersonId] = useState(null);
    const [updateEmail, setUpdateEmail] = useState('');
    const [updateName, setUpdateName] = useState('');
    const [updateAffiliation, setUpdateAffiliation] = useState('');
    // 对于更新，也支持多个角色，存储为数组
    const [updateRoles, setUpdateRoles] = useState([]);
    const [roleOptions, setRoleOptions] = useState({});

    const handleUpdate = (person) => {
        setUpdatingPersonId(person.email);
        setUpdateEmail(person.email);
        setUpdateName(person.name);
        setUpdateAffiliation(person.affiliation || '');
        // 如果后端返回的是数组，直接使用，否则转为数组
        setUpdateRoles(Array.isArray(person.roles) ? person.roles : person.roles ? [person.roles] : []);
    };

    const cancelUpdate = () => {
        setUpdatingPersonId(null);
        setUpdateEmail('');
        setUpdateName('');
        setUpdateAffiliation('');
        setUpdateRoles([]);
    };

    const handleDelete = (email) => {
        deletePerson(email);
    };

    const fetchPeople = async () => {
        try {
            const { data } = await axios.get(PEOPLE_READ_ENDPOINT);
            setPeople(peopleObjectToArray(data));
        } catch (error) {
            if (!error.response) {
                setError("Network error. Please check your internet connection.");
            } else {
                setError(`There was a problem retrieving the list of people. ${error.response.data?.message || error.message}`);
            }
        }
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(ROLES_ENDPOINT);
                setRoleOptions(response.data.data.roles);
            } catch (error) {
                setError('Failed to fetch roles');
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, [setError]);

    // 更新时：处理多选角色变化事件
    const changeUpdateRoles = (event) => {
        const selected = Array.from(event.target.selectedOptions, option => option.value);
        setUpdateRoles(selected);
    };

    const updatePerson = (event) => {
        event.preventDefault();
        if (!updateEmail) {
            setError('Please enter an email to update.');
            return;
        }

        const updatedData = {
            email: updateEmail,
            name: updateName || undefined,
            affiliation: updateAffiliation || undefined,
            // 更新时传递角色数组
            roles: updateRoles,
        };

        axios.put(PEOPLE_READ_ENDPOINT, JSON.stringify(updatedData), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
        })
            .then(() => {
                setUpdatingPersonId(null);
                fetchPeople();
            })
            .catch((error) => {
                setError(`There was a problem updating the person. ${error.response?.data?.message || error.message}`);
            });
    };

    const deletePerson = (email) => {
        if (!email) {
            setError('Invalid email for deletion.');
            return;
        }
        axios.delete(PEOPLE_DELETE_ENDPOINT, {
            data: JSON.stringify({ email }),
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
        })
            .then(() => {
                fetchPeople();
            })
            .catch((error) => {
                setError(`There was a problem deleting the person. ${error.response?.data?.message || error.message}`);
            });
    };

    const showAddPersonForm = () => setAddingPerson(true);
    const hideAddPersonForm = () => setAddingPerson(false);

    const updateForm = (
        <form onSubmit={updatePerson} className="form-container">
            <label>New Name:</label>
            <input type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />

            <label>New Affiliation:</label>
            <input type="text" value={updateAffiliation} onChange={(e) => setUpdateAffiliation(e.target.value)} />

            <div className="form-group">
                <label htmlFor="updateRoles">New Roles (multiple selection):</label>
                <select
                    id="updateRoles"
                    className="form-control"
                    value={updateRoles}
                    onChange={changeUpdateRoles}
                    multiple  // 增加多选
                >
                    <option value="" disabled>
                        Select one or more roles
                    </option>
                    {Object.entries(roleOptions).map(([code, role]) => (
                        <option key={code} value={code}>{role}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={cancelUpdate}>Cancel</button>
                <button type="submit">Submit</button>
            </div>
        </form>
    );

    useEffect(() => {
        fetchPeople();
    }, []);

    return (
        <div className="wrapper">
            <header>
                <h1>View All People</h1>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '10px' }}>
                    <button type="button" onClick={showAddPersonForm}>
                        Add a Person
                    </button>
                </div>
            </header>

            <AddPersonForm
                visible={addingPerson}
                cancel={hideAddPersonForm}
                fetchPeople={fetchPeople}
                setError={setError}
            />

            {error && <ErrorMessage message={error} />}

            {people.map((person) => (
                <Person
                    key={person.email}
                    person={person}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isUpdating={updatingPersonId === person.email}
                    updateForm={updateForm}
                />
            ))}
        </div>
    );
}

export default People;
