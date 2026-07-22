export const generateSimulationData = (params) => {
  const center = [-0.2130, 5.5850];
  
  // Calculate the same flood radius logic to know where cars should get stranded
  let baseSpread = 0.008; 
  baseSpread += (params.rainfallIntensity / 100) * 0.015;
  baseSpread += (params.seaLevelRise * 0.005);
  if (params.clearWaterways) baseSpread *= 0.35; 

  const isStranded = (lng, lat) => {
    // Simple ellipse distance check
    const dist = Math.sqrt(Math.pow(lng - center[0], 2) + Math.pow((lat - center[1])/1.5, 2));
    return dist < baseSpread;
  };

  // Generate Animated Vehicle Trips
  const trips = [];
  for (let i = 0; i < 1500; i++) {
    // Generate random paths across the ENTIRE city of Accra (~35km radius)
    const startLng = center[0] + (Math.random() - 0.5) * 0.35;
    const startLat = center[1] + (Math.random() - 0.5) * 0.35;
    
    const endLng = center[0] + (Math.random() - 0.5) * 0.35;
    const endLat = center[1] + (Math.random() - 0.5) * 0.35;

    const path = [];
    const timestamps = [];
    
    let stranded = false;
    let timeAcc = 0;

    // Segment 1: Move along Latitude
    for (let j = 0; j <= 15; j++) {
      const lat = startLat + (endLat - startLat) * (j / 15);
      if (!stranded && isStranded(startLng, lat)) stranded = true;

      if (stranded) {
        path.push(path.length > 0 ? path[path.length - 1] : [startLng, lat]);
      } else {
        path.push([startLng, lat]);
      }
      timestamps.push(timeAcc);
      timeAcc += 20;
    }

    // Segment 2: Move along Longitude
    for (let j = 1; j <= 15; j++) {
      const lng = startLng + (endLng - startLng) * (j / 15);
      if (!stranded && isStranded(lng, endLat)) stranded = true;

      if (stranded) {
        path.push(path[path.length - 1]);
      } else {
        path.push([lng, endLat]);
      }
      timestamps.push(timeAcc);
      timeAcc += 20;
    }

    trips.push({
      path,
      timestamps,
      color: stranded ? [255, 0, 0] : [0, 255, 255]
    });
  }

  // Generate Stranded Citizens Hotspots inside the flood zones
  const hotspots = [
    [-0.2140, 5.5850],
    [-0.2350, 5.5700],
    [-0.2000, 5.6000],
    [-0.2600, 5.5450]
  ];
  const citizens = [];
  const numCitizens = Math.floor(baseSpread * 80000); // Scale citizens by severity
  for (let i = 0; i < numCitizens; i++) {
    const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * baseSpread;
    const lng = hotspot[0] + Math.cos(angle) * r;
    const lat = hotspot[1] + Math.sin(angle) * r * 1.5;
    
    citizens.push({
      position: [lng, lat],
      weight: Math.random() * 10
    });
  }

  return { trips, citizens };
};
