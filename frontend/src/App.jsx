import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import MapView from './components/MapView';
import SimulationPanel from './components/SimulationPanel';
import RiskDashboard from './components/RiskDashboard';
import WeatherWidget from './components/WeatherWidget';
import CopilotWidget from './components/CopilotWidget';
import FullDashboard from './components/FullDashboard';
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
    fetch('http://localhost:8004/api/weather/current')
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

  // Fetch ML Prediction dynamically
  const [mlSpread, setMlSpread] = useState(0.008);
  useEffect(() => {
    fetch('http://localhost:8004/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulationParams)
    })
    .then(res => res.json())
    .then(data => {
      // The ML model outputs a probability (e.g. 0.45). Map this to our map's baseSpread.
      setMlSpread((data.flood_probability || 0.4) * 0.02);
    })
    .catch(console.error);
  }, [simulationParams.rainfallIntensity, simulationParams.seaLevelRise, simulationParams.clearWaterways]);

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('app')} />;
  }

  return (
    <div className="app-container">
      
      {/* Top Mode Switcher */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, display: 'flex', gap: '0.5rem', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
         <button onClick={() => setView('app')} style={{ padding: '0.6rem 1.2rem', background: view === 'app' ? '#3b82f6' : 'transparent', color: view === 'app' ? 'white' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}>
           Map Simulation
         </button>
         <button onClick={() => setView('dashboard')} style={{ padding: '0.6rem 1.2rem', background: view === 'dashboard' ? '#3b82f6' : 'transparent', color: view === 'dashboard' ? 'white' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}>
           Analytics Dashboard
         </button>
      </div>

      {view === 'dashboard' ? (
        <FullDashboard params={simulationParams} mlSpread={mlSpread} onChange={setSimulationParams} liveWeather={liveWeather} />
      ) : (
        <MapView params={simulationParams} mlSpread={mlSpread} />
      )}

      {/* Floating UI Overlays (Only visible in Map Mode) */}
      {view === 'app' && (
        <div className="overlay-container">
          {/* Left Side: Controls */}
          <div className="panel-left animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <WeatherWidget weather={liveWeather} />
            <SimulationPanel 
              params={simulationParams} 
              onChange={setSimulationParams} 
            />
          </div>

          {/* Right Side: Risk Stats Overlay */}
          <div className="panel-right animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <RiskDashboard params={simulationParams} mlSpread={mlSpread} />
          </div>
          
          {/* DeepSeek AI Copilot */}
          <CopilotWidget simulationParams={simulationParams} />
        </div>
      )}
    </div>
  );
}

export default App;
