// src/Components/Submissions/Submissions.jsx
import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './Submissions.css'; // Create a Submissions.css if you need custom styling

// Define your endpoints (similar to how you did for People)
const SUBMISSIONS_READ_ENDPOINT = `${BACKEND_URL}/submissions`;
const SUBMISSIONS_CREATE_ENDPOINT = `${BACKEND_URL}/submissions`;
const SUBMISSIONS_DELETE_ENDPOINT = `${BACKEND_URL}/submissions`;
// If you have a separate update endpoint or the same path, adjust as necessary

/**
 * 1. Add Submission Form
 */
function AddSubmissionForm({
                               visible,
                               cancel,
                               fetchSubmissions,
                               setError,
                           }) {
    const [title, setTitle] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const changeTitle = (e) => setTitle(e.target.value);
    const changeAuthorEmail = (e) => setAuthorEmail(e.target.value);
    const changeContent = (e) => setContent(e.target.value);

    const addSubmission = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        // Build the new submission object
        const newSubmission = {
            title: title.trim(),
            authorEmail: authorEmail.trim(),
            content: content.trim(),
        };

        try {
            // POST to create
            const response = await axios.post(
                SUBMISSIONS_CREATE_ENDPOINT,
                newSubmission,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    validateStatus: (status) => status < 500,
                }
            );

            if (response.status === 200 || response.status === 201) {
                fetchSubmissions();
                cancel(); // close the form
            } else {
                setError(
                    `Unexpected response from server: ${response.status} ${response.statusText}`
                );
            }
        } catch (error) {
            console.error('POST request failed:', error);
            if (error.response) {
                setError(
                    `Server error (${error.response.status}): ${
                        error.response.data?.message || error.response.statusText
                    }`
                );
            } else if (error.request) {
                setError(
                    'No response received from server. Please check if the API is running and accessible.'
                );
            } else {
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Only render the form if `visible` is true
    if (!visible) return null;

    return (
        <form>
            <label htmlFor="title">Title</label>
            <input
                required
                type="text"
                id="title"
                value={title}
                onChange={changeTitle}
            />

            <label htmlFor="authorEmail">Author Email</label>
            <input
                required
                type="email"
                id="authorEmail"
                value={authorEmail}
                onChange={changeAuthorEmail}
            />

            <label htmlFor="content">Content</label>
            <textarea
                required
                id="content"
                value={content}
                onChange={changeContent}
            />

            <button type="button" onClick={cancel} disabled={loading}>
                Cancel
            </button>
            <button type="submit" onClick={addSubmission} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
}

AddSubmissionForm.propTypes = {
    visible: propTypes.bool.isRequired,
    cancel: propTypes.func.isRequired,
    fetchSubmissions: propTypes.func.isRequired,
    setError: propTypes.func.isRequired,
};

/**
 * 2. Error Message Component
 */
function ErrorMessage({ message }) {
    return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
    message: propTypes.string.isRequired,
};

/**
 * 3. Single Submission Component
 */
function Submission({ submission, onUpdate, onDelete }) {
    const { title, authorEmail, content } = submission;

    return (
        <div className="submission-container">
            <Link to={title}>
                <h2>{title}</h2>
                <p>Author: {authorEmail}</p>
                <p>Content: {content}</p>
            </Link>
            <button onClick={() => onUpdate(submission)}>Update</button>
            <button onClick={() => onDelete(authorEmail)}>Delete</button>
        </div>
    );
}

Submission.propTypes = {
    submission: propTypes.shape({
        title: propTypes.string.isRequired,
        authorEmail: propTypes.string.isRequired,
        content: propTypes.string.isRequired,
    }).isRequired,
    onUpdate: propTypes.func.isRequired,
    onDelete: propTypes.func.isRequired,
};

/**
 * 4. Convert the returned data (if your backend returns an object)
 *    to an array. If your backend already returns an array, you can skip this.
 */
function submissionsObjectToArray(Data) {
    const keys = Object.keys(Data);
    const subs = keys.map((key) => Data[key]);
    return subs;
}

/**
 * 5. Main Submissions Component
 */
function Submissions() {
    const [error, setError] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [addingSubmission, setAddingSubmission] = useState(false);
    const [updatingSubmission, setUpdatingSubmission] = useState(false);

    // State for update form
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateAuthorEmail, setUpdateAuthorEmail] = useState('');
    const [updateContent, setUpdateContent] = useState('');

    // 5.1. Fetch submissions from backend
    const fetchSubmissions = async () => {
        try {
            const { data } = await axios.get(SUBMISSIONS_READ_ENDPOINT);
            // If your backend returns an array directly, just setSubmissions(data).
            // If your backend returns an object of objects, convert to array:
            setSubmissions(submissionsObjectToArray(data));
        } catch (error) {
            if (!error.response) {
                setError('Network error. Please check your internet connection.');
            } else {
                setError(
                    `There was a problem retrieving the list of submissions. ${
                        error.response.data?.message || error.message
                    }`
                );
            }
        }
    };

    // 5.2. Show the AddSubmissionForm
    const showAddSubmissionForm = () => {
        setAddingSubmission(true);
    };
    const hideAddSubmissionForm = () => {
        setAddingSubmission(false);
    };

    // 5.3. Update submission logic
    const handleUpdate = (submission) => {
        setUpdatingSubmission(true);
        setUpdateTitle(submission.title);
        setUpdateAuthorEmail(submission.authorEmail);
        setUpdateContent(submission.content);
    };

    const updateSubmission = async (event) => {
        event.preventDefault();
        setError('');

        if (!updateAuthorEmail) {
            setError('Please enter the author email to update.');
            return;
        }

        const updatedData = {
            title: updateTitle.trim(),
            authorEmail: updateAuthorEmail.trim(),
            content: updateContent.trim(),
        };

        try {
            await axios.put(SUBMISSIONS_READ_ENDPOINT, updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            setUpdatingSubmission(false);
            fetchSubmissions();
        } catch (error) {
            console.error('PUT request failed:', error.response?.data || error);
            setError(
                `There was a problem updating the submission. ${
                    error.response?.data?.message || error.message
                }`
            );
        }
    };

    // 5.4. Delete submission logic
    const handleDelete = (authorEmail) => {
        if (!authorEmail) {
            setError('Invalid author email for deletion.');
            return;
        }

        axios
            .delete(SUBMISSIONS_DELETE_ENDPOINT, {
                data: { authorEmail },
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            })
            .then(() => {
                fetchSubmissions();
            })
            .catch((error) => {
                console.error('DELETE request failed:', error.response?.data || error);
                setError(
                    `There was a problem deleting the submission. ${
                        error.response?.data?.message || error.message
                    }`
                );
            });
    };

    // 5.5. Use `useEffect` to fetch submissions on mount
    useEffect(() => {
        fetchSubmissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 5.6. Render
    return (
        <div className="wrapper">
            <header>
                <h1>View All Submissions</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button type="button" onClick={showAddSubmissionForm}>
                        Add a Submission
                    </button>
                </div>
            </header>

            <AddSubmissionForm
                visible={addingSubmission}
                cancel={hideAddSubmissionForm}
                fetchSubmissions={fetchSubmissions}
                setError={setError}
            />

            {error && <ErrorMessage message={error} />}

            {submissions.map((submission) => (
                <Submission
                    key={submission.title}
                    submission={submission}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            ))}

            {updatingSubmission && (
                <form
                    onSubmit={updateSubmission}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                    <label>Title:</label>
                    <input
                        type="text"
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                    />

                    <label>Author Email (ID):</label>
                    <input
                        type="email"
                        value={updateAuthorEmail}
                        onChange={(e) => setUpdateAuthorEmail(e.target.value)}
                    />

                    <label>Content:</label>
                    <textarea
                        value={updateContent}
                        onChange={(e) => setUpdateContent(e.target.value)}
                    />

                    <div
                        style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
                    >
                        <button type="button" onClick={() => setUpdatingSubmission(false)}>
                            Cancel
                        </button>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Submissions;
