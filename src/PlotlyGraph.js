import React from 'react';
import Plot from 'react-plotly.js';

const PlotlyGraph = (props) => {


  // result traces
  const trace1XData = props.data.resultData.map((result) => result.PCATransformedCoord[0]);
  const trace1YData = props.data.resultData.map((result) => result.PCATransformedCoord[1]);
  const trace1ZData = props.data.resultData.map((result) => result.PCATransformedCoord[2]);
  const trace1CustomData = props.data.resultData.map((result, index) => [result.mnemonic + " " + result.catalog_number, index]);


  // get trace2 (the query)
  const trace2XData = [props.data.PCATransformedQuery[0]];
  const trace2YData = [props.data.PCATransformedQuery[1]];
  const trace2ZData = [props.data.PCATransformedQuery[2]];
  const trace2CustomData = [["Query", -1]];


  const firstResultPoint = [trace1XData[0], trace1YData[0], trace1ZData[0]];
  const queryPoint = [trace2XData[0], trace2YData[0], trace2ZData[0]];


  console.log(firstResultPoint);
  console.log(queryPoint);
  console.log(arraysEqualWithTolerance(firstResultPoint, queryPoint, 4));


  // check if the first result is the same as the query
  if (arraysEqualWithTolerance(firstResultPoint, queryPoint, 4)) {
    // if so, remove the first result from the result traces
    trace2CustomData[0][0] = "Query: " + trace1CustomData[0][0];

    trace1XData.shift(); trace1YData.shift(); trace1ZData.shift(); trace1CustomData.shift();
  }

function arraysEqualWithTolerance(arr1, arr2, decimalPlaces) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (Math.abs(arr1[i] - arr2[i]) > Math.pow(10, -decimalPlaces)) {
      return false;
    }
  }

  return true;
}


  const trace1 = {
    x: trace1XData,
    y: trace1YData,
    z: trace1ZData,
    mode: 'markers',
    type: 'scatter3d',
    marker: {color: '#3da0fc'},
    name: 'Results',
    customdata: trace1CustomData,
    hoverinfo: 'x+y+z+customdata',
    hovertemplate: '<b>%{customdata[0]}</b><br>%{x:.3f}<br>%{y:.3f}<br>%{z:.3f}',
    showlegend: false, // Hide the legend for this trace
  }

  const trace2 = {
    x: trace2XData,
    y: trace2YData,
    z: trace2ZData,
    mode: 'markers',
    type: 'scatter3d',
    name: 'Search Query',
    marker: {color: '#fca03d', symbol: 'star'},
    customdata: trace2CustomData,
    hoverinfo: 'x+y+z+customdata',
    hovertemplate: '<b>%{customdata[0]}</b><br>%{x:.3f}<br>%{y:.3f}<br>%{z:.3f}',
    showlegend: false, // Hide the legend for this trace
  }

  const graphData = [trace1, trace2];

  const layout = {
    title: {
      font: {
        size: 24, // Adjust the font size as needed
      },
    },
    paper_bgcolor: '#282c34', // Replace with your desired background hex color
  plot_bgcolor: '#282c34',  // Replace with the same or a different color

    scene: {
      xaxis: { title: 'X', showgrid: false, visible:false, color: 'white'},  // Set X-axis color to white},
      yaxis: { title: 'Y', showgrid: false, visible: false, color: 'white'},  // Set X-axis color to white},
      zaxis: { title: 'Z', showgrid: false, visible: false, color: 'white'},  // Set X-axis color to white},
    },
    xaxis: { color: 'white'},  // Set X-axis color to white},
    yaxis: { color: 'white'},  // Set X-axis color to white},
    zaxis: { color: 'white'},  // Set X-axis color to white},
  
    // },

font: {
    color: 'white'  // Set text color to white
  }  ,
  autosize: true,  // Allow the plot to adjust its size
  margin: {
    l: 2,  // Adjust left margin
    r: 2,  // Adjust right margin
    b: 2,  // Adjust bottom margin
    t: 70   // Adjust top margin
  },
  xanchor: 'center', // Anchor point for x-axis
  yanchor: 'bottom', // Anchor point for y-axis
};

  return (
    <Plot
      data={graphData}
      layout={layout}
    />
  );
}

export default PlotlyGraph;
