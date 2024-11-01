// TableResponsive.js
import React from 'react';

function TableResponsive({ etfData, selectedEtfs, getColor, handleDeselectEtf, columnsToExclude = [] }) {
  // Filter etfData to start from the first month that has data for selectedEtfs
  const filteredEtfData = Object.entries(etfData).filter(([date, etfsData]) => {
    return selectedEtfs.some(etf => etfsData[etf] && etfsData[etf].Close !== undefined);
  });
  let last_month = null;
  return (
    <div className="table-responsive">
      <table className="etf-table">
        <thead>
          <tr>
            <th></th>
            {selectedEtfs.map(etf => (
              <th colSpan={6 - columnsToExclude.length} key={`${etf}-main`} className='bold-left-border'>
                {etf}
                <button
                  onClick={() => handleDeselectEtf(etf)}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'red',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  aria-label={`Remove ${etf}`}
                >
                  X
                </button>
              </th>
            ))}
          </tr>
          <tr>
            <th>Date</th>
            {selectedEtfs.flatMap(etf => {
              const columns = [
                { key: 'close', label: 'Close' },
                { key: 'glp', label: 'GL%' },
                { key: 'dc', label: 'Detrend' },
                { key: 'mm', label: 'MM' },
                { key: 'zs', label: 'ZS' },
                { key: 'lt', label: 'LT' }
              ];
              return columns
                .filter(column => !columnsToExclude.includes(column.key))
                .map(column => (
                  <th key={`${etf}-${column.key}`} className={column.key === 'close' ? 'bold-left-border' : ''}>{column.label}</th>
                ));
            })}
          </tr>
        </thead>
        <tbody>
          {
           //let last_month = null;
           filteredEtfData.map(([date, etfsData]) => {
            const [year, month] = date.split('-').map(Number);
            //const isEvenYear = year % 2 === 0;
            //const isDec = month === 12;
            //const shouldInsertHeader = isEvenYear && isDec;
            let shouldInsertHeader = false;

	    if (last_month !== null) {
		const diff = month - last_month;
		if (diff != 0) {
		    shouldInsertHeader = true;
		}
		//console.log(`Difference: ${diff}`);
	    }
	    last_month = month;
	      
            return (
              <React.Fragment key={date}>
                {shouldInsertHeader && (
                  <tr className="interval-header">
                    <th>Date</th>
                    {selectedEtfs.map(etf => (
                      <th colSpan={6 - columnsToExclude.length} key={`${etf}-interval`} className='bold-left-border'>
                        {etf}
                      </th>
                    ))}
                  </tr>
                )}
                <tr>
                  <td>{date}</td>
                  {selectedEtfs.flatMap(etf => {
                    const data = etfsData[etf] || { Close: 0, DC: 0, GLP: 0, MM: 0, ZS: 0, LT: 0 };
                    const columns = [
                      { key: 'close', value: data.Close, style: 'bold-left-border' },
                      { key: 'glp', value: data.GLP },
                      { key: 'dc', value: data.DC, style: getColor(data.DC) },
                      { key: 'mm', value: data.MM, style: getColor(data.MM * 100) },
                      { key: 'zs', value: data.ZS, style: getColor((data.ZS + 3) * 16.67) },
                      { key: 'lt', value: data.LT, style: getColor(data.LT) }
                    ];
                    return columns
                      .filter(column => !columnsToExclude.includes(column.key))
                      .map(column => (
                        <td key={`${date}-${etf}-${column.key}`} className={column.key === 'close' ? 'bold-left-border' : ''} style={column.style ? { backgroundColor: column.style } : undefined}>
                          {column.value}
                        </td>
                      ));
                  })}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TableResponsive;
