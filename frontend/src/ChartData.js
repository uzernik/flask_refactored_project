// ChartData.js
// taking json:
// etf: close, norm_close, detrended, norm_detrended, smoothed, smoothed1, smoothed2

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
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

const ChartData = ({ chartData, selectedEtfs }) => {
  // Define distinct colors for the 4 ETFs
  const distinctColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']; // Blue, Orange, Green, Red

  // Assign each ETF a distinct color based on its index
  const etfColors = {};
  selectedEtfs.forEach((etf, index) => {
    etfColors[etf] = distinctColors[index % distinctColors.length];
  });

  const filteredDates = useMemo(() => {
    return Object.keys(chartData?.data || {}).filter(date =>
      selectedEtfs.some(etf => chartData.data[date]?.[etf] !== undefined)
    );
  }, [chartData, selectedEtfs]);

  //const my_graphs = ["Close", "Norm Close", "Det", "Norm Det"];
  const my_graphs = ["Close", "Norm Close", "Det", "Norm Det", "Smoothed", "Smoothed1", "Smoothed2"];
  const ii = 3; // Index for "Norm Det" as per your example
  const normDetIndex = 3; // Index for "Norm Det"
  const smoothedIndex = 4; // Index for "Smoothed"
  const smoothedIndex1 = 5; // Index for "Smoothed1"    
  const smoothedIndex2 = 6; // Index for "Smoothed2"    


  // Memoize line chart data
  const lineChartData = useMemo(() => {
    return {
      labels: filteredDates,
      datasets: selectedEtfs.map((etf, idx) => ({
        label: etf,
        data: filteredDates.map(date => Math.round(chartData.data[date]?.[etf]?.[ii] ?? 0)),
        fill: false,
        borderColor: etfColors[etf], // Use assigned distinct color
        borderWidth: 2,
        backgroundColor: etfColors[etf], // Use the same color for the background
        borderDash: [],
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderWidth: 2
      }))
    };
  }, [filteredDates, selectedEtfs, chartData, etfColors, ii]);


  // Memoize line chart data to include both Norm Det and Smoothed
  const combinedLineChartData = useMemo(() => {
    return {
      labels: filteredDates,
      datasets: selectedEtfs.flatMap((etf, idx) => ([
	{
	  label: `${etf} - Norm Det`,
	  data: filteredDates.map(date => Math.round(chartData.data[date]?.[etf]?.[normDetIndex] ?? 0)),
	  fill: false,
	  borderColor: etfColors[etf], // Use assigned distinct color
	  borderWidth: 2,
	  backgroundColor: etfColors[etf], // Use the same color for the background
	  borderDash: [], // Solid line for Norm Det
	  pointStyle: 'circle',
	  pointRadius: 3,
	  pointBorderWidth: 2
	},
	{
	  label: `${etf} - Smoothed`,
	  data: filteredDates.map(date => Math.round(chartData.data[date]?.[etf]?.[smoothedIndex]-20 ?? 0)),
	  fill: false,
	  borderColor: etfColors[etf], // Use assigned distinct color
	  borderWidth: 2,
	  backgroundColor: etfColors[etf], // Use the same color for the background
	  borderDash: [5, 5], // Dashed line for Smoothed
	  pointStyle: 'triangle',
	  pointRadius: 3,
	  pointBorderWidth: 2
	},
	{
	  label: `${etf} - Smoothed1`,
	  data: filteredDates.map(date => Math.round(chartData.data[date]?.[etf]?.[smoothedIndex1]-40 ?? 0)),
	  fill: false,
	  borderColor: etfColors[etf], // Use assigned distinct color
	  borderWidth: 2,
	  backgroundColor: etfColors[etf], // Use the same color for the background
	  borderDash: [5, 5], // Dashed line for Smoothed
	  pointStyle: 'triangle',
	  pointRadius: 3,
	  pointBorderWidth: 2
	},
	{
	  label: `${etf} - Smoothed2`,
	  data: filteredDates.map(date => Math.round(chartData.data[date]?.[etf]?.[smoothedIndex2]-60 ?? 0)),
	  fill: false,
	  borderColor: etfColors[etf], // Use assigned distinct color
	  borderWidth: 2,
	  backgroundColor: etfColors[etf], // Use the same color for the background
	  borderDash: [5, 5], // Dashed line for Smoothed
	  pointStyle: 'triangle',
	  pointRadius: 3,
	  pointBorderWidth: 2
	}
      ]))
    };
  }, [filteredDates, selectedEtfs, chartData, etfColors, normDetIndex, smoothedIndex]);


  // Memoize line chart data for Smoothed
  const smoothedLineChartData = useMemo(() => {
    return {
      labels: filteredDates,
      datasets: selectedEtfs.map((etf, idx) => ({
	label: `${etf} - Smoothed2`,
	data: filteredDates.map(date => Math.round(chartData.data[date]?.[etf]?.[smoothedIndex] ?? 0)),
	fill: false,
	borderColor: etfColors[etf], // Use assigned distinct color
	borderWidth: 2,
	backgroundColor: etfColors[etf], // Use the same color for the background
	borderDash: [5, 5], // Dashed line for smoothed data
	pointStyle: 'triangle',
	pointRadius: 3,
	pointBorderWidth: 2
      }))
    };
  }, [filteredDates, selectedEtfs, chartData, etfColors, smoothedIndex]);

  const whichLineChartData = smoothedLineChartData;

  return (
    <div className="chart-container">
      <h2><strong style={{ color: 'darkblue' }}>ETF Data Overview</strong></h2>
      <div style={{ marginTop: '30px' }}>
	<Line data={whichLineChartData} options={{
	  responsive: true,
	  plugins: {
	    legend: {
	      labels: {
		usePointStyle: true,
		font: {
		  size: 14,
		  weight: 'bold'
		},
		color: (ctx) => ctx.dataset?.borderColor || 'black',
	      }
	    },
	    tooltip: {
	      callbacks: {
		label: (context) => `${context.dataset.label}: ${context.raw}`
	      }
	    }
	  }
	}} />
      </div>
    </div>
  );
};

export default ChartData;
