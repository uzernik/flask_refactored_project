import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Select, { components } from 'react-select';
import './App.css';
import ChartData from './ChartData'; 
import TableResponsive from './TableResponsive';
import MyLegend from './Legend'; 

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const CheckboxOption = (props) => (
  <components.Option {...props}>
    <input
      type="checkbox"
      checked={props.isSelected}
      onChange={() => null}
      style={{ marginRight: 8 }}
    />
    <label>{props.label}</label>
  </components.Option>
);

function App() {
  const [selectedEtfs, setSelectedEtfs] = useState([]);
  const [showSelect, setShowSelect] = useState(false);

  // Set up React Query
  const queryClient = useQueryClient();

  // Fetch ETF Data
  const { data: etfData, isLoading, error } = useQuery({
    queryKey: ['etfs'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/etfs`);
      return response.data;
    }
  });

  // Fetch Chart Data
  const { data: chartData } = useQuery({
    queryKey: ['chartData'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/etfs/chart_data`);
      return response.data;
    },
    enabled: !!etfData, // Only fetch chart data when ETF data is available
  });

  // Mutation to Add ETF
  const addEtfMutation = useMutation({
    mutationFn: (newEtf) => axios.post(`${process.env.REACT_APP_API_URL}/api/etfs/add`, { symbol: newEtf }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch etfs after adding a new one
      queryClient.invalidateQueries(['etfs']);
      setSelectedEtfs((prevSelected) => [variables, ...prevSelected]); // Add successfully added ETF to selectedEtfs
      alert(`ETF ${variables} added successfully.`);
    },
    onError: (error, variables) => {
      alert(`ETF ${variables} could not be added: ${error.message}`);
    }
  });

  // Extract ETF names from the ETF data
  const etfs = Array.isArray(etfData)
    ? etfData
    : Array.from(new Set(Object.values(etfData || {}).flatMap(dateData => Object.keys(dateData || {}))));

  // Add useEffect hook to initialize selectedEtfs with four ETFs
  useEffect(() => {
    if (etfs.length > 0 && selectedEtfs.length === 0) {
      // Set selectedEtfs to the first four ETFs if they exist
      setSelectedEtfs(etfs.slice(0, 4));
    }
  }, [etfs, selectedEtfs]);

  const handleAddNewEtf = () => {
    const newEtfInput = prompt('Enter the new ETF symbol (e.g., QQQ, SPY):');
    if (newEtfInput) {
      const newEtfs = newEtfInput.toUpperCase().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      newEtfs.forEach(newEtf => {
        if (etfs.includes(newEtf)) {
          setSelectedEtfs((prevSelected) => {
            if (!prevSelected.includes(newEtf)) {
              return [newEtf, ...prevSelected];  // Prepend the new ETF to the list
            }
            return prevSelected;
          });
          alert(`ETF ${newEtf} already exists, added to selected ETFs.`);
        } else {
          addEtfMutation.mutate(newEtf);
        }
      });
    }
  };

  // Handle ETF Selection
  const handleSelectEtfs = (selectedOptions) => {
    const newSelectedEtfs = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedEtfs((prevSelected) => {
      const updatedSelected = Array.from(new Set([...prevSelected, ...newSelectedEtfs]));
      return updatedSelected;
    });
  };

  const handleDeselectEtf = (etfToRemove) => {
    setSelectedEtfs((prevSelectedEtfs) => prevSelectedEtfs.filter(etf => etf !== etfToRemove));
  };

  const getColor = (value) => {
    if (value < 0 || value > 100) {
      return 'hsl(0, 0%, 80%)';
    }
    const hueStart = 120;
    const hueEnd = 0;
    const hue = hueStart - (value * (hueStart - hueEnd) / 100);
    return `hsl(${hue}, 100%, 50%)`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  const colors = Array.isArray(etfs) && etfs.length > 0 
    ? etfs.reduce((acc, etf, index) => {
        const hue = (index * 360) / etfs.length;
        acc[etf] = `hsl(${hue}, 100%, 50%)`;
        return acc;
      }, {})
    : {};

  return (
    <div className="App">
      <h1>ETF Data Overview</h1>
      <button
        onClick={() => {
          setShowSelect(!showSelect);
        }}
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
          options={etfs.filter(etf => !selectedEtfs.includes(etf)).map(etf => ({ value: etf, label: etf }))}
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
              display: 'none'
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              marginTop: '45px',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#d3d3d3' : base.backgroundColor,
              color: state.isSelected ? '#000' : base.color,
            })
          }}
        />
      )}
      <button
        onClick={handleAddNewEtf}
        style={{
          fontSize: '16px',
          marginTop: '10px',
          cursor: 'pointer'
        }}
      >
        Add New ETF
      </button>
      <TableResponsive etfData={etfData} selectedEtfs={selectedEtfs} getColor={getColor} handleDeselectEtf={handleDeselectEtf} columnsToExclude={['lt', 'mm', 'zs', 'close']} />
      <ChartData chartData={chartData} selectedEtfs={selectedEtfs} colors={colors} />
    </div>
  );
}

export default App;
