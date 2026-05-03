import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eef2f7; font-family: 'Plus Jakarta Sans', sans-serif; }

        .pg { min-height: 100vh; background: #eef2f7; display: flex; flex-direction: column; }

        .hdr {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          min-height: 60px;
          display: flex; align-items: center;
          padding: 12px 28px;
          position: sticky; top: 0; z-index: 999;
          box-shadow: 0 1px 0 #e2e8f0, 0 2px 10px rgba(0,0,0,0.04);
        }

        a.brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; color: inherit;
          cursor: pointer;
          border-radius: 10px;
          outline: none;
        }
        a.brand:focus-visible { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #16a34a; }
        a.brand:hover .brand-name b { color: #15803d; }
        .brand-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(22,163,74,0.3);
        }
        .brand-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 18px;
          color: #0f172a; letter-spacing: -0.4px; line-height: 1.15;
        }
        .brand-name b { color: #16a34a; font-weight: 800; }

        .content {
          flex: 1;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 24px 28px 48px;
          animation: up 0.35s ease both;
        }
        @keyframes up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
        }

        .section-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .text {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          margin-bottom: 22px;
        }
        .text:last-child { margin-bottom: 0; }

        .page-footer {
          text-align: center;
          padding: 18px 16px 28px;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          background: #eef2f7;
        }
      `}</style>

      <div className="pg">
        <header className="hdr">
          <Link to="/" className="brand" title="Back to collector home">
            <div className="brand-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <span className="brand-name">Clean<b>Matrix</b></span>
          </Link>
        </header>

        <div className="content">
          <div className="card">
            <div className="section-title">About CleanMatrix</div>
            <div className="text">
              CleanMatrix is a smart waste management system designed to improve
              efficiency in waste collection using real-time monitoring and intelligent routing.
              The system integrates AI-based waste detection, live bin tracking,
              and optimized route planning for waste collectors.
            </div>

            <div className="section-title">Key Features</div>
            <div className="text">
              • Real-time waste detection using AI (YOLO)<br />
              • Live bin occupancy monitoring<br />
              • Smart routing for waste collection<br />
              • Dynamic updates via backend API<br />
              • Reset mechanism after waste collection
            </div>

            <div className="section-title">Technology Stack</div>
            <div className="text">
              • Frontend: React.js + Leaflet<br />
              • Backend: Node.js + Express<br />
              • Database: MongoDB<br />
              • AI: YOLOv8 (Computer Vision)
            </div>

            <div className="section-title">Purpose</div>
            <div className="text">
              The goal of CleanMatrix is to reduce unnecessary waste collection trips,
              improve efficiency, and support smart city initiatives by leveraging
              data-driven decisions.
            </div>
          </div>
        </div>

        <footer className="page-footer">Copyright © CleanMatrix</footer>
      </div>
    </>
  );
}
