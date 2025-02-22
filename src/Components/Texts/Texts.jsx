import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';


const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;

// Component to render an individual text entry
function TextItem({ text, fetchTexts }) {
  // Destructure the properties of the text entry.
  const { key, title, text: content } = text;

  const deleteText = () => {
    axios
      .delete(TEXT_DELETE_ENDPOINT, { data: { key } })
      .then(fetchTexts)
      .catch((error) => {
        console.error('There was a problem deleting the text.', error);
      });
  };

  return (
    <div className="text-item">
      <h2>{title}</h2>
      <p>{content}</p>
      <button onClick={deleteText}>Delete Text</button>
    </div>
  );
}

TextItem.propTypes = {
  text: propTypes.shape({
    key: propTypes.string.isRequired,
    title: propTypes.string.isRequired,
    text: propTypes.string.isRequired,
  }).isRequired,
  fetchTexts: propTypes.func.isRequired,
};

function ErrorMessage({ message }) {
  return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
  message: propTypes.string.isRequired,
};

function textsObjectToArray(data) {
  const keys = Object.keys(data);
  const texts = keys.map((key) => data[key]);
  return texts;
}

function Texts() {
  const [error, setError] = useState('');
  const [texts, setTexts] = useState([]);

  const fetchTexts = () => {
    axios
      .get(TEXT_READ_ENDPOINT)
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setTexts(data);
        } else {
          setTexts(textsObjectToArray(data));
        }
      })
      .catch((error) =>
        setError(`There was a problem retrieving the texts. ${error}`)
      );
  };

  useEffect(() => {
    fetchTexts();
  }, []);

  return (
    <div className="wrapper">
      <header>
        <h1>View All Texts</h1>
      </header>
      {error && <ErrorMessage message={error} />}
      {texts.map((textItem) => (
        <TextItem key={textItem.key} text={textItem} fetchTexts={fetchTexts} />
      ))}
    </div>
  );
}

export default Texts;
