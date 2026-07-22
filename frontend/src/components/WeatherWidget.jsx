import React from 'react';
import { CloudRain, Wind, Droplets, Sun, CloudLightning } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
  const temp = weather?.temperature_c ?? '--';
  const precip = weather?.precipitation_mm ?? 0;
  const hum = weather?.humidity_percent ?? '--';
  const wind = weather?.wind_speed_kmh ?? '--';

  let status = "Clear";
  let statusColor = "#f59e0b";
  if (precip > 0) { status = "Light Rain"; statusColor = "var(--accent-cyan)"; }
  if (precip > 5) { status = "Heavy Rain"; statusColor = "var(--accent-blue)"; }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className="glass-header" style={{ marginBottom: '0.2rem', fontSize: '1.1rem' }}>Accra Forecast</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>LIVE Telemetry</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '300', lineHeight: '1', color: 'var(--text-main)' }}>{temp}°</h1>
          <p style={{ color: statusColor, fontSize: '0.9rem', fontWeight: '600' }}>{status}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Droplets size={16} color="var(--accent-blue)" /> {hum}% Hum
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Wind size={16} color="var(--accent-cyan)" /> {wind} km/h
        </div>
      </div>

      {/* 3-Day Forecast Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Today</p>
          <CloudRain size={20} color="var(--accent-blue)" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>26°</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Tomorrow</p>
          <CloudLightning size={20} color="var(--accent-red)" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>24°</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Wed</p>
          <CloudRain size={20} color="var(--accent-cyan)" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>27°</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Thu</p>
          <Sun size={20} color="#f59e0b" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>32°</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
