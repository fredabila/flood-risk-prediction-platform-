import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Droplets, Users, AlertTriangle, TrendingUp, Home, ShieldAlert, Truck, Wind, HeartPulse, Loader2, Bot, CloudRain, Sun, Cloud, CloudLightning, MapPin, Building2, Cross, Navigation } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const REGIONS = {
  "Greater Accra": { multiplier: 1.0, baseRisk: 0.8 },
  "Ashanti Region": { multiplier: 0.6, baseRisk: 0.5 },
  "Northern Region": { multiplier: 0.3, baseRisk: 0.9 },
  "Volta Region": { multiplier: 0.45, baseRisk: 0.7 }
};

const FullDashboard = ({ params, mlSpread, onChange, liveWeather }) => {
  const [activeRegion, setActiveRegion] = useState("Greater Accra");
  const [baseImpactData, setBaseImpactData] = useState({ population: 0, structures: 0, totalAreaRisk: 0 });
  const [aiInsights, setAiInsights] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8004/api/impact?spread=${mlSpread}`)
    .then(res => res.json())
    .then(data => {
       if (!data.error) {
         setBaseImpactData({
           population: data.impacted_population,
           structures: data.structures_at_risk,
           totalAreaRisk: data.total_buildings_in_area
         });
       }
    })
    .catch(console.error);
  }, [mlSpread]);

  // Apply Region Multipliers
  const rMult = REGIONS[activeRegion].multiplier;
  const impactData = {
    population: Math.floor(baseImpactData.population * rMult),
    structures: Math.floor(baseImpactData.structures * rMult)
  };

  // AI Integration for Dynamic Insights
  useEffect(() => {
    if (impactData.population === 0) return;

    setIsAiLoading(true);
    
    const prompt = `The current flood simulation in the ${activeRegion} of Ghana shows ${impactData.structures} structures flooded and ${impactData.population} citizens displaced. Rainfall is ${params.rainfallIntensity}mm/hr. 
    Analyze this specific data and return a RAW JSON object (no markdown) with exactly three keys:
    1. "districts": An array of exactly 5 real neighborhoods/districts in ${activeRegion}. Each object must have "name", "risk" (estimated number of structures flooded), and "evacuated" (structures successfully evacuated).
    2. "places": An array of exactly 6 specific, recognizable landmarks/critical infrastructure places in ${activeRegion} (e.g. specific named Hospitals, Schools, Markets, Power Stations, major intersections). Each object must have "name", "type" (one of: Hospital, School, Market, Infrastructure), "floodDepth" (a float representing meters of water), and "status" (one of: Critical, Evacuating, Safe).
    3. "directives": An array of exactly 4 critical mitigation directives tailored to ${activeRegion}. Each object must have "title", "color" (a hex code like #ef4444 or #f59e0b), and "description".`;

    fetch('http://localhost:8004/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
    })
    .then(res => res.json())
    .then(data => {
      if (data.choices && data.choices[0]) {
        try {
          let jsonStr = data.choices[0].message.content;
          if (jsonStr.includes("```json")) {
            jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
          } else if (jsonStr.includes("```")) {
            jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
          }
          const parsed = JSON.parse(jsonStr);
          setAiInsights(parsed);
        } catch (e) {
          console.error("Failed to parse AI JSON", e);
        }
      }
      setIsAiLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsAiLoading(false);
    });
  }, [impactData.population, impactData.structures, params.rainfallIntensity, activeRegion]);

  // Generate dynamic data sets based on real predictions
  const timeSeriesData = Array.from({ length: 48 }).map((_, i) => {
    const base = mlSpread * 1000 * REGIONS[activeRegion].baseRisk;
    return {
      time: `+${i}h`,
      waterLevel: Math.max(0, base + Math.sin(i / 6) * (params.rainfallIntensity / 5) + (params.seaLevelRise * 2 * (i/48))),
      riskScore: Math.max(0, (base * 0.8) + Math.cos(i / 8) * 5)
    };
  });

  const baseSeverity = Math.min(Math.max(((mlSpread - 0.005) / 0.015), 0), 1) * REGIONS[activeRegion].baseRisk;
  const radarData = [
    { subject: 'Rescue Boats', A: Math.floor(baseSeverity * 120), fullMark: 150 },
    { subject: 'Medical Teams', A: Math.floor(baseSeverity * 85), fullMark: 150 },
    { subject: 'Heavy Machinery', A: Math.floor(baseSeverity * 45), fullMark: 150 },
    { subject: 'Aerial Drones', A: Math.floor(baseSeverity * 30), fullMark: 150 },
    { subject: 'Sandbag Logistics', A: Math.floor(baseSeverity * 140), fullMark: 150 },
  ];

  // Actionable Stats
  const riskPercentage = Math.min(Math.max(baseSeverity * 100, 0), 100);
  const damage = (impactData.structures * 15000 / 1000000).toFixed(1);
  const elderly = Math.floor(impactData.population * 0.14);
  const youth = Math.floor(impactData.population * 0.38);
  const workingAge = impactData.population - elderly - youth;
  
  const sandbagsRequired = impactData.structures * 25;
  const emergencyShelters = Math.ceil(impactData.population / 800);
  const medicalKits = Math.ceil(impactData.population / 50);

  const pieData = [
    { name: 'Elderly (65+)', value: elderly },
    { name: 'Youth (0-14)', value: youth },
    { name: 'Working Age', value: workingAge }
  ];

  // 5-Day Forecast Mock Data based on live weather
  const baseTemp = liveWeather?.temperature_c || 28;
  const forecast = [
    { day: "Today", temp: baseTemp, icon: <CloudRain color="#3b82f6" /> },
    { day: "Tomorrow", temp: baseTemp - 1, icon: <CloudLightning color="#8b5cf6" /> },
    { day: "Day 3", temp: baseTemp - 2, icon: <CloudRain color="#3b82f6" /> },
    { day: "Day 4", temp: baseTemp + 1, icon: <Cloud color="#94a3b8" /> },
    { day: "Day 5", temp: baseTemp + 3, icon: <Sun color="#f59e0b" /> }
  ];

  return (
    <div style={{ width: '100%', height: '100vh', padding: '5rem 2rem 5rem 2rem', overflowY: 'auto', background: 'var(--bg-dark)', color: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', background: '-webkit-linear-gradient(45deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Flood Mitigation & Analytics Center
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>Actionable census, regional infrastructure, and resource deployment data.</p>
        </div>

        {/* Embedded Dashboard Controls */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {/* Region Switcher */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Analysis Region</label>
            <select 
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '6px', outline: 'none' }}
            >
              {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Rainfall Simulation (mm/hr)</label>
            <input 
              type="range" className="range-slider" min="0" max="250" value={params.rainfallIntensity}
              onChange={e => onChange({ ...params, rainfallIntensity: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Sea Level Surge (m)</label>
            <input 
              type="range" className="range-slider" min="0" max="3" step="0.1" value={params.seaLevelRise}
              onChange={e => onChange({ ...params, seaLevelRise: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* 5-Day Weather Forecast Panel */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wind color="#0ea5e9" size={24} />
          <h3 style={{ margin: 0, fontWeight: '500' }}>5-Day Regional Forecast</h3>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {forecast.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.day}</span>
              {f.icon}
              <span style={{ fontWeight: 'bold' }}>{f.temp.toFixed(1)}°C</span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #ef4444' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}><Users color="#ef4444" size={28} /></div>
          <div><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Census At Risk</p><h2 style={{ margin: 0, fontSize: '1.8rem' }}>{impactData.population.toLocaleString()}</h2></div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #f59e0b' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}><Home color="#f59e0b" size={28} /></div>
          <div><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Structures Impacted</p><h2 style={{ margin: 0, fontSize: '1.8rem' }}>{impactData.structures.toLocaleString()}</h2></div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #06b6d4' }}>
          <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}><ShieldAlert color="#06b6d4" size={28} /></div>
          <div><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Emergency Shelters</p><h2 style={{ margin: 0, fontSize: '1.8rem' }}>{emergencyShelters.toLocaleString()}</h2></div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #10b981' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}><Truck color="#10b981" size={28} /></div>
          <div><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Sandbags Req.</p><h2 style={{ margin: 0, fontSize: '1.8rem' }}>{sandbagsRequired.toLocaleString()}</h2></div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}><HeartPulse color="#8b5cf6" size={28} /></div>
          <div><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Medical Kits</p><h2 style={{ margin: 0, fontSize: '1.8rem' }}>{medicalKits.toLocaleString()}</h2></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Main Area Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wind size={20} color="#3b82f6" /> 48-Hour Water Level & Risk Projection</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="waterLevel" name="Est. Water Level (cm)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" />
              <Area type="monotone" dataKey="riskScore" name="ML Risk Severity" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart: Resource Allocation */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Navigation size={20} color="#10b981" /> Required Resource Vectors</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                <Radar name="Active Requirement" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Vulnerable Demographics */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Census Demographics</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Generated Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={20} color="#0ea5e9" /> AI Regional Projections
          </h3>
          
          {isAiLoading || !aiInsights ? (
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
              <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
              <p>Flood Intelligence is analyzing geospatial impact...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiInsights.districts} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="risk" name="Structures at Risk" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="evacuated" name="Successfully Evacuated" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Specific Places & Critical Infrastructure Data Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <MapPin size={20} color="#f59e0b" /> Critical Infrastructure & Places at Risk
          </h3>
          
          {isAiLoading || !aiInsights ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
              <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
              <p>Identifying key vulnerable landmarks...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Place Name</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Infrastructure Type</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Est. Flood Depth</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Evacuation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiInsights.places && aiInsights.places.map((place, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {place.type.toLowerCase().includes('hospital') ? <HeartPulse size={16} color="#ef4444" /> : <Building2 size={16} color="#3b82f6" />}
                        {place.name}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{place.type}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#0ea5e9', fontWeight: 'bold' }}>{place.floodDepth}m</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          background: place.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : place.status === 'Evacuating' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: place.status === 'Critical' ? '#ef4444' : place.status === 'Evacuating' ? '#f59e0b' : '#10b981'
                        }}>
                          {place.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Insights Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={20} color="#0ea5e9" /> AI Critical Mitigation Directives
        </h3>
        
        {isAiLoading || !aiInsights ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', padding: '2rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
            <p>Formulating response strategies...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {aiInsights.directives.map((dir, idx) => (
              <div key={idx} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderLeft: `4px solid ${dir.color}`, borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: dir.color, fontSize: '1.05rem' }}>{dir.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{dir.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default FullDashboard;
