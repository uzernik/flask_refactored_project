// Legend.js
import React from 'react';
import etfsInfo from './data/etfs_info.json'; // Assuming etfs_info.json is in the same folder

const Legend = ({ selectedEtfs }) => {
  return (
    <div className="etf-legend">
      <h3>Legend</h3>
      <table>
        <thead>
          <tr>
            <th>ETF</th>
            <th>Sector</th>
            <th>Sector Size (in Billions USD)</th>
          </tr>
        </thead>
        <tbody>
          {selectedEtfs.map(etf => (
            <tr key={etf}>
              <td>{etf}</td>
              <td>{etfsInfo[etf]?.sector || 'N/A'}</td>
              <td>{etfsInfo[etf]?.sectorSize || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Legend;
