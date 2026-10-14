import React from 'react';
import { FileText, Code2, Database, Layers, ArrowDown, Bookmark } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <header className="masthead" id="top">
      <div className="conf-badge">
        <span>PREPRINT 2026</span> · <span>OPEN FULL-STACK RELEASE</span> · <span>EXECRL-MLE 1.0</span>
      </div>

      <h1 className="hero-title">
        ExecRL-MLE: Training an <span className="cy">AI4AI Model</span> towards{' '}
        <span className="or">Recursive Self-Improvement</span> in Machine Learning Engineering
      </h1>

      <div className="authors">
        <span>Guna Teja &amp; Horizon Research Group</span>
      </div>
      <div className="affil">
        <span>ExecRL Autonomous Engineering Lab · Tsinghua &amp; OpenMLE Collaboration</span>
        <br />
        <span style={{ fontSize: '13px', color: 'var(--dim)', marginTop: '4px', display: 'inline-block' }}>
          Open weights · open gym · open search — the full ExecRL-MLE stack, released
        </span>
      </div>

      <div className="btnrow">
        <a href="#abstract" className="btn">
          <FileText size={14} />
          <span>Paper</span>
        </a>
        <a href="#bibtex" className="btn">
          <Bookmark size={14} />
          <span>Citation</span>
        </a>
        <a
          href="https://github.com/GunaTeja777/ExecRL-MLE"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
        >
          <Code2 size={14} />
          <span>Code</span>
        </a>
        <a href="#system" className="btn">
          <Database size={14} />
          <span>Models (0.5B)</span>
        </a>
        <a href="#operators" className="btn">
          <Layers size={14} />
          <span>Tasks (15 OpenML)</span>
        </a>
        <a href="#results" className="btn alt">
          <span>Results</span>
          <ArrowDown size={14} />
        </a>
      </div>
    </header>
  );
};
