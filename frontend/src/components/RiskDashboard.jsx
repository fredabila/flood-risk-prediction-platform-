import React, { useState, useEffect } from 'react';
import { Users, Home, AlertTriangle } from 'lucide-react';

const RiskDashboard = ({ params }) => {
  const [impactData, setImpactData] = useState({
    impacted_population: 0,
    structures_at_risk: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let baseSpread = 0.008; 
    baseSpread += (params.rainfallIntensity / 100) * 0.015;
    baseSpread += (params.seaLevelRise * 0.005);
    if (params.clearWaterways) baseSpread *= 0.35; 

    setLoading(true);
    fetch(`http://localhost:8003/api/impact?spread=${baseSpread}`)
      .then(res => res.json())
      .then(data => {
         if (!data.error) {
           setImpactData(data);
         }
         setLoading(false);
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
  }, [params.rainfallIntensity, params.seaLevelRise, params.clearWaterways]);

  const pop = impactData.impacted_population.toLocaleString();
  const structures = impactData.structures_at_risk.toLocaleString();

  // Basic damage estimate logic based on real structures
  const damage = (impactData.structures_at_risk * 15000 / 1000000).toFixed(1);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', width: '340px', animationDelay: '0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <AlertTriangle color="var(--accent-red)" size={24} />
        <h2 className="glass-header" style={{ marginBottom: 0 }}>Impact Analytics</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Population Card */}
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.2rem', gap: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              <Users color="var(--accent-red)" size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              Population at Risk
            </span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '500', margin: '0.8rem 0 0 0', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: '1.1' }}>
            {loading ? "..." : pop}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent-red)', margin: '0.4rem 0 0 0', fontWeight: '500' }}>
            Based on Live Spatial Data
          </p>
        </div>

        {/* Structures Card */}
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.2rem', gap: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
              <Home color="#f59e0b" size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              Structures Flooded
            </span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '500', margin: '0.8rem 0 0 0', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: '1.1' }}>
            {loading ? "..." : structures}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
            Est. Damage: <span style={{ color: '#f59e0b', fontWeight: '600' }}>${damage}M USD</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RiskDashboard;
