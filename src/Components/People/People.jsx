import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
 
import { BACKEND_URL } from '../../constants';

const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;
const PEOPLE_CREATE_ENDPOINT = `${BACKEND_URL}/people`;
const PEOPLE_DELETE_ENDPOINT = `${BACKEND_URL}/people`;

function AddPersonForm({
  visible,
  cancel,
  fetchPeople,
  setError,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const changeName = (event) => { setName(event.target.value); };
  const changeEmail = (event) => { setEmail(event.target.value); };

  // const addPerson = (event) => {
  //   event.preventDefault();
  //   const newPerson = {
  //     name: name,
  //     email: email,
  //     roles: "ED",
  //     affiliation: "nyu"
  //   };
  //
  //   axios.post(PEOPLE_CREATE_ENDPOINT, newPerson, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Accept": "application/json"
  //     }
  //   })
  //       .then(fetchPeople)
  //       .catch((error) => {
  //         console.error("PUT request failed:", error.response?.data || error);
  //         setError(`There was a problem adding the person. ${error.response?.data?.message || error.message}`);
  //       });
  // };
    //

  // if (!visible) return null;
  // return (
  //   <form>
  //     <label htmlFor="name">
  //       Name
  //     </label>
  //     <input required type="text" id="name" value={name} onChange={changeName} />
  //     <label htmlFor="email">
  //       Email
  //     </label>
  //     <input required type="text" id="email" onChange={changeEmail} />
  //     <button type="button" onClick={cancel}>Cancel</button>
  //     <button type="submit" onClick={addPerson}>Submit</button>
  //   </form>
  // );

  const [loading, setLoading] = useState(false);
  const addPerson = async (event) => {
      event.preventDefault();
      setLoading(true);  // Set loading state to prevent multiple submissions

      const newPerson = {
          name: name,
          email: email,
          roles: "ED",
          affiliation: "nyu"
      };

      try {
          await axios.post(PEOPLE_CREATE_ENDPOINT, newPerson, {
              headers: { "Content-Type": "application/json", "Accept": "application/json" }
          });
          fetchPeople();  // Refresh the list after successful addition
      } catch (error) {
          console.error("POST request failed:", error.response?.data || error);
          setError(`There was a problem adding the person. ${error.response?.data?.message || error.message}`);
      } finally {
          setLoading(false);  // Reset loading state after request completion
      }
  };

  // Ensure the form is not rendered when `visible` is false
  if (!visible) return null;

  return (
    <form>
      <label htmlFor="name">Name</label>
      <input required type="text" id="name" value={name} onChange={changeName} />

      <label htmlFor="email">Email</label>
      <input required type="text" id="email" value={email} onChange={changeEmail} />

      <button type="button" onClick={cancel} disabled={loading}>
        Cancel
      </button>
      <button type="submit" onClick={addPerson} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
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
  return (
    <div className="error-message">
      {message}
    </div>
  );
}
ErrorMessage.propTypes = {
  message: propTypes.string.isRequired,
};

function Person({ person, onUpdate, onDelete }) {
    const { name, email } = person;
    return (
        <div className="person-container">
            <Link to={name}>
                <h2>{name}</h2>
                <p>Email: {email}</p>
            </Link>
            <button onClick={() => onUpdate(person)}>Update</button>
            <button onClick={() => onDelete(person.email)}>Delete</button>
        </div>
    );
}
Person.propTypes = {
    person: propTypes.shape({
        name: propTypes.string.isRequired,
        email: propTypes.string.isRequired,
    }).isRequired,
    onUpdate: propTypes.func.isRequired,
    onDelete: propTypes.func.isRequired,
};

function peopleObjectToArray(Data) {
  const keys = Object.keys(Data);
  const people = keys.map((key) => Data[key]);
  return people;
}

function People() {
  const [error, setError] = useState('');
  const [people, setPeople] = useState([]);
  const [addingPerson, setAddingPerson] = useState(false);
  const [deletingPerson, setDeletingPerson] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [updatingPerson, setUpdatingPerson] = useState(false);
  const [updateEmail, setUpdateEmail] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [updateAffiliation, setUpdateAffiliation] = useState('');
  const [updateRole, setUpdateRole] = useState('');

  const handleUpdate = (person) => {
   setUpdatingPerson(true);
   setUpdateEmail(person.email);
   setUpdateName(person.name);
   setUpdateAffiliation(person.affiliation || '');
   setUpdateRole(person.roles || '');
 };
  const handleDelete = (email) => {
      setDeletingPerson(true);
      setDeleteEmail(email);
  };

  // const fetchPeople = () => {
  //   axios.get(PEOPLE_READ_ENDPOINT)
  //     .then(({ data }) => { setPeople(peopleObjectToArray(data)) })
  //     .catch((error) => setError(`There was a problem retrieving the list of people. ${error}`));
  // };
  const fetchPeople = async () => {
    try {
        const { data } = await axios.get(PEOPLE_READ_ENDPOINT);
        setPeople(peopleObjectToArray(data)); // Convert and set people data
    } catch (error) {
        if (!error.response) {
            setError("Network error. Please check your internet connection.");
        } else {
            setError(`There was a problem retrieving the list of people. ${error.response.data?.message || error.message}`);
        }
    }
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
            role: updateRole || undefined
        };

        axios.put(PEOPLE_READ_ENDPOINT, updatedData, {
            headers: { "Content-Type": "application/json", "Accept": "application/json" }
        })
            .then(() => {
                setUpdatingPerson(false);
                fetchPeople();
            })
            .catch((error) => {
                console.error("PUT request failed:", error.response?.data || error);
                setError(`There was a problem updating the person. ${error.response?.data?.message || error.message}`);
            });
    };

    const deletePerson = (event) => {
        event.preventDefault();
        if (!deleteEmail) {
            setError('Please enter an email to delete.');
            return;
        }

        axios.delete(PEOPLE_DELETE_ENDPOINT, {
            data: { email: deleteEmail },
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
            .then(() => {
                setDeleteEmail('');
                setDeletingPerson(false);
                fetchPeople();
            })
            .catch((error) => {
                console.error("DELETE request failed:", error.response?.data || error);
            });
    };

  const showAddPersonForm = () => { setAddingPerson(true); };
  const hideAddPersonForm = () => { setAddingPerson(false); };

  useEffect(fetchPeople, []);

    return (
        <div className="wrapper">
            <header>
                <h1>View All People</h1>
                <div style={{display: "flex", flexDirection: "column", alignItems: "start", gap: "10px"}}>
                    <button type="button" onClick={showAddPersonForm}>
                        Add a Person
                    </button>

                    <button type="button" onClick={() => setDeletingPerson(true)}>
                        Delete a Person
                    </button>

                    <button type="button" onClick={() => setUpdatingPerson(true)}>
                        Update a Person
                    </button>
                </div>
            </header>

            <AddPersonForm
                visible={addingPerson}
                cancel={hideAddPersonForm}
                fetchPeople={fetchPeople}
                setError={setError}
            />

            {error && <ErrorMessage message={error}/>}

            {people.map((person) => (
                   <Person
                     key={person.name}
                     person={person}
                     onUpdate={handleUpdate}
                     onDelete={handleDelete}
                   />
                 ))}

            {deletingPerson && (
                <form onSubmit={deletePerson}>
                <label htmlFor="delete-email">Enter Email to Delete:</label>
                    <input
                        type="email"
                        id="delete-email"
                        value={deleteEmail}
                        onChange={(e) => setDeleteEmail(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setDeletingPerson(false)}>Cancel</button>
                    <button type="submit">Submit</button>
                </form>
            )}

            {updatingPerson && (
                <form onSubmit={updatePerson} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label>Email (ID):</label>
                    <input type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} />

                    <label>New Name:</label>
                    <input type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />

                    <label>New Affiliation:</label>
                    <input type="text" value={updateAffiliation} onChange={(e) => setUpdateAffiliation(e.target.value)} />

                    <label>New Role:</label>
                    <input type="text" value={updateRole} onChange={(e) => setUpdateRole(e.target.value)} />

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button type="button" onClick={() => setUpdatingPerson(false)}>Cancel</button>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default People;

