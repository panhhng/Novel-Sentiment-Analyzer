import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [pastEntries, setPastEntries] = useState([]);
  const [showPastEntries, setShowPastEntries] = useState(false); 

  useEffect(() => {
    const fetchPastEntries = async () => {
      try {
        const response = await axios.get('/past-entries');
        setPastEntries(response.data);
      } catch (error) {
        console.error('Error fetching past entries', error);
      }
    };

    fetchPastEntries();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults([response.data]); 
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  const togglePastEntries = () => {
    setShowPastEntries(!showPastEntries);
  };

  return (
    <div className="App">
      <h1>Sentiment Analysis of Novel</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <input type="file" onChange={handleFileChange} className="file-input" />
        </div>
        <button type="submit" className="submit-button">Upload and Analyze</button>
      </form>
      {results && (
        <div className="results-section">
          <h2>Analysis Results</h2>
          <div className="result">
            <h3>Chapter Preview: {results[0].chapter}</h3>
            <p>{results[0].sentiment}</p>
          </div>
        </div>
      )}
      <button onClick={togglePastEntries} className="toggle-button">
        {showPastEntries ? 'Hide Past Entries' : 'Show Past Entries'}
      </button>
      {showPastEntries && (
        <div className="history-section">
          <h2>Past Entries</h2>
          {pastEntries.map((entry, index) => (
            <div key={index} className="history-entry">
              <h3>Chapter Preview: {entry.text.slice(0, 30)}</h3>
              <p>{entry.results}</p>
              <p>Date: {new Date(entry.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
