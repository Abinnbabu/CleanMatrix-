import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { BINS_API_URL } from '../api/bins';
import { Link } from 'react-router-dom';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const COLLECTOR = { lat: 10.064, lng: 76.628 };

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Label
function MarkerLabel({ position, text }) {
  const icon = L.divIcon({
    iconSize: [40, 20],
    iconAnchor: [20, 30],
    html: `<div style="background:white;padding:2px 6px;border-radius:5px;font-size:12px;font-weight:bold;border:1px solid black;text-align:center;">${text}</div>`
  });
  return <Marker position={position} icon={icon} />;
}

// Routing
function Routing({ waypoints }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (routingRef.current) {
      try { map.removeControl(routingRef.current); } catch {}
      routingRef.current = null;
    }
    if (waypoints.length < 2) return;
    const control = L.Routing.control({
      waypoints: waypoints.map(p => L.latLng(p.lat, p.lng)),
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      show: false, addWaypoints: false, routeWhileDragging: false, createMarker: () => null,
      lineOptions: { styles: [{ color: '#2563eb', weight: 6 }] }
    }).addTo(map);
    routingRef.current = control;
    return () => { try { map.removeControl(control); } catch {} };
  }, [map, waypoints]);

  return null;
}

export default function UHome() {
  const [bins, setBins] = useState([]);
  const [orderedBins, setOrderedBins] = useState([]);
  const [mode, setMode] = useState("none");
  const [highestBin, setHighestBin] = useState(null);
  const [activeBtn, setActiveBtn] = useState(null);

  const fetchBins = useCallback(async () => {
    try {
      const res = await fetch(BINS_API_URL);
      const data = await res.json();
      setBins(data.map(bin => ({ id: bin.id, lat: bin.lat, lng: bin.lng, quantity: bin.quantity })));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBins();
    const interval = setInterval(fetchBins, 5000);
    return () => clearInterval(interval);
  }, [fetchBins]);

  const calculateRoute = (binsData) => {
    const THRESHOLD = 50;
    let remaining = binsData.filter(b => b.quantity >= THRESHOLD);
    let current = { ...COLLECTOR };
    let route = [];
    while (remaining.length > 0) {
      let nearest = null, minDist = Infinity;
      for (let bin of remaining) {
        const d = getDistance(current.lat, current.lng, bin.lat, bin.lng);
        if (d < minDist) { minDist = d; nearest = bin; }
      }
      route.push(nearest); current = nearest;
      remaining = remaining.filter(b => b.id !== nearest.id);
    }
    setOrderedBins(route);
  };

  const nearestBin = useMemo(() => {
    if (!bins.length) return null;
    let min = Infinity, nearest = null;
    bins.forEach(bin => {
      const d = getDistance(COLLECTOR.lat, COLLECTOR.lng, bin.lat, bin.lng);
      if (d < min) { min = d; nearest = bin; }
    });
    return nearest;
  }, [bins]);

  const findHighestBin = () => {
    if (!bins.length) return;
    let max = bins[0];
    bins.forEach(bin => { if (bin.quantity > max.quantity) max = bin; });
    setHighestBin(max);
    setMode("highest");
    setActiveBtn("highest");
  };

  const waypoints = useMemo(() => {
    if (mode === "highest" && highestBin) return [COLLECTOR, highestBin];
    if (mode === "nearest" && nearestBin) return [COLLECTOR, nearestBin];
    if (mode === "full" && orderedBins.length > 0) return [COLLECTOR, ...orderedBins];
    return [];
  }, [mode, nearestBin, orderedBins, highestBin]);

  const avgFill = bins.length ? Math.round(bins.reduce((a, b) => a + b.quantity, 0) / bins.length) : 0;
  const criticalCount = bins.filter(b => b.quantity >= 75).length;
  const okCount = bins.filter(b => b.quantity < 50).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eef2f7; font-family: 'Plus Jakarta Sans', sans-serif; }

        .pg { min-height: 100vh; background: #eef2f7; }

        /* Header */
        .hdr {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px;
          position: sticky; top: 0; z-index: 999;
          box-shadow: 0 1px 0 #e2e8f0, 0 2px 10px rgba(0,0,0,0.04);
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(22,163,74,0.3);
        }
        .brand-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 18px;
          color: #0f172a; letter-spacing: -0.4px;
        }
        .brand-name b { color: #16a34a; font-weight: 800; }

        /* Content */
        .content { max-width: 1100px; margin: 0 auto; padding: 24px 28px 48px; }

        .page-footer {
          text-align: center;
          padding: 18px 16px 28px;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          background: #eef2f7;
        }
        .footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .footer-text-link {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          padding: 0 2px;
          cursor: pointer;
          transition: color 0.15s;
        }
        .footer-text-link:hover {
          color: #16a34a;
          text-decoration: underline;
        }
        .footer-sep {
          color: #cbd5e1;
          font-size: 12px;
          user-select: none;
        }

        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
          animation: up 0.35s ease both;
        }
        @keyframes up {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .stat-val {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #0f172a; line-height: 1; margin-bottom: 5px;
        }
        .stat-lbl {
          font-size: 11.5px; font-weight: 600;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .stat-pip {
          display: inline-block; width: 7px; height: 7px;
          border-radius: 50%; margin-right: 5px; vertical-align: middle;
        }

        /* Map card */
        .map-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
          animation: up 0.35s ease 0.08s both;
        }
        .map-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.04); }

        .map-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 18px;
          border-bottom: 1px solid #f1f5f9;
          background: #fafbfd;
        }
        .map-hdr-left {
          display: flex; align-items: center; gap: 7px;
          font-size: 13.5px; font-weight: 600; color: #475569;
        }
        .map-hdr-right { display: flex; align-items: center; gap: 10px; }

        .live-pill {
          display: inline-flex; align-items: center; gap: 5px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #16a34a; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: blink 1.6s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        /* Role badge */
        .role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          color: #2563eb; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em;
        }

        /* Buttons */
        .btns {
          display: flex; flex-wrap: wrap; gap: 10px;
          padding: 16px 0 0;
          animation: up 0.35s ease 0.16s both;
        }
        .btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 20px; border-radius: 12px; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; font-weight: 600;
          cursor: pointer; transition: all 0.16s ease;
          letter-spacing: 0.005em; position: relative; overflow: hidden;
          white-space: nowrap;
        }
        .btn:hover { transform: translateY(-1px); filter: brightness(1.07); }
        .btn:active { transform: translateY(0px) scale(0.98); }

        .btn-blue   { background: #2563eb; color: #fff; box-shadow: 0 2px 10px rgba(37,99,235,0.3); }
        .btn-amber  { background: #d97706; color: #fff; box-shadow: 0 2px 10px rgba(217,119,6,0.3); }
        .btn-teal   { background: #0d9488; color: #fff; box-shadow: 0 2px 10px rgba(13,148,136,0.3); }
        .btn-ghost  { background: #fff; color: #64748b; border: 1.5px solid #e2e8f0; box-shadow: none; }
        .btn-ghost:hover { background: #f8fafc; color: #334155; }
        .btn.is-active { outline: 3px solid rgba(255,255,255,0.5); outline-offset: 2px; filter: brightness(0.92); }

        /* Popup */
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.13) !important;
          padding: 0 !important; overflow: hidden !important;
          border: 1px solid #e8edf2 !important;
        }
        .leaflet-popup-content { margin: 0 !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .leaflet-popup-tip-container { display: none; }

        .pop { padding: 15px 17px; min-width: 160px; }
        .pop-t { font-family: 'Bricolage Grotesque', sans-serif; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
        .pop-s { font-size: 12.5px; color: #64748b; margin-bottom: 10px; }
        .pop-bar { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
        .pop-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
      `}</style>

      <div className="pg" id="top">

        {/* Header */}
        <header className="hdr">
          <div className="brand">
            <div className="brand-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <span className="brand-name">Clean<b>Matrix</b></span>
          </div>
        </header>

        <div className="content">

          {/* Stats */}
          <div className="stats">
            <div className="stat-card">
              <div className="stat-val">{bins.length}</div>
              <div className="stat-lbl"><span className="stat-pip" style={{background:'#3b82f6'}}/>Total Bins</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{color: criticalCount > 0 ? '#dc2626' : '#0f172a'}}>{criticalCount}</div>
              <div className="stat-lbl"><span className="stat-pip" style={{background:'#ef4444'}}/>Critical</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{avgFill}%</div>
              <div className="stat-lbl"><span className="stat-pip" style={{background:'#f59e0b'}}/>Avg Fill</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{color:'#16a34a'}}>{okCount}</div>
              <div className="stat-lbl"><span className="stat-pip" style={{background:'#22c55e'}}/>Bins OK</div>
            </div>
          </div>

          {/* Map */}
          <div className="map-card">
            <div className="map-hdr">
              <div className="map-hdr-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Collector Dashboard
              </div>
              <div className="map-hdr-right">
                <span className="role-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  COLLECTOR
                </span>
                <span className="live-pill"><span className="live-dot"/>LIVE</span>
              </div>
            </div>

            <MapContainer
              center={[COLLECTOR.lat, COLLECTOR.lng]}
              zoom={13}
              style={{ height: 480, width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Collector marker */}
              <Marker position={[COLLECTOR.lat, COLLECTOR.lng]}>
                <Popup>
                  <div className="pop">
                    <div className="pop-t">📍 Your Location</div>
                    <div className="pop-s">Collection vehicle</div>
                  </div>
                </Popup>
              </Marker>

              {/* Bins */}
              {bins.map(bin => {
                const color = bin.quantity >= 75 ? '#ef4444' : bin.quantity >= 50 ? '#f59e0b' : '#22c55e';
                return (
                  <CircleMarker
                    key={bin.id}
                    center={[bin.lat, bin.lng]}
                    radius={9}
                    color={color}
                    fillColor={color}
                    fillOpacity={0.85}
                    weight={2}
                  >
                    <Popup>
                      <div className="pop">
                        <div className="pop-t">Bin #{bin.id}</div>
                        <div className="pop-s">Waste: {bin.quantity}%</div>
                        <div className="pop-bar">
                          <div className="pop-fill" style={{ width: `${bin.quantity}%`, background: color }} />
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Labels */}
              {bins.map(bin => (
                <MarkerLabel key={`label-${bin.id}`} position={[bin.lat, bin.lng]} text={`${bin.quantity}%`} />
              ))}

              {/* Routing */}
              {waypoints.length >= 2 && <Routing waypoints={waypoints} />}
            </MapContainer>
          </div>

          {/* Buttons below map */}
          <div className="btns">
            <button
              className={`btn btn-blue ${activeBtn === 'nearest' ? 'is-active' : ''}`}
              onClick={() => { setMode("nearest"); setActiveBtn("nearest"); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
              Nearest Dustbin
            </button>

            <button
              className={`btn btn-amber ${activeBtn === 'highest' ? 'is-active' : ''}`}
              onClick={findHighestBin}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              Highest Occupancy
            </button>

            <button
              className={`btn btn-teal ${activeBtn === 'full' ? 'is-active' : ''}`}
              onClick={() => { calculateRoute(bins); setMode("full"); setActiveBtn("full"); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
              Total Route
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => { setMode("none"); setActiveBtn(null); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear Route
            </button>
          </div>

        </div>

        <footer className="page-footer">
          <nav className="footer-links" aria-label="Site">
            <a
              href="#top"
              className="footer-text-link"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </a>
            <span className="footer-sep" aria-hidden>·</span>
            <Link to="/About" className="footer-text-link">About</Link>
          </nav>
          <div>Copyright © CleanMatrix developed by Hexacore</div>
        </footer>
      </div>
    </>
  );
}