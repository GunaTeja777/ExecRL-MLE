import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Database } from 'lucide-react';

export const BibtexSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const bibtexText = `@article{execrl_mle_2026,
  title   = {ExecRL-MLE: Training an AI4AI Model towards Recursive Self-Improvement in Machine Learning Engineering},
  author  = {Teja, Guna and Horizon Research Group},
  journal = {arXiv preprint arXiv:2603.01824},
  year    = {2026},
  url     = {https://github.com/GunaTeja777/ExecRL-MLE}
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtexText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="bibtex">
      <div className="wrap">
        <div className="eyebrow">Artifacts &amp; Reproducibility</div>
        <h2 className="sec-heading">
          Models, tasks, training, and search. <span className="cy">A reproducible ExecRL stack.</span>
        </h2>
        <p className="lede">
          All code, sandbox configurations, trained LoRA policy adapters, and harvested execution trajectories
          are released as an open-source research toolkit.
        </p>

        {/* Release Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '48px' }}>
          <div style={{ padding: '26px', background: 'var(--surface)', borderRadius: '6px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.2em' }}>01 / REPOSITORY</span>
            <h4 style={{ fontFamily: 'var(--disp)', fontSize: '16px', marginTop: '8px', color: 'var(--black)' }}>OpenMLE Engine &amp; Gym</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dim)', marginTop: '8px', lineHeight: 1.65 }}>
              Docker sandbox files, task downloader, and TRL GRPO training loops with Windows/CPU fallbacks.
            </p>
            <a
              href="https://github.com/GunaTeja777/ExecRL-MLE"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '14px', fontWeight: 600 }}
            >
              <span>View on GitHub</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ padding: '26px', background: 'var(--surface)', borderRadius: '6px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.2em' }}>02 / CHECKPOINTS</span>
            <h4 style={{ fontFamily: 'var(--disp)', fontSize: '16px', marginTop: '8px', color: 'var(--black)' }}>SFT &amp; GRPO Adapters</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dim)', marginTop: '8px', lineHeight: 1.65 }}>
              Qwen2.5-Coder-0.5B SFT merged model weights (1.97 GB) and 35.2 MB GRPO LoRA policy adapters.
            </p>
            <a
              href="#results"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '14px', fontWeight: 600 }}
            >
              <span>Explore Weights</span>
              <Download size={12} />
            </a>
          </div>

          <div style={{ padding: '26px', background: 'var(--surface)', borderRadius: '6px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.2em' }}>03 / DATASET SUITE</span>
            <h4 style={{ fontFamily: 'var(--disp)', fontSize: '16px', marginTop: '8px', color: 'var(--black)' }}>15 Curated Benchmarks</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dim)', marginTop: '8px', lineHeight: 1.65 }}>
              10 training and 5 held-out OpenML binary classification tabular datasets with strict zero-leakage splits.
            </p>
            <a
              href="#operators"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '14px', fontWeight: 600 }}
            >
              <span>Inspect Tasks</span>
              <Database size={12} />
            </a>
          </div>
        </div>

        {/* BibTeX Box */}
        <div className="bib">
          <div className="bib-head">
            <span>BIBTEX CITATION</span>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  COPIED ✓
                </>
              ) : (
                <>
                  <Copy size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  COPY
                </>
              )}
            </button>
          </div>
          <pre id="bibText">
            <code>
              <span className="c">@article</span>&#123;<span className="o">execrl_mle_2026</span>,{"\n"}
              {"  "}title   = &#123;ExecRL-MLE: Training an AI4AI Model towards Recursive Self-Improvement in Machine Learning Engineering&#125;,{"\n"}
              {"  "}author  = &#123;Teja, Guna and Horizon Research Group&#125;,{"\n"}
              {"  "}journal = &#123;arXiv preprint arXiv:2603.01824&#125;,{"\n"}
              {"  "}year    = &#123;2026&#125;,{"\n"}
              {"  "}url     = &#123;https://github.com/GunaTeja777/ExecRL-MLE&#125;{"\n"}
              &#125;
            </code>
          </pre>
        </div>
      </div>
      <hr className="hairline" />
    </section>
  );
};
