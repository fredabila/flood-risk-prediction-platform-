import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import MapView from './components/MapView';
import SimulationPanel from './components/SimulationPanel';
import RiskDashboard from './components/RiskDashboard';
import WeatherWidget from './components/WeatherWidget';
import CopilotWidget from './components/CopilotWidget';
import './index.css';

function App() {
  const [view, setView] = useState('landing');
  const [liveWeather, setLiveWeather] = useState(null);
  
  // Global simulation state
  const [simulationParams, setSimulationParams] = useState({
    rainfallIntensity: 0, 
    seaLevelRise: 0.5, 
    clearWaterways: false,
    dateOffset: 0 
  });

  // Connect to the FastAPI Backend
  useEffect(() => {
    fetch('http://localhost:8003/api/weather/current')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setLiveWeather(data);
          // Auto-sync the simulation to the real-world weather data!
          setSimulationParams(prev => ({
            ...prev,
            rainfallIntensity: data.precipitation_mm * 15 // Scale up raw mm for visual simulation impact
          }));
        }
      })
      .catch(err => console.error("Backend not running yet", err));
  }, []);

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('app')} />;
  }

  return (
    <div className="app-container">
      {/* Background Map */}
      <MapView params={simulationParams} />

      {/* Floating UI Overlays */}
      <div className="overlay-container">
        {/* Left Side: Controls */}
        <div className="panel-left animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <WeatherWidget weather={liveWeather} />
          <SimulationPanel 
            params={simulationParams} 
            onChange={setSimulationParams} 
          />
        </div>

        {/* Right Side: Analytics */}
        <div className="panel-right animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <RiskDashboard params={simulationParams} />
        </div>
        
        {/* DeepSeek AI Copilot */}
        <CopilotWidget simulationParams={simulationParams} />
      </div>
    </div>
  );
}

export default App;
