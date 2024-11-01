import React, { useState } from 'react';
import Select from 'react-select';

function MultiSelectTest() {
  const [selectedEtfs, setSelectedEtfs] = useState([]);
  const etfs = [
    { value: 'BND', label: 'BND' },
    { value: 'IVV', label: 'IVV' },
    { value: 'VOO', label: 'VOO' },
    { value: 'QQQ', label: 'QQQ' }
  ];

  const handleEtfSelection = (selectedOptions) => {
    setSelectedEtfs(selectedOptions ? selectedOptions.map(option => option.value) : []);
    console.log('Selected ETFs:', selectedOptions);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Select ETFs</h2>
      <Select
        isMulti
        options={etfs}
        value={selectedEtfs.map(etf => ({ value: etf, label: etf }))}
        onChange={handleEtfSelection}
        placeholder="Select ETFs..."
      />
      <div>
        <h4>Selected:</h4>
        <ul>
          {selectedEtfs.map(etf => (
            <li key={etf}>{etf}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MultiSelectTest;
