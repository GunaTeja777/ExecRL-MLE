import React from 'react';
import { ExternalLink, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="foot-edge" />
      <div className="foot">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Terminal size={18} color="#00C1D4" />
          </div>
          <span style={{ fontFamily: 'var(--disp)', fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em' }}>
            EXECRL<span style={{ color: 'var(--cyan)' }}>-MLE</span>
          </span>
        </div>

        <h2>
          Building autonomous agents that <span className="or">improve themselves.</span>
        </h2>

        <div className="btnrow">
          <a
            href="https://github.com/GunaTeja777/ExecRL-MLE"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            <span>GitHub Repository</span>
            <ExternalLink size={14} />
          </a>
          <a href="#top" className="btn alt">
            <span>Back to Top ↑</span>
          </a>
        </div>

        <div className="meta">
          <span>&copy; 2026 ExecRL-MLE Research Initiative. Released under the MIT License.</span>
          <span>Inspired by Frontis-MA1 &amp; OpenRSI · OpenMLE Stack</span>
        </div>
      </div>
    </footer>
  );
};
