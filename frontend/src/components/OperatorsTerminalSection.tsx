import React, { useState } from 'react';

interface LogLine {
  text: string;
  type: 'dim' | 'cy' | 'or' | 'wh' | 'err';
}

interface DemoScenario {
  op: string;
  score: number;
  progress: number;
  medal?: string;
  logs: LogLine[];
}

const SCENARIOS: Record<string, DemoScenario> = {
  draft: {
    op: 'DRAFT',
    score: 0.734,
    progress: 73.4,
    logs: [
      { text: '$ execrl-agent --op draft --task climate-model-simulation', type: 'dim' },
      { text: '[PROMPT] Task: Binary classification on 18 climate parameter features.', type: 'wh' },
      { text: '[GENERATION] Synthesizing initial LightGBM pipeline solution.py...', type: 'cy' },
      { text: '[SANDBOX] Spawning container: docker run --rm -m 3g minimle-sandbox:latest', type: 'dim' },
      { text: '[EXEC] Loaded train.csv (540 rows) and eval_X.csv (108 rows)', type: 'wh' },
      { text: '[EXEC] Imputed missing features using SimpleImputer(strategy="median")', type: 'wh' },
      { text: '[EXEC] Trained LGBMClassifier(n_estimators=100, learning_rate=0.05)', type: 'wh' },
      { text: '[OUTPUT] Successfully generated submission.csv (108 rows)', type: 'cy' },
      { text: '[HOST SCORE] Validation ROC-AUC: 0.7340 (Reward: +0.20 Survival)', type: 'cy' },
    ],
  },
  debug: {
    op: 'DEBUG',
    score: 0.812,
    progress: 81.2,
    logs: [
      { text: '$ execrl-agent --op debug --task phoneme', type: 'dim' },
      { text: '[SANDBOX RUNTIME ERROR TRACEBACK]:', type: 'err' },
      { text: '  ValueError: could not convert string to float: "Class_1"', type: 'err' },
      { text: '  File "solution.py", line 24, in <module>', type: 'err' },
      { text: '[DEBUGGER] Diagnosed categorical target string mapping issue.', type: 'or' },
      { text: '[GENERATION] Injecting LabelEncoder and stratified 5-fold CV split...', type: 'cy' },
      { text: '[SANDBOX] Rerunning container with patched solution.py...', type: 'dim' },
      { text: '[EXEC] Encoded string targets -> [0, 1] integer array', type: 'wh' },
      { text: '[EXEC] Trained XGBClassifier with early_stopping_rounds=15', type: 'wh' },
      { text: '[OUTPUT] submission.csv validated: 0 NaNs, correct order', type: 'cy' },
      { text: '[HOST SCORE] Bug fixed! ROC-AUC: 0.8120 (Reward: +0.59)', type: 'or' },
    ],
  },
  improve: {
    op: 'IMPROVE',
    score: 0.948,
    progress: 94.8,
    medal: 'GOLD MEDAL',
    logs: [
      { text: '$ execrl-agent --op improve --task credit-g', type: 'dim' },
      { text: '[CURRENT BEST] ROC-AUC: 0.8120. Prompting for feature engineering...', type: 'wh' },
      { text: '[GENERATION] Creating polynomial interactions + QuantileTransformer...', type: 'cy' },
      { text: '[EXEC] Engineered 14 nonlinear interaction features', type: 'wh' },
      { text: '[EXEC] Ensembling HistGradientBoosting + XGBoost + LogisticRegression', type: 'wh' },
      { text: '[SANDBOX] Container finished in 18.4s (within 60s budget)', type: 'dim' },
      { text: '[HOST SCORE] ROC-AUC jump: 0.8120 -> 0.9480 (+0.1360)', type: 'or' },
      { text: '[RL SIGNAL] Steep advantage update computed: GRPO policy step accepted!', type: 'or' },
    ],
  },
  crossover: {
    op: 'CROSSOVER',
    score: 0.985,
    progress: 98.5,
    medal: 'INCUMBENT BEST',
    logs: [
      { text: '$ execrl-evo --op crossover --p1 solution_7.py --p2 solution_14.py', type: 'dim' },
      { text: '[PARENT 1] Feature preprocessing pipeline from Solution #7', type: 'cy' },
      { text: '[PARENT 2] CatBoost + LightGBM blending weights from Solution #14', type: 'or' },
      { text: '[GENERATION] Synthesizing hybrid genetic solution...', type: 'wh' },
      { text: '[SANDBOX] Executing multi-model ensemble inside container...', type: 'dim' },
      { text: '[HOST SCORE] Global Best Found! ROC-AUC: 0.9850', type: 'or' },
      { text: '[EVOLUTION] Designated as new Incumbent Best for Population Generation 4', type: 'cy' },
    ],
  },
};

export const OperatorsTerminalSection: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('draft');
  const scenario = SCENARIOS[activeKey];

  return (
    <section id="operators">
      <div className="wrap">
        <div className="eyebrow">Unified Action Space</div>
        <h2 className="sec-heading">
          Four operators. One unified action space <span className="or">for code evolution.</span>
        </h2>
        <p className="lede">
          Rather than open-ended natural language chatter, the agent acts strictly through 4 discrete operators
          that map directly to the software development and machine learning workflow.
        </p>

        <div className="ops-grid">
          {/* Operator Chips */}
          <div className="chips">
            <div
              className={`chip c1 ${activeKey === 'draft' ? 'active-chip' : ''}`}
              onClick={() => setActiveKey('draft')}
            >
              <div className="g">D</div>
              <h4>Draft</h4>
              <p>Generates an end-to-end baseline pipeline from scratch given dataset metadata and column schemas.</p>
            </div>

            <div
              className={`chip c2 ${activeKey === 'improve' ? 'active-chip' : ''}`}
              onClick={() => setActiveKey('improve')}
            >
              <div className="g">I</div>
              <h4>Improve</h4>
              <p>Optimizes working code: tests advanced feature transforms, hyperparameter tuning, and model ensembles.</p>
            </div>

            <div
              className={`chip c3 ${activeKey === 'debug' ? 'active-chip' : ''}`}
              onClick={() => setActiveKey('debug')}
            >
              <div className="g">X</div>
              <h4>Debug</h4>
              <p>Injects raw stderr runtime exceptions (syntax, missing columns, NaNs) to prompt autonomous self-repair.</p>
            </div>

            <div
              className={`chip c4 ${activeKey === 'crossover' ? 'active-chip' : ''}`}
              onClick={() => setActiveKey('crossover')}
            >
              <div className="g">C</div>
              <h4>Crossover</h4>
              <p>Combines high-performing features and algorithms from two distinct parent solutions into a hybrid child.</p>
            </div>
          </div>

          {/* Interactive Console */}
          <div className="console">
            <div className="con-head">
              <div className="con-dots">
                <i />
                <i />
                <i />
              </div>
              <span className="con-title">EXECRL_DOCKER_SANDBOX // {scenario.op}</span>
              <div className="con-controls">
                <button
                  className="con-btn"
                  onClick={() => setActiveKey('draft')}
                  style={{ background: activeKey === 'draft' ? 'var(--cyan)' : undefined }}
                >
                  Draft
                </button>
                <button
                  className="con-btn"
                  onClick={() => setActiveKey('debug')}
                  style={{ background: activeKey === 'debug' ? 'var(--orange)' : undefined }}
                >
                  Debug
                </button>
                <button
                  className="con-btn"
                  onClick={() => setActiveKey('improve')}
                  style={{ background: activeKey === 'improve' ? 'var(--cyan)' : undefined }}
                >
                  Improve
                </button>
                <button
                  className="con-btn"
                  onClick={() => setActiveKey('crossover')}
                  style={{ background: activeKey === 'crossover' ? 'var(--orange)' : undefined }}
                >
                  Crossover
                </button>
              </div>
            </div>

            <div className="con-body">
              {scenario.logs.map((log, index) => (
                <div key={index} className={`t-${log.type}`}>
                  {log.text}
                </div>
              ))}
            </div>

            <div className="con-score">
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)' }}>
                {scenario.op} AUC
              </span>
              <div className="sc-track">
                <div className="sc-fill" style={{ width: `${scenario.progress}%` }} />
              </div>
              <b>{scenario.score.toFixed(4)}</b>
              {scenario.medal && (
                <span className="medal-pop" style={{ opacity: 1, transform: 'scale(1)' }}>
                  {scenario.medal}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr className="hairline" />
    </section>
  );
};
