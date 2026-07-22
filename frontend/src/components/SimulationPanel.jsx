import React from 'react';
import { CloudRain, Waves, Building2, Calendar } from 'lucide-react';

const SimulationPanel = ({ params, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h2 className="glass-header">Simulation Controls</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Adjust environmental factors to simulate flood impacts in real-time.
      </p>

      {/* Date Offset Slider */}
      <div className="control-group">
        <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> Forecast Timeline
          </span>
          <span style={{ color: 'var(--accent-cyan)' }}>+{params.dateOffset} Days</span>
        </label>
        <input 
          type="range" 
          min="0" max="7" 
          value={params.dateOffset} 
          onChange={(e) => handleChange('dateOffset', parseInt(e.target.value))}
          className="range-slider"
        />
      </div>

      {/* Rainfall Intensity */}
      <div className="control-group">
        <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudRain size={16} /> Rainfall Intensity
          </span>
          <span style={{ color: 'var(--accent-blue)' }}>{params.rainfallIntensity} mm/hr</span>
        </label>
        <input 
          type="range" 
          min="0" max="150" 
          value={params.rainfallIntensity} 
          onChange={(e) => handleChange('rainfallIntensity', parseInt(e.target.value))}
          className="range-slider"
        />
      </div>

      {/* Sea Level Rise */}
      <div className="control-group">
        <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Waves size={16} /> Sea Level Surge
          </span>
          <span style={{ color: 'var(--accent-cyan)' }}>{params.seaLevelRise} m</span>
        </label>
        <input 
          type="range" 
          min="0" max="2" step="0.1"
          value={params.seaLevelRise} 
          onChange={(e) => handleChange('seaLevelRise', parseFloat(e.target.value))}
          className="range-slider"
        />
      </div>

      {/* Government Intervention: Clear Waterways */}
      <div className="control-group" style={{ marginTop: '2rem' }}>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={params.clearWaterways}
            onChange={(e) => handleChange('clearWaterways', e.target.checked)}
          />
          <div className="toggle-slider"></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
              <Building2 size={16} color="var(--accent-green)" /> Clear Waterways
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Simulate removal of illegal structures
            </div>
          </div>
        </label>
      </div>

    </div>
  );
};

export default SimulationPanel;
