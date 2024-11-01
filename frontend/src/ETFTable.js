// ETFTable.js
import React, { useEffect, useState } from 'react';

function ETFTable() {
  const [etfData, setEtfData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[ETFTable] useEffect for fetching ETF data');

    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/etfs`);
        const data = await response.json();
        console.log('[ETFTable] ETF data fetched successfully', data);
        setEtfData(data);
      } catch (error) {
        console.error('[ETFTable] Error fetching ETF data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Log the rendering cycle to check state changes.
  useEffect(() => {
    console.log('[ETFTable] Render cycle - etfData:', etfData);
  });

  if (isLoading) {
    console.log('[ETFTable] Loading data...');
    return <div>Loading...</div>;
  }

  if (!Object.keys(etfData).length) {
    console.log('[ETFTable] No data available');
    return <div>No data available</div>;
  }

  return (
    <div className="table-responsive">
      <table className="etf-table">
        <thead>
          <tr>
            <th>Date</th>
            {Object.keys(etfData[Object.keys(etfData)[0]]).map(etf => (
              <th key={etf}>{etf}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(etfData).map(([date, etfValues]) => (
            <tr key={date}>
              <td>{date}</td>
              {Object.entries(etfValues).map(([etf, value]) => (
                <td key={etf}>
                  {value.Close} {/* Assuming 'Close' is the value we want to display */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ETFTable;
