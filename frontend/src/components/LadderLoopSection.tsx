import React from 'react';
import { RefreshCw, Play, ShieldAlert, Zap } from 'lucide-react';

export const LadderLoopSection: React.FC = () => {
  return (
    <section id="loop">
      <div className="wrap">
        <div className="eyebrow">Meta-Evolving Paradigm</div>
        <h2 className="sec-heading">
          When the improver is trained, <span className="or">evolution becomes meta-evolution</span>
        </h2>
        <p className="lede">
          Standard code LLMs plateau because they never experience their own runtime failures. By training the model to
          read execution traces and validate scores, every step in search becomes an informed reinforcement step.
        </p>

        <div className="loop-grid">
          {/* Timeline Ladder */}
          <div className="ladder">
            <div className="step">
              <div className="node">01</div>
              <div>
                <h4>Static Prompting</h4>
                <p>Open-loop text generation without executing code. Vulnerable to syntax errors, package hallucinations, and silent data leakage.</p>
              </div>
            </div>

            <div className="step">
              <div className="node">02</div>
              <div>
                <h4>Grounded SFT Warm-Start</h4>
                <p>Imitating high-reward teacher trajectories ($\mathcal{R} \ge 0.2$) collected from Gemini inside Docker sandboxes. Trains basic contract obedience.</p>
              </div>
            </div>

            <div className="step active">
              <div className="node">03</div>
              <div>
                <h4>
                  Execution-Grounded RL (GRPO) <span className="flag">ACTIVE STEP</span>
                </h4>
                <p>Generating candidate batches in parallel, executing in Docker containers, and optimizing policy gradients against relative ROC-AUC gains.</p>
              </div>
            </div>

            <div className="step">
              <div className="node">04</div>
              <div>
                <h4>Meta-Evolutionary Loop</h4>
                <p>The RL-trained policy acts as an autonomous operator inside population-based genetic search, discovering novel feature engineering blends.</p>
              </div>
            </div>
          </div>

          {/* Interactive Visual Cycle */}
          <div style={{ background: '#050709', padding: '34px', borderRadius: '8px', border: '1px solid rgba(240,242,244,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Closed-Loop Engine Architecture
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--orange)', fontFamily: 'var(--mono)' }}>
                <RefreshCw size={12} className="spin-slow" />
                <span>Zero Leakage</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '6px', borderLeft: '3px solid var(--gray)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', fontFamily: 'var(--disp)' }}>1. Draft Generation</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Model receives task schema &amp; returns solution.py</div>
                </div>
                <Play size={16} color="var(--dim)" />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '6px', borderLeft: '3px solid #27C93F', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', fontFamily: 'var(--disp)' }}>2. Sandbox Execution</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Docker container (no net, 3GB RAM, 60s timeout)</div>
                </div>
                <ShieldAlert size={16} color="#27C93F" />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '6px', borderLeft: '3px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', fontFamily: 'var(--disp)' }}>3. Host Validation Scoring</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Secret val_y.csv scored on host (ROC-AUC)</div>
                </div>
                <Zap size={16} color="var(--cyan)" />
              </div>

              <div style={{ background: 'rgba(250,95,38,0.1)', padding: '14px 18px', borderRadius: '6px', borderLeft: '3px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--orange)', fontFamily: 'var(--disp)' }}>4. GRPO Policy Gradient</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--mono)' }}>Advantages calculated across parallel group runs</div>
                </div>
                <RefreshCw size={16} color="var(--orange)" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="hairline" />
    </section>
  );
};
