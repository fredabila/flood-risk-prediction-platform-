import React, { useMemo, useState, useEffect } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { TripsLayer } from '@deck.gl/geo-layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import 'mapbox-gl/dist/mapbox-gl.css';
import { generateSimulationData } from './simulationData';
import realWaterwaysGeoJSON from '../data/real_waterways.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// 1. Ghana Odaw River / Major Waterway System (Simulation)
const waterwayGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.2069, 5.5560],
          [-0.2110, 5.5700],
          [-0.2150, 5.5850],
          [-0.2130, 5.6000],
          [-0.2200, 5.6200],
        ]
      }
    }
  ]
};

const waterwayLayer = {
  id: 'ghana-waterway',
  type: 'line',
  paint: {
    'line-color': '#06b6d4',
    'line-width': 12,
    'line-opacity': 0.6
  }
};

import illegalStructuresGeoJSON from '../data/illegal_structures.json';

const structuresLayer = {
  id: 'illegal-structures',
  type: 'fill',
  paint: {
    'fill-color': '#ef4444',
    'fill-opacity': 0.8,
    'fill-outline-color': '#ffffff'
  }
};

// 3. Flood Zone Simulation logic dynamically responding to SimulationPanel
const getFloodZoneGeoJSON = (mlSpread) => {
  // Multiple known flood-prone hotspots across Accra
  const hotspots = [
    [-0.2140, 5.5850], // Central/Odawna
    [-0.2350, 5.5700], // Kaneshie Area
    [-0.2000, 5.6000], // Dzorwulu / Airport area dips
    [-0.2600, 5.5450]  // Dansoman / Coastal
  ];

  const features = hotspots.map(center => {
    const steps = 32;
    const coordinates = [];
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      coordinates.push([
        center[0] + Math.cos(angle) * mlSpread,
        center[1] + Math.sin(angle) * mlSpread * 1.5 
      ]);
    }
    coordinates.push(coordinates[0]);

    return {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coordinates] }
    };
  });

  return {
    type: 'FeatureCollection',
    features: features
  };
};

const floodZoneLayer = {
  id: 'flood-zone',
  type: 'fill',
  paint: {
    'fill-color': '#3b82f6',
    'fill-opacity': 0.3, // Lowered opacity so we can see the heatmap and cars beneath
    'fill-outline-color': '#93c5fd'
  }
};

// Rain Animation Component
const RainOverlay = ({ intensity }) => {
  if (intensity <= 0) return null;
  const drops = Math.min(intensity * 2, 200); // Scale drops with intensity
  return (
    <div className="rain-container">
      {Array.from({ length: drops }).map((_, i) => (
        <div 
          key={i} 
          className="drop" 
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.3 + Math.random() * 0.4}s`,
            animationDelay: `${Math.random() * 2}s`
          }} 
        />
      ))}
    </div>
  );
};

// Map Legend Component
const MapLegend = () => (
  <div className="glass-panel animate-fade-in" style={{
    position: 'absolute',
    bottom: '2rem',
    right: '2rem',
    padding: '1.2rem',
    width: '260px',
    zIndex: 10
  }}>
    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Simulation Legend</h4>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '16px', height: '4px', background: '#06b6d4', borderRadius: '2px' }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Major Waterways (Odaw River)</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '16px', height: '16px', background: 'rgba(239, 68, 68, 0.8)', border: '1px solid #ffffff', borderRadius: '3px' }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>High-Risk Illegal Structures</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '16px', height: '16px', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid #93c5fd', borderRadius: '3px' }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Active Flood Zone</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '16px', height: '16px', background: 'linear-gradient(90deg, #fed976, #fd8d3c, #bd0026)', borderRadius: '3px' }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Stranded Citizen Hotspots</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '16px', height: '2px', background: '#00ffff', boxShadow: '0 0 4px #00ffff' }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Live Traffic Routes</span>
      </div>
    </div>
  </div>
);

const MapView = ({ params, mlSpread }) => {
  const floodGeoJSON = useMemo(() => getFloodZoneGeoJSON(mlSpread), [mlSpread]);
  const simData = useMemo(() => generateSimulationData(params), [params]);

  // Animation Loop for Deck.gl Trips Layer
  const [time, setTime] = useState(0);
  const loopLength = 1200;
  const animationSpeed = 4;

  useEffect(() => {
    let animation;
    const animate = () => {
      setTime(t => (t + animationSpeed) % loopLength);
      animation = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animation);
  }, []);

  // Deck.gl Layers for high-performance WebGL Data Viz
  const deckLayers = [
    // Glowing Heatmap of Stranded Citizens
    new HeatmapLayer({
      id: 'stranded-heatmap',
      data: simData.citizens,
      getPosition: d => d.position,
      getWeight: d => d.weight,
      radiusPixels: 25, // Toned down from 60 for better visual coordination
      intensity: 0.8,
      threshold: 0.05,
      colorRange: [
        [254, 217, 118, 50],
        [254, 178, 76, 100],
        [253, 141, 60, 150],
        [240, 59, 32, 200],
        [189, 0, 38, 255]
      ]
    }),
    // Animated Live Traffic
    new TripsLayer({
      id: 'trips',
      data: simData.trips,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: d => d.color,
      opacity: 0.8,
      widthMinPixels: 2, // Sleeker, more coordinated lines
      rounded: true,
      trailLength: 50, // Shorter trails to avoid visual clutter
      currentTime: time,
      shadowEnabled: false
    })
  ];

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <RainOverlay intensity={params.rainfallIntensity} />
      <MapLegend />
      <DeckGL
        initialViewState={{
          longitude: -0.2130,
          latitude: 5.5850,
          zoom: 15.5,
          pitch: 65,
          bearing: -20
        }}
        controller={true}
        layers={deckLayers}
        style={{ zIndex: 1 }}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/outdoors-v12" // Lively, bright aesthetic that highlights nature and water
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {/* Beautiful 3D Buildings Layer for Daytime */}
          <Layer
            id="3d-buildings"
            source="composite"
            source-layer="building"
            filter={['==', 'extrude', 'true']}
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': '#cbd5e1', // Light slate-gray for daytime realism
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8
            }}
          />

          {/* Render the True Ghana Waterways (extracted from HOTOSM GeoPackage) */}
          <Source id="waterway" type="geojson" data={realWaterwaysGeoJSON}>
            <Layer 
              id="ghana-waterway"
              type="line"
              paint={{
                'line-color': '#0284c7', // Deep, vibrant river blue
                'line-width': 4, // Scaled down to accurately represent thousands of streams/drains
                'line-opacity': 0.85,
                'line-blur': 1
              }}
            />
          </Source>

          {/* Render Illegal Settlements */}
          {!params.clearWaterways && (
            <Source id="structures" type="geojson" data={illegalStructuresGeoJSON}>
              <Layer {...structuresLayer} />
            </Source>
          )}

          {/* Render Flood Overlay */}
          <Source id="flood-zone" type="geojson" data={floodGeoJSON}>
            <Layer {...floodZoneLayer} />
          </Source>
        </Map>
      </DeckGL>
    </div>
  );
};

export default MapView;
