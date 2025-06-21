import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DatabaseCheck = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/test-database-connection')
      .then(response => setMessage(response.data))
      .catch(error => setMessage('Connection failed 😢'));
  }, []);

  return <div>{message}</div>;
};

export default DatabaseCheck
