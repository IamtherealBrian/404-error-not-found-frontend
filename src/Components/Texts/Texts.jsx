import React, { useEffect, useState, useCallback } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Text.css'; // 引入样式文件

const TEXT_READ_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_CREATE_ENDPOINT = `${BACKEND_URL}/text`;
const TEXT_DELETE_ENDPOINT = `${BACKEND_URL}/text/delete`;
const TEXT_UPDATE_ENDPOINT = `${BACKEND_URL}/text`; // 更新（PUT）使用相同的 endpoint

// 添加文本的表单组件
function AddTextForm({ visible, cancel, fetchTexts, setError }) {
  const [keyValue, setKeyValue] = useState('');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  const changeKey = (e) => setKeyValue(e.target.value);
  const changeTitle = (e) => setTitle(e.target.value);
  const changeText = (e) => setTextContent(e.target.value);

  const addText = async (event) => {
    event.preventDefault();
    const newText = { key: keyValue, title, text: textContent };
    try {
      await axios.post(TEXT_CREATE_ENDPOINT, newText, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      fetchTexts();
      cancel();
    } catch (error) {
      console.error("POST request failed:", error.response?.data || error);
      setError(`There was a problem adding the text. ${error.response?.data?.message || error.message}`);
    }
  };

  if (!visible) return null;
  return (
      <form className="add-text-form">
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
        <input
            required
            type="text"
            id="text"
            value={textContent}
            onChange={changeText}
        />

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

function ErrorMessage({ message }) {
  return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
  message: propTypes.string.isRequired,
};

// 如果后端返回的是对象（字典），则将每个键注入对应的对象
function textsObjectToArray(data) {
  const keys = Object.keys(data);
  return keys.map(dictKey => ({ ...data[dictKey], key: dictKey }));
}

function Texts() {
  const [error, setError] = useState('');
  const [texts, setTexts] = useState([]);
  const [addingText, setAddingText] = useState(false);
  const [loading, setLoading] = useState(false);

  // 更新文本的状态
  const [updatingText, setUpdatingText] = useState(false);
  const [updateKey, setUpdateKey] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(TEXT_READ_ENDPOINT);
      const textsArray = Array.isArray(data) ? data : textsObjectToArray(data);
      setTexts(textsArray);
    } catch (err) {
      setError(`There was a problem retrieving the texts. ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除文本
  const deleteText = (key) => {
    if (!key) {
      setError('Invalid key for deletion.');
      return;
    }
    axios.delete(TEXT_DELETE_ENDPOINT, {
      data: { key },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    })
        .then(() => {
          fetchTexts();
        })
        .catch((error) => {
          console.error("DELETE request failed:", error.response?.data || error);
          setError(`There was a problem deleting the text. ${error.response?.data?.message || error.message}`);
        });
  };

  // 填充更新表单并显示更新表单
  const handleUpdate = (text) => {
    console.log("Updating text:", text);
    setUpdatingText(true);
    setUpdateKey(text.key);       // key 由后端提供
    setUpdateTitle(text.title);
    setUpdateContent(text.text);
  };

  // 更新文本函数：发送 PUT 请求更新数据
  const updateText = useCallback(async (event) => {
    event.preventDefault();
    if (!updateKey) {
      setError('Invalid key for update.');
      return;
    }
    const updatedData = { key: updateKey, title: updateTitle, text: updateContent };
    try {
      await axios.put(TEXT_UPDATE_ENDPOINT, updatedData, {
        headers: { "Content-Type": "application/json", "Accept": "application/json" }
      });
      setUpdatingText(false);
      fetchTexts();
    } catch (error) {
      console.error("PUT request failed:", error.response?.data || error);
      setError(`There was a problem updating the text. ${error.response?.data?.message || error.message}`);
    }
  }, [updateKey, updateTitle, updateContent]);

  useEffect(() => {
    fetchTexts();
  }, []);

  return (
      <div className="wrapper">
        <header>
          <h1>View All Texts</h1>
          <button type="button" onClick={() => setAddingText(true)}>Add Text</button>
        </header>

        {error && <ErrorMessage message={error} />}

        {loading ? (
            <div>Loading...</div>
        ) : (
            texts.map((text) => (
                <div key={text.key} className="text-item">
                  <h2>{text.title}</h2>
                  <p>{text.text}</p>
                  <button onClick={() => deleteText(text.key)}>Delete Text</button>
                  <button onClick={() => handleUpdate(text)}>Update Text</button>
                </div>
            ))
        )}

        {addingText && (
            <div className="modal">
              <div className="modal-content">
                <button className="close" onClick={() => setAddingText(false)}>&times;</button>
                <AddTextForm
                    visible={true}
                    cancel={() => setAddingText(false)}
                    fetchTexts={fetchTexts}
                    setError={setError}
                />
              </div>
            </div>
        )}

        {updatingText && (
            <form onSubmit={updateText} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label>Key (ID):</label>
              <input type="text" value={updateKey} readOnly />
              <label>New Title:</label>
              <input type="text" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} />
              <label>New Text:</label>
              <input type="text" value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setUpdatingText(false)}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </form>
        )}
      </div>
  );
}

export default Texts;
