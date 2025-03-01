import React, { useState, useEffect } from 'react';

export const Workflows = () => {
  const [rawData, setRawData] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8000/api/workflow_news')
      .then(response => response.text())
      .then(text => {
        console.log('Raw response text:', text);
        setRawData(text);
      })
      .catch(error => console.error('Error fetching workflows:', error));
  }, []);

  return (
    <div>
      <h2>Raw Workflow Data</h2>
      <pre>{rawData}</pre>
    </div>
  );
};
