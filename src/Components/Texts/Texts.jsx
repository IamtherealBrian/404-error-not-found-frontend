import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';


const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_CREATE_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;

// Form component to add a new text entry
function AddTextForm({ visible, cancel, fetchTexts, setError }) {
  const [keyValue, setKeyValue] = useState('');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  const changeKey = (e) => setKeyValue(e.target.value);
  const changeTitle = (e) => setTitle(e.target.value);
  const changeText = (e) => setTextContent(e.target.value);

  const addText = (event) => {
    event.preventDefault();
    const newText = {
      key: keyValue,
      title: title,
      text: textContent,
    };

    axios.post(TEXT_CREATE_ENDPOINT, newText)
      .then(() => {
        fetchTexts();   // Refresh the list after adding
        cancel();       // Hide the form
      })
      .catch((error) => {
        setError(`There was a problem adding the text. ${error}`);
      });
  };

  if (!visible) return null;
  return (
    <form>
      <label htmlFor="key">Key</label>
      <input 
        required 
        type="text" 
        id="key" 
        value={keyValue} 
        onChange={changeKey} 
      />

      <label htmlFor="title">Title</label>
      <input 
        required 
        type="text" 
        id="title" 
        value={title} 
        onChange={changeTitle} 
      />

      <label htmlFor="text">Text</label>
      <textarea 
        required 
        id="text" 
        value={textContent} 
        onChange={changeText}
      ></textarea>

      <button type="button" onClick={cancel}>Cancel</button>
      <button type="submit" onClick={addText}>Submit</button>
    </form>
  );
}
AddTextForm.propTypes = {
  visible: propTypes.bool.isRequired,
  cancel: propTypes.func.isRequired,
  fetchTexts: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
};

// Component to render an individual text entry
function TextItem({ text, fetchTexts }) {
  // Destructure the properties of the text entry.
  const { key, title, text: content } = text;

    const deleteText = () => {
        console.log("Attempting to delete key:", key); // Debug log

        axios
            .delete(`${TEXT_DELETE_ENDPOINT}?key=${encodeURIComponent(key)}`) // URL 传参
            .then(fetchTexts)
            .catch((error) => {
                console.error("Delete request failed:", error.response ? error.response.data : error.message);
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
    const [addingText, setAddingText] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchTexts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(TEXT_READ_ENDPOINT);
            console.log("Fetched raw data:", data); // Debug log

            let textsArray = Array.isArray(data) ? data : textsObjectToArray(data);

            // 去重：基于 key 过滤重复项
            const uniqueTexts = Array.from(new Map(textsArray.map(item => [item.key, item])).values());

            console.log("Processed unique texts:", uniqueTexts); // Debug log
            setTexts(uniqueTexts);
        } catch (err) {
            setError(`There was a problem retrieving the texts. ${err}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTexts();
    }, []);

    return (
        <div className="wrapper">
            <header>
                <h1>View All Texts</h1>
                <button type="button" onClick={() => setAddingText(true)}>
                    Add Text
                </button>
            </header>

            {loading ? (
                <div className="spinner">Loading...</div>
            ) : (
                texts.map((textItem) => (
                    <TextItem key={textItem.key} text={textItem} fetchTexts={fetchTexts} />
                ))
            )}

            {error && <ErrorMessage message={error} />}

            {addingText && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close" onClick={() => setAddingText(false)}>
                            &times;
                        </button>
                        <AddTextForm
                            visible={true}
                            cancel={() => setAddingText(false)}
                            fetchTexts={fetchTexts}
                            setError={setError}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Texts;
