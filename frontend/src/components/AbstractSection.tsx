import React from 'react';

export const AbstractSection: React.FC = () => {
  return (
    <section id="abstract">
      <div className="wrap">
        <div className="eyebrow">Abstract · AI4AI Foundations</div>
        <h2 className="sec-heading">
          AI that improves the process <span className="cy">of building AI</span>
        </h2>
        <p className="lede">
          Modern Large Language Models generate plausible code, but operate in an <b>open loop</b> without execution
          signals. ExecRL-MLE grounds post-training directly inside isolated sandboxes to enable true recursive self-improvement.
        </p>

        <div className="tldr">
          <div className="tl">
            <div className="t-big">+15.4%</div>
            <p>
              <b>Execution-Grounded Post-Training:</b> Closed-loop GRPO rewards direct ROC-AUC improvements on held-out tasks.
            </p>
          </div>
          <div className="tl hot">
            <div className="t-big">100%</div>
            <p>
              <b>Zero-Data-Leakage Isolation:</b> Ground-truth validation and test labels are kept strictly on the host and never mounted into the container.
            </p>
          </div>
          <div className="tl">
            <div className="t-big">0.5B</div>
            <p>
              <b>Consumer Hardware Scale:</b> Fine-tuned and reinforced on a standard 4 GB VRAM laptop GPU with 4-bit QLoRA and FP32 CPU backprop.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="v">15</div>
            <div className="k">Curated OpenML Benchmark Datasets</div>
          </div>
          <div className="stat-card">
            <div className="v">3<i>ops</i></div>
            <div className="k">Unified Action Space (Draft, Improve, Debug)</div>
          </div>
          <div className="stat-card peak">
            <div className="v">0.9999</div>
            <div className="k">Peak Teacher ROC-AUC Harvested</div>
          </div>
          <div className="stat-card">
            <div className="v">1.97<i>GB</i></div>
            <div className="k">SFT Merged Base Model Checkpoint</div>
          </div>
          <div className="stat-card peak">
            <div className="v">35.2<i>MB</i></div>
            <div className="k">GRPO RL LoRA Policy Adapter</div>
          </div>
          <div className="stat-card">
            <div className="v">&lt;60<i>s</i></div>
            <div className="k">Strict Docker Sandbox Timeout</div>
          </div>
        </div>
      </div>
      <hr className="hairline" />
    </section>
  );
};
