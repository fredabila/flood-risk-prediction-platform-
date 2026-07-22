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
    fetch(`http://localhost:8006/api/impact?spread=${mlSpread}`)
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
    Analyze this specific data and return a HIGHLY DETAILED RAW JSON object (no markdown) representing a government-grade disaster dashboard. Use this seed for entropy so your responses vary wildly: ${Math.random() * 10000}.
    1. "districts": Array of exactly 6 districts in ${activeRegion}. Each has "name", "risk" (estimated number of structures flooded), "evacuated" (structures successfully evacuated), "waterVelocity" (string e.g. "1.2 m/s"), "responseTimeETA" (string e.g. "45 mins").
    2. "places": Array of exactly 8 SPECIFIC, highly diverse real-world locations in ${activeRegion} (vary them: local clinics, specific named markets, regional power substations, highways). Each has "name", "type" (Hospital, Power Grid, Transport, Market, Education), "floodDepth" (float), "status" (Critical, Evacuating, Safe, Offline), "integrity" (integer 0-100 representing structural integrity %), "financialLoss" (string e.g. "$1.2M").
    3. "logistics": Object with: "blockedRoutes" (array of 3 road names), "supplyDisruption" (integer 0-100 %), "powerOutage" (float km radius), "economicImpact" (string e.g. "$450K/hr").
    4. "directives": Array of exactly 4 critical mitigation directives. Each has "title", "color" (hex), "description", "agency" (e.g. NADMO, Armed Forces).`;

    fetch('http://localhost:8006/api/chat', {
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

  // 14-Day Strategic Forecast Mock Data based on live weather
  const baseTemp = liveWeather?.temperature_c || 28;
  const forecast = Array.from({ length: 14 }).map((_, i) => {
    const dayLabel = i === 0 ? "Today" : i === 1 ? "Tmrw" : `Day ${i + 1}`;
    const t = baseTemp + Math.sin(i) * 2;
    let icon;
    if (i < 3) icon = <CloudRain color="#3b82f6" />;
    else if (i === 3 || i === 4) icon = <CloudLightning color="#8b5cf6" />;
    else if (i > 4 && i < 8) icon = <Cloud color="#94a3b8" />;
    else if (i >= 8 && i < 11) icon = <CloudRain color="#3b82f6" />;
    else icon = <Sun color="#f59e0b" />;
    return { day: dayLabel, temp: t, icon };
  });

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

      {/* 14-Day Strategic Weather Forecast Panel */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '260px' }}>
          <Wind color="#0ea5e9" size={24} />
          <h3 style={{ margin: 0, fontWeight: '500' }}>14-Day Strategic Forecast</h3>
        </div>
        <div className="custom-scrollbar" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', flex: 1 }}>
          {forecast.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '50px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Logistics & Economic Impact Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#f59e0b" /> Economic & Logistics Impact
            </h3>
            {isAiLoading || !aiInsights?.logistics ? (
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.85rem' }}>Computing economic velocity...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Economic Impact Rate</p>
                  <h2 style={{ margin: '0.3rem 0 0 0', color: '#ef4444', fontSize: '1.5rem' }}>{aiInsights.logistics.economicImpact}</h2>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supply Chain Disruption</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${aiInsights.logistics.supplyDisruption}%`, background: '#10b981', height: '100%' }}></div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>{aiInsights.logistics.supplyDisruption}%</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Major Corridors Blocked</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {aiInsights.logistics.blockedRoutes.map((route, idx) => (
                      <div key={idx} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <AlertTriangle size={14} color="#f59e0b" /> {route}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
      </div>

      {/* Specific Places & Critical Infrastructure Data Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Building2 size={20} color="#3b82f6" /> Infrastructure Intelligence & telemetry
            </h3>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '12px', fontWeight: 'bold' }}>LIVE SATELLITE LINK</span>
          </div>
          
          {isAiLoading || !aiInsights ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
              <p>Scanning regional topography & pinging structural sensors...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Facility Name</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Sector</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Flood Depth</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Structural Integrity</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Est. Loss</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiInsights.places && aiInsights.places.map((place, idx) => {
                    const intColor = place.integrity > 70 ? '#10b981' : place.integrity > 40 ? '#f59e0b' : '#ef4444';
                    return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>
                        {place.name}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{place.type}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#0ea5e9', fontWeight: 'bold' }}>{place.floodDepth}m</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${place.integrity}%`, background: intColor, height: '100%' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: intColor }}>{place.integrity}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', color: '#ef4444' }}>{place.financialLoss}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          background: place.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : place.status === 'Offline' ? 'rgba(148, 163, 184, 0.2)' : place.status === 'Evacuating' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: place.status === 'Critical' ? '#ef4444' : place.status === 'Offline' ? '#94a3b8' : place.status === 'Evacuating' ? '#f59e0b' : '#10b981'
                        }}>
                          {place.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Actionable Insights Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#ef4444" /> Tactical Operations & Agency Directives
        </h3>
        
        {isAiLoading || !aiInsights ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', padding: '2rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
            <p>Generating task force deployment protocols...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {aiInsights.directives.map((dir, idx) => (
              <div key={idx} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderLeft: `4px solid ${dir.color}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <h4 style={{ margin: 0, color: dir.color, fontSize: '1.05rem', lineHeight: '1.3' }}>{dir.title}</h4>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-muted)' }}>{dir.agency}</span>
                </div>
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
