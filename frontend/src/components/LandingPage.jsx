import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, Map as MapIcon, Database, CloudRain, AlertTriangle, ShieldCheck } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: '#020617', color: 'white',
      fontFamily: "'Inter', sans-serif", overflow: 'hidden', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Dynamic Animated Grid Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(14, 165, 233, 0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14, 165, 233, 0.07) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: `perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)`,
        animation: 'gridMove 15s linear infinite',
        opacity: 0.6
      }} />

      {/* Glowing Ambient Orbs mapped to Mouse Movement */}
      <div style={{
        position: 'absolute', top: '5%', left: '15%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
        filter: 'blur(80px)', borderRadius: '50%',
        transform: `translate(${mousePos.x * -3}px, ${mousePos.y * -3}px)`,
        transition: 'transform 0.1s ease-out'
      }} />
      <div style={{
        position: 'absolute', bottom: '0%', right: '5%', width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)', borderRadius: '50%',
        transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
        transition: 'transform 0.1s ease-out'
      }} />

      {/* Main Layout Container */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: '1300px',
        padding: '2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem',
        alignItems: 'center'
      }}>
        
        {/* Left Column: Hero Typography & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', padding: '0.4rem 1rem', borderRadius: '50px', width: 'fit-content' }}>
            <Activity size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>System Status: Operational</span>
          </div>

          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-2px', margin: 0 }}>
            <span style={{ color: '#f8fafc' }}>Predictive</span><br/>
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flood Intelligence.</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: '1.7', maxWidth: '480px', margin: 0, fontWeight: '400' }}>
            A high-fidelity Digital Twin engineered for Greater Accra. Ingesting live CHIRPS weather data, structural geometry, and real-time census demographics to forecast catastrophic impact before it happens.
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem' }}>
            <button 
              onClick={onEnter}
              style={{
                background: '#f8fafc', color: '#0f172a', border: 'none', padding: '1rem 2rem',
                fontSize: '1rem', fontWeight: '700', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.3s ease',
                boxShadow: '0 4px 14px 0 rgba(255,255,255,0.15)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,255,255,0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(255,255,255,0.15)'; }}
            >
              Launch Command Center <ArrowRight size={18} />
            </button>
            
            <button 
              style={{
                background: 'transparent', color: '#cbd5e1', border: '1px solid #334155',
                padding: '1rem 2rem', fontSize: '1rem', fontWeight: '600', borderRadius: '8px',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* Right Column: Isometric 3D Dashboard Mockup */}
        <div style={{ position: 'relative', perspective: '1000px', transformStyle: 'preserve-3d' }}>
          {/* Main 3D Glass Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(20px)',
            transform: `rotateX(12deg) rotateY(-25deg) translateZ(50px)`,
            boxShadow: '-30px 30px 80px rgba(0,0,0,0.8)',
            transition: 'transform 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '2px', fontWeight: '600' }}>TERMINAL DATA</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Stat Block 1 */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <Database size={22} color="#818cf8" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Spatial Records</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc' }}>45,212</div>
              </div>
              {/* Stat Block 2 */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <ShieldCheck size={22} color="#10b981" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Policy Simulation</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc' }}>Active</div>
              </div>
              {/* Wide Block */}
              <div style={{ gridColumn: 'span 2', background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(245,158,11,0.05))', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <AlertTriangle size={24} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', color: '#fca5a5', fontWeight: '500' }}>Critical Encroachments Detected</div>
                </div>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ef4444' }}>2,122</div>
              </div>
            </div>
          </div>

          {/* Floating Extruded Elements */}
          <div style={{ position: 'absolute', top: '-15%', right: '-5%', background: 'linear-gradient(135deg, #38bdf8, #2563eb)', padding: '1.2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(37,99,235,0.4)', transform: `translateZ(120px) rotateX(12deg) rotateY(-25deg)` }}>
            <MapIcon size={28} color="white" />
          </div>
          
          <div style={{ position: 'absolute', bottom: '-5%', left: '-10%', background: 'rgba(15,23,42,0.9)', border: '1px solid #334155', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', transform: `translateZ(80px) rotateX(12deg) rotateY(-25deg)`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '600' }}>Live API Connected</span>
          </div>
        </div>

      </div>

      {/* Global CSS for Grid Animation */}
      <style>{`
        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(0px) translateZ(-200px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
