// src/BarChartComponent.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../index.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, PieChart, RadialBar, RadialBarChart, ComposedChart, Line , Area} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data01, setData01] = useState([]);
  const [data02, setData02] = useState([]);
  const [data03, setData03] = useState([]);
  const [data04, setData04] = useState([]);

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:8081/csi-data') // Update the URL as per your backend endpoint
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:8081/sen-data') // Update the URL as per your backend endpoint
      .then((response) => {
        console.log(response.data);
        setData2(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);
  
  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:8081/gram-data') // Update the URL as per your backend endpoint
      .then((response) => {
        console.log(response.data);
        setData3(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:8081/perc-data') // Update the URL as per your backend endpoint
      .then((response) => {
        console.log(response.data);
        setData01(response.data);
        setData02(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:8081/score-data') // Update the URL as per your backend endpoint
      .then((response) => {
        console.log(response.data);
        //setData01(response.data);
        setData03(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://localhost:8081/score2-data') // Update the URL as per your backend endpoint
      .then((response) => {
        console.log(response.data);
        //setData01(response.data);
        setData04(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const displayResults = (data3) => {
    return data3.map(item => item.grammar_result).join('\n');
  };

  return (
    <div className="dashboard-container">
      <div className="charts-row">
        <ResponsiveContainer width="50%" height={190}>
          <ComposedChart width={600} height={300} data={data04}>
            <XAxis dataKey="id" />
            <YAxis datakey="overall_score"/>
            <Tooltip />
            <Legend />
            <CartesianGrid stroke="#f5f5f5" />
            <Area type="monotone" dataKey="overall_score" fill="#8884d8" stroke="#8884d8" />
            <Bar dataKey="grammar" barSize={20} fill="#413ea0" />
            <Line type="monotone" dataKey="csi" stroke="#82ca9d" />
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="50%" height={190}>
          <RadialBarChart 
            width={10} 
            height={10} 
            innerRadius="20%" 
            outerRadius="80%" 
            data={data03} 
            startAngle={180} 
            endAngle={0}
          >
            <RadialBar minAngle={15} label={{ fill: '#666', position: 'insideStart' }} background clockWise={true} dataKey='overall_score' />
            <Legend iconSize={10} width={120} height={100} layout='vertical' verticalAlign='middle' align="right" />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="charts-row">
    <ResponsiveContainer width="50%" height={190}>
      <BarChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="csi_score" fill="#8884d8" />
      </BarChart>
    
    
    
    
      <BarChart
        width={600}
        height={300}
        data={data2}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sentence" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="csi_sen" fill="#8884d8" />
      </BarChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="50%" height={190}>
      <table border={1}>
            <tr>
              <th>User's sentence</th>
              <th>Correct sentence</th>
              
            </tr>
            {data3.map(item => (
              <tr key={item.id}>
                <td>{item.user_sentence}</td>
                <td>{item.corrected_sentence}</td>
              </tr>
            ))}
          </table>
      </ResponsiveContainer>
    </div>
    <div>
    
    </div>
  </div>
  );
};

export default Dashboard;
