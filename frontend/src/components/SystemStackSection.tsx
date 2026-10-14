import React from 'react';
import { Box, Activity, GitFork } from 'lucide-react';

export const SystemStackSection: React.FC = () => {
  return (
    <section id="system">
      <div className="wrap">
        <div className="eyebrow">Full-Stack Architecture</div>
        <h2 className="sec-heading">
          Unit of training = unit of search. <span className="cy">One stack closes the loop.</span>
        </h2>
        <p className="lede">
          By aligning the execution environment used during reinforcement learning with the search runtime,
          the agent transfers directly to real-world ML benchmarks without distribution shift.
        </p>

        <div className="cards3">
          {/* Card 1: Gym */}
          <div className="card">
            <span className="num">01 / ENVIRONMENT</span>
            <h3>
              ExecRL-Gym
              <em>Sandboxed Docker Sandbox</em>
            </h3>
            <p>
              Lightweight, secure container harness. Runs candidate Python programs with zero internet access,
              preventing external API leaks and library poisoning.
            </p>
            <ul>
              <li>
                <b>Resource Caps:</b> 3 GB RAM limit, 2 CPU cores, and 60-second hardware watchdog.
              </li>
              <li>
                <b>Zero-Leakage Guarantee:</b> Test labels (<code>test_y.csv</code>) stay strictly on the host.
              </li>
              <li>
                <b>Pre-installed Stack:</b> Scikit-Learn, Pandas, NumPy, XGBoost, and LightGBM.
              </li>
            </ul>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
              <Box size={14} />
              <span>Container: minimle-sandbox:latest</span>
            </div>
          </div>

          {/* Card 2: RL */}
          <div className="card">
            <span className="num">02 / OPTIMIZATION</span>
            <h3>
              ExecRL-GRPO
              <em>Execution-Grounded RL</em>
            </h3>
            <p>
              Group Relative Policy Optimization directly connects container execution outcomes to model gradients,
              eliminating the VRAM overhead of a separate critic model.
            </p>
            <ul>
              <li>
                <b>Reward Shaping:</b> Punishes crashes (-1.0), grants survival bonus (+0.2), and boosts on ROC-AUC gains.
              </li>
              <li>
                <b>Group Advantage:</b> Normalizes returns across $G = 4$ parallel generations per prompt.
              </li>
              <li>
                <b>CPU/GPU Hybrid:</b> Pure PyTorch autograd chunked log-prob fallback for edge devices.
              </li>
            </ul>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--orange)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
              <Activity size={14} />
              <span>Loss: Truncated Ratio PPO-style Policy Updates</span>
            </div>
          </div>

          {/* Card 3: Evo */}
          <div className="card">
            <span className="num">03 / INFERENCE SEARCH</span>
            <h3>
              ExecRL-Evo
              <em>Population Evolution</em>
            </h3>
            <p>
              An evolutionary search engine growing a tree of executable programs over successive generations,
              discovering high-performing modeling strategies.
            </p>
            <ul>
              <li>
                <b>Parent Selection:</b> Fitness-proportional roulette with novelty exploration bonuses.
              </li>
              <li>
                <b>Algorithmic Crossover:</b> Merging feature transformations and tree ensemble hyperparams.
              </li>
              <li>
                <b>Self-Healing Loop:</b> Automatic error trace injection to prompt the model to debug crashes.
              </li>
            </ul>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
              <GitFork size={14} />
              <span>Search: Multi-agent Program Tree</span>
            </div>
          </div>
        </div>
      </div>
      <hr className="hairline" />
    </section>
  );
};
