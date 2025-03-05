import React, { useState, useEffect } from 'react';

export const Workflows = () => {
  const [rawData, setRawData] = useState<string>('');

  useEffect(() => {
    fetch('https://intelligentdms.onrender.com/api/workflow_new')
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
