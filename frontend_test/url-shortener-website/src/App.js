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
    console.log(window.location.pathname);
    console.log('Shortened path:', shortenedPart);
    // If there is a shortened part, make the GET request
    if (shortenedPart) {
      handleRedirect(shortenedPart);
    }
  }, []);

  const handleRedirect = async (shortenedPart) => {
    try {
      const newURL = 'http://localhost:5000?shortened=' + shortenedPart;
      console.log(newURL);
      const response = await axios.get(newURL);

      if (response.status === 200) {
        const originalURL = response.data.originalURL;
        window.location.href = originalURL;
      } else {
        console.log('sadas');
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Error handling redirect:', error.message);
    }
  };

  const handleSubmit = async () => {
    const submitObject = {
      url: inputURL,
    };
    try {
      const response = await axios.post('http://localhost:5000', submitObject);
      console.log(response.data);
      setOutputURL(response.data.value);
    } catch (error) {
      console.error('Error submitting data:', error.message);
    }
  };

  return (
    <div>
      <label htmlFor='longURL'></label>
      <input
        id='longURL'
        value={inputURL}
        onChange={(e) => setInputURL(e.target.value)}
      ></input>
      <button onClick={handleSubmit}>Shorten this URL!</button>
      {outputURL && (
        <p>
          Shortened URL:{' '}
          <a href={`http://localhost:3000/${outputURL}`}>
            amanthakkar.com/{outputURL}
          </a>
        </p>
      )}
    </div>
  );
}

export default App;
