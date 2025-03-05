import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
 
import { BACKEND_URL } from '../../constants';
import './People.css';

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
  const [affiliation, setAffiliation] = useState('');
  const [roles, setRoles] = useState('');

  const changeName = (event) => { setName(event.target.value); };
  const changeEmail = (event) => { setEmail(event.target.value); };
  const changeAffiliation = (event) => { setAffiliation(event.target.value); };
  const changeRoles = (event) => { setRoles(event.target.value); };

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
      setLoading(true);
      setError('');

      // Format the data exactly as expected by the backend
      const newPerson = {
          name: name.trim(),
          email: email.trim(),
          roles: roles.trim(),
          affiliation: affiliation.trim()
      };

      try {
          console.log('Sending request to:', PEOPLE_CREATE_ENDPOINT);
          console.log('Request data:', newPerson);
          const response = await axios.post(PEOPLE_CREATE_ENDPOINT, newPerson, {
              headers: { 
                  "Content-Type": "application/json",
                  "Accept": "application/json"
              },
              // Remove withCredentials to avoid CORS preflight issues
              validateStatus: function (status) {
                  return status < 500; // Accept any status code less than 500
              }
          });
          
          if (response.status === 200 || response.status === 201) {
              console.log('Success response:', response);
              fetchPeople();
              cancel();
          } else {
              console.warn('Unexpected status code:', response.status);
              setError(`Unexpected response from server: ${response.status} ${response.statusText}`);
          }
      } catch (error) {
          console.error("POST request failed:", error);
          if (error.response) {
              console.error("Error status:", error.response.status);
              console.error("Error headers:", error.response.headers);
              console.error("Error data:", error.response.data);
              setError(`Server error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`);
          } else if (error.request) {
              console.error("No response received:", error.request);
              setError('No response received from server. Please check if the API is running and accessible.');
          } else {
              console.error("Error details:", error);
              setError(`Error: ${error.message}`);
          }
      } finally {
          setLoading(false);
      }
  };

  // Ensure the form is not rendered when `visible` is false
  if (!visible) return null;

  return (
      <form>
          <label htmlFor="name">Name</label>
          <input required type="text" id="name" value={name} onChange={changeName}/>

          <label htmlFor="email">Email</label>
          <input required type="text" id="email" value={email} onChange={changeEmail}/>

          <label htmlFor="affiliation">Affiliation</label>
          <input required type="text" id="affiliation" value={affiliation} onChange={changeAffiliation}/>

          <label htmlFor="roles">Roles</label>
          <input required type="text" id="roles" value={roles} onChange={changeRoles}/>

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
    const { name, email, affiliation, roles } = person;
    return (
        <div className="person-container">
            <Link to={name}>
                <h2>{name}</h2>
                <p>Email: {email}</p>
                <p>Affiliation: {affiliation}</p>
                <p>Roles: {roles}</p>
            </Link>
            <button onClick={() => onUpdate(person)}>Update</button>
            <button onClick={() => onDelete(email)}>Delete</button>
        </div>
    );
}

Person.propTypes = {
    person: propTypes.shape({
        name: propTypes.string.isRequired,
        email: propTypes.string.isRequired,
        affiliation: propTypes.string.isRequired,
        roles: propTypes.string.isRequired,
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
      deletePerson(email);
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

    const deletePerson = (email) => {
        if (!email) {
            setError('Invalid email for deletion.');
            return;
        }
        axios.delete(PEOPLE_DELETE_ENDPOINT, {
            data: { email },
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
            .then(() => {
                fetchPeople();
            })
            .catch((error) => {
                console.error("DELETE request failed:", error.response?.data || error);
                setError(`There was a problem deleting the person. ${error.response?.data?.message || error.message}`);
            });
    };

  const showAddPersonForm = () => { setAddingPerson(true); };
  const hideAddPersonForm = () => { setAddingPerson(false); };

  useEffect(() => {
      fetchPeople();
  }, []);


    return (
        <div className="wrapper">
            <header>
                <h1>View All People</h1>
                <div style={{display: "flex", flexDirection: "column", alignItems: "start", gap: "10px"}}>
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

            {error && <ErrorMessage message={error}/>}

            {people.map((person) => (
                   <Person
                     key={person.name}
                     person={person}
                     onUpdate={handleUpdate}
                     onDelete={handleDelete}
                   />
                 ))}

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

