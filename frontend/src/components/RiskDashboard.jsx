import React, { useState, useEffect } from 'react';
import { Users, Home, AlertTriangle } from 'lucide-react';

const RiskDashboard = ({ params, mlSpread }) => {
  const [impactData, setImpactData] = useState({
    population: 0,
    structures: 0,
    totalAreaRisk: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Query the geographic spatial DB using the ML-driven spread
    fetch(`http://localhost:8006/api/impact?spread=${mlSpread}`)
    .then(res => res.json())
    .then(data => {
       if (!data.error) {
         setImpactData({
           population: data.impacted_population,
           structures: data.structures_at_risk,
           totalAreaRisk: data.total_buildings_in_area
         });
       }
       setLoading(false);
    })
    .catch(err => {
       console.error(err);
       setLoading(false);
    });
  }, [mlSpread]);

  const pop = impactData.population.toLocaleString();
  const structures = impactData.structures.toLocaleString();

  // Basic damage estimate logic based on real structures
  const damage = (impactData.structures * 15000 / 1000000).toFixed(1);

  // New Derived Stats for the Dashboard
  const emergencyUnits = Math.ceil(impactData.population / 450);
  const evacTime = impactData.population > 0 ? (impactData.population / 2000).toFixed(1) : 0;
  
  // Calculate a visual risk percentage from 0-100% based on the mlSpread (mlSpread ranges roughly 0.008 to 0.02)
  const riskPercentage = Math.min(Math.max(((mlSpread - 0.005) / 0.015) * 100, 0), 100);

  // Fake breakdown of structures for the simulation visual
  const residential = Math.floor(impactData.structures * 0.7);
  const commercial = Math.floor(impactData.structures * 0.25);
  const publicInfra = impactData.structures - residential - commercial;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', width: '360px', animationDelay: '0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <AlertTriangle color="var(--accent-red)" size={24} />
        <h2 className="glass-header" style={{ marginBottom: 0 }}>Impact Analytics</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Vulnerability Index Gauge */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vulnerability Index (ML)</span>
            <span style={{ fontSize: '0.85rem', color: riskPercentage > 60 ? 'var(--accent-red)' : '#f59e0b', fontWeight: 'bold' }}>
              {riskPercentage.toFixed(0)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${riskPercentage}%`, 
              height: '100%', 
              background: riskPercentage > 60 ? 'var(--accent-red)' : '#f59e0b',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>

        {/* Population & Emergency Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.5rem' }}>
            <Users color="var(--accent-red)" size={20} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pop at Risk</p>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{loading ? "..." : pop}</h3>
            </div>
          </div>
          <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.5rem' }}>
            <AlertTriangle color="#0ea5e9" size={20} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rescue Units</p>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{loading ? "..." : emergencyUnits}</h3>
            </div>
          </div>
        </div>

        {/* Evacuation Estimate */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Est. Evacuation Time:</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{evacTime} Hours</span>
        </div>

        {/* Structure Breakdown Chart */}
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.2rem', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home color="#f59e0b" size={18} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>Flooded Structures</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{loading ? "..." : structures}</span>
          </div>
          
          {/* CSS Bar Chart */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Residential ({residential})</span>
                <span>70%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                <div style={{ width: '70%', height: '100%', background: '#3b82f6', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Commercial ({commercial})</span>
                <span>25%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                <div style={{ width: '25%', height: '100%', background: '#8b5cf6', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Public/Infra ({publicInfra})</span>
                <span>5%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                <div style={{ width: '5%', height: '100%', background: '#10b981', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
              Est. Financial Damage: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>${damage}M USD</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiskDashboard;
