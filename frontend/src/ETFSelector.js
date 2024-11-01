// ETFSelector.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { components } from 'react-select';

const CheckboxOption = (props) => (
  <components.Option {...props}>
    <input
      type="checkbox"
      checked={props.isSelected}
      onChange={() => null} // react-select handles the onChange, this is just for display
      style={{ marginRight: 8 }}
    />
    <label>{props.label}</label>
  </components.Option>
);

function ETFSelector() {
  const [etfs, setEtfs] = useState([]);
  const [selectedEtfs, setSelectedEtfs] = useState([]);
  const [showSelect, setShowSelect] = useState(false);

  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/api/etfs`;
    axios.get(apiUrl)
      .then(response => {
        const extractedEtfs = Array.from(new Set(Object.values(response.data).flatMap(dateData => Object.keys(dateData))));
        setEtfs(extractedEtfs);

        if (extractedEtfs.length > 0 && selectedEtfs.length === 0) {
          setSelectedEtfs([extractedEtfs[0]]);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleSelectEtfs = (selectedOptions) => {
    const newSelectedEtfs = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedEtfs(newSelectedEtfs);
    setEtfs((prevEtfs) => prevEtfs.filter(etf => !newSelectedEtfs.includes(etf)));
  };

  return (
    <div>
      <button
        onClick={() => setShowSelect(!showSelect)}
        style={{
          fontSize: '24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
        aria-label="Open ETF selector"
      >
        +
      </button>
      {showSelect && (
        <Select
          id="etf-select"
          isMulti
          options={etfs.map(etf => ({ value: etf, label: etf }))}
          onChange={handleSelectEtfs}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          components={{ Option: CheckboxOption, MultiValue: () => null, Control: () => null }}
          menuIsOpen={true}
          placeholder=""
          className="multi-select"
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              display: 'none' // Completely hide the control area
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              marginTop: '45px' // Move the dropdown slightly lower to not overlap with headers
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#d3d3d3' : base.backgroundColor,
              color: state.isSelected ? '#000' : base.color,
            })
          }}
        />
      )}
    </div>
  );
}

export default ETFSelector;
