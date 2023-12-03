// App.js

import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [inputURL, setInputURL] = useState('');
  const [outputURL, setOutputURL] = useState('');

  useEffect(() => {
    // Extract the shortened part from the URL
    const shortenedPart = window.location.pathname.substring(1);
    // If there is a shortened part, make the GET request
    if (shortenedPart) {
      handleRedirect(shortenedPart);
    }
  }, []);

  const handleRedirect = async (shortenedPart) => {
    try {
      const newURL = 'http://localhost:5000?shortened=' + shortenedPart;
      const response = await axios.get(newURL);
      if (response.status === 200) {
        const originalURL = response.data.originalURL;
        window.location.href = originalURL;
      }
    } catch (error) {
      window.location.href = 'http://localhost:3000';

      console.error('Error handling redirect:', error.message);
    }
  };

  const handleCopy = () => {
    // Copy the shortened URL to the clipboard
    navigator.clipboard.writeText(`http://localhost:3000/${outputURL}`);
    alert('Shortened URL copied to clipboard!');
  };

  const handleSubmit = async () => {
    const submitObject = {
      url: inputURL,
    };
    try {
      const response = await axios.post('http://localhost:5000', submitObject);
      setOutputURL(response.data.value);
    } catch (error) {
      console.error('Error submitting data:', error.message);
    }
  };

  const formatInputURL = () => {
    if (inputURL.length > 40) {
      return `${inputURL.substring(0, 40)}...`;
    }
    return inputURL;
  };

  return (
    <div className='container'>
      <div className='input-container'>
        <input
          id='longURL'
          className='input-field'
          placeholder='Enter a URL to be shortened'
          value={inputURL}
          onChange={(e) => setInputURL(e.target.value)}
        />
      </div>

      <button className='submit-button' onClick={handleSubmit}>
        Shorten this URL!
      </button>

      {outputURL && (
        <div className='output-url'>
          <p>
            <em>{formatInputURL()}</em> is shortened to{' '}
            <span>
              <a href={`http://localhost:3000/${outputURL}`}>
                amanthakkar.com/{outputURL}
              </a>
            </span>{' '}
            <span role='img' aria-label='copy-icon' onClick={handleCopy}>
              📋
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
