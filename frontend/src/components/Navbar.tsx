import React, { useEffect } from 'react';
import { ExternalLink, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollBar = document.getElementById('scrollbar');
      if (scrollBar) {
        const h = document.documentElement;
        const progress = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
        scrollBar.style.transform = `scaleX(${progress})`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div id="scrollbar"></div>
      <nav className="site-nav">
        <a className="brand" href="#top">
          <div className="brand-icon">
            <Terminal size={18} color="#00C1D4" />
          </div>
          <span className="brand-title">
            EXECRL<span>-MLE</span>
          </span>
        </a>

        <div className="navlinks">
          <a href="#abstract">Abstract</a>
          <a href="#loop">Meta-Evolving</a>
          <a href="#system">System</a>
          <a href="#operators">Operators</a>
          <a href="#results">Results</a>
          <a href="#training">RL Trace</a>
          <a href="#bibtex">BibTeX</a>
          <a
            href="https://medium.com/@tejag078/i-taught-a-0-5b-model-to-do-machine-learning-engineering-on-a-4gb-laptop-gpu-075c6382fed5?sharedUserId=tejag078"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn nav-blog-pill"
          >
            <span>Medium Blog</span>
            <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/GunaTeja777/ExecRL-MLE"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn"
          >
            <span>GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </nav>
    </>
  );
};
