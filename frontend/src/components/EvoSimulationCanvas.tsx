import React, { useEffect, useRef, useState } from 'react';

interface Operator {
  name: 'draft' | 'improve' | 'debug' | 'crossover';
  color: string;
  dash: number[];
  hollow?: boolean;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  score: number;
  op: Operator;
  failed: boolean;
  r: number;
  born: number;
  kids: number;
  root?: boolean;
}

interface Link {
  a: Node;
  b: Node;
  op: Operator;
}

const OPS: Operator[] = [
  { name: 'draft', color: '#3D4145', dash: [] },
  { name: 'improve', color: '#00C1D4', dash: [] },
  { name: 'debug', color: '#00C1D4', dash: [3, 4], hollow: true },
  { name: 'crossover', color: '#FA5F26', dash: [] },
];

export const EvoSimulationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [hud, setHud] = useState({
    epoch: 1,
    nodes: 1,
    best: 0.352,
    op: 'draft',
  });

  useEffect(() => {
    const cv = canvasRef.current;
    const stage = stageRef.current;
    if (!cv || !stage) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let W = cv.offsetWidth || 800;
    let H = cv.offsetHeight || 480;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.offsetWidth;
      H = cv.offsetHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let nodes: Node[] = [];
    let links: Link[] = [];
    let best = 0.352;
    let evals = 1;
    let epoch = 1;
    let fade = 1;
    let resetting = false;
    let plateau = 0.88;
    const mouse = { x: -10000, y: -10000 };

    const reset = () => {
      nodes = [];
      links = [];
      fade = 1;
      resetting = false;
      plateau = 0.82 + Math.random() * 0.12;

      const root: Node = {
        x: W * 0.5,
        y: H * 0.52,
        vx: 0,
        vy: 0,
        score: 0.32 + Math.random() * 0.1,
        op: OPS[0],
        r: 5.4,
        born: performance.now(),
        root: true,
        kids: 0,
        failed: false,
      };
      nodes.push(root);
      best = root.score;

      setHud({
        epoch,
        nodes: 1,
        best,
        op: 'draft',
      });
    };

    reset();

    const pick = (): Node => {
      const viable = nodes.filter((n) => !n.failed);
      if (viable.length === 0) return nodes[0];
      if (Math.random() < 0.28) {
        return viable[Math.floor(Math.random() * viable.length)];
      }
      let bp = viable[0];
      let bu = -1;
      for (const n of viable) {
        const novelty = 1 / (1 + (n.kids || 0));
        const u = n.score + Math.random() * 0.18 + novelty * 0.08 - (n.kids || 0) * 0.018;
        if (u > bu) {
          bu = u;
          bp = n;
        }
      }
      return bp;
    };

    const bell = (): number => {
      let v = 0;
      for (let i = 0; i < 6; i++) v += Math.random();
      return v - 3;
    };

    const spawn = () => {
      if (nodes.length > 85) {
        resetting = true;
        return;
      }
      const w = Math.random();
      const op = w < 0.16 ? OPS[0] : w < 0.54 ? OPS[1] : w < 0.74 ? OPS[2] : OPS[3];

      const p1 = pick();
      let p2: Node | null = null;
      if (op.name === 'crossover' && nodes.length > 4) {
        for (let tries = 0; tries < 5 && !p2; tries++) {
          const candidate = pick();
          if (candidate !== p1) p2 = candidate;
        }
      }

      const ang = Math.random() * Math.PI * 2;
      const d = 52 + Math.random() * 65;
      const failRate = op.name === 'draft' ? 0.16 : op.name === 'improve' ? 0.09 : op.name === 'debug' ? 0.05 : 0.12;
      const failed = Math.random() < failRate;

      let score: number;
      if (failed) {
        score = 0;
      } else {
        let base = op.name === 'draft' ? 0.22 + Math.random() * 0.36 : p1.score;
        if (op.name === 'crossover' && p2) {
          const hi = Math.max(p1.score, p2.score);
          const lo = Math.min(p1.score, p2.score);
          base = hi * 0.72 + lo * 0.28;
        }
        let gain = 0;
        if (op.name === 'draft') gain = 0;
        else if (op.name === 'improve') gain = 0.018 + bell() * 0.032;
        else if (op.name === 'debug') gain = 0.008 + bell() * 0.025 + (base < 0.55 ? 0.018 : 0);
        else gain = 0.012 + bell() * 0.026 + (Math.random() < 0.18 ? 0.035 + Math.random() * 0.035 : 0);

        if (gain > 0) {
          const headroom = Math.max(plateau - base, 0.015);
          gain *= 0.24 + Math.min(headroom / 0.55, 1) * 0.76;
        }
        score = Math.max(0.07, base + gain);
        if (score > plateau) score = plateau - (0.004 + Math.random() * 0.014);
        score = Math.min(0.965, score);
      }

      const n: Node = {
        x: p1.x + Math.cos(ang) * d,
        y: p1.y + Math.sin(ang) * d,
        vx: 0,
        vy: 0,
        score,
        op,
        failed,
        r: failed ? 2.5 : 3.2 + score * 4.2,
        born: performance.now(),
        kids: 0,
      };

      p1.kids++;
      nodes.push(n);
      links.push({ a: p1, b: n, op });
      if (p2) {
        p2.kids++;
        links.push({ a: p2, b: n, op });
      }

      evals++;
      if (score > best) {
        best = score;
      }

      setHud({
        epoch,
        nodes: evals,
        best,
        op: op.name,
      });
    };

    let spawnT = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    const handlePointerLeave = () => {
      mouse.x = -10000;
      mouse.y = -10000;
    };

    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerleave', handlePointerLeave);

    let animationFrameId: number;

    const tick = (ts: number) => {
      if (!resetting && ts - spawnT > 540) {
        spawnT = ts;
        spawn();
      }
      if (resetting) {
        fade -= 0.022;
        if (fade <= 0) {
          epoch++;
          reset();
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = Math.max(fade, 0);

      // Simple force physics
      const cx = W * 0.5;
      const cy = H * 0.52;

      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.000028;
        n.vy += (cy - n.y) * 0.00006;

        for (let i = 0; i < 4; i++) {
          const o = nodes[Math.floor(Math.random() * nodes.length)];
          if (o === n) continue;
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 6400 && d2 > 0.01) {
            const f = 26 / d2;
            n.vx += dx * f * 0.02;
            n.vy += dy * f * 0.02;
          }
        }

        // Mouse perturbation
        const mdx = n.x - mouse.x;
        const mdy = n.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 16900) {
          const f = (1 - Math.sqrt(md2) / 130) * 1.8;
          n.vx += (mdx / Math.sqrt(md2 + 0.1)) * f;
          n.vy += (mdy / Math.sqrt(md2 + 0.1)) * f;
        }

        n.vx *= 0.92;
        n.vy *= 0.92;
        if (!n.root) {
          n.x += n.vx;
          n.y += n.vy;
        }

        // Soft bounds
        const m = 22;
        if (n.x < m) n.vx += 0.08;
        if (n.x > W - m) n.vx -= 0.08;
        if (n.y < m) n.vy += 0.08;
        if (n.y > H - m) n.vy -= 0.08;
      }

      // Draw links
      for (const l of links) {
        const age = Math.min(Math.max((ts - l.b.born) / 600, 0), 1);
        if (age === 0) continue;
        ctx.strokeStyle = l.op.color;
        ctx.globalAlpha = (l.op.name === 'draft' ? 0.22 : 0.35) * age * Math.max(fade, 0);
        ctx.lineWidth = l.op.name === 'crossover' ? 1.7 : 1.1;
        ctx.setLineDash(l.op.dash);
        ctx.beginPath();
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.a.x + (l.b.x - l.a.x) * age, l.a.y + (l.b.y - l.a.y) * age);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw nodes
      for (const n of nodes) {
        const age = Math.min(Math.max((ts - n.born) / 500, 0), 1);
        if (age === 0) continue;
        const rr = Math.max(n.r * age, 0.4);

        if (n.failed) {
          ctx.strokeStyle = 'rgba(61,65,69,0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(n.x - 3, n.y - 3);
          ctx.lineTo(n.x + 3, n.y + 3);
          ctx.moveTo(n.x + 3, n.y - 3);
          ctx.lineTo(n.x - 3, n.y + 3);
          ctx.stroke();
          continue;
        }

        const isBest = best > 0.4 && Math.abs(n.score - best) < 1e-9;
        if (n.op.hollow && !isBest) {
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = n.op.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, rr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = isBest ? '#FA5F26' : n.op.color;
          ctx.globalAlpha = (n.root ? 0.95 : 0.45 + n.score * 0.55) * Math.max(fade, 0);
          ctx.beginPath();
          ctx.arc(n.x, n.y, isBest ? rr + 1.8 : rr, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = Math.max(fade, 0);
        }

        if (n.root) {
          ctx.strokeStyle = 'rgba(0,0,0,0.6)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, rr + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (isBest) {
          ctx.strokeStyle = 'rgba(250,95,38,0.55)';
          ctx.lineWidth = 1.5;
          const ring = rr + 5 + Math.sin(ts / 300) * 1.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, ring, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = '10.5px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#FA5F26';
          ctx.textAlign = 'left';
          ctx.fillText(best.toFixed(3), n.x + ring + 5, n.y + 3.5);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="figure-container">
      <div className="fig-stage" id="figStage" ref={stageRef}>
        <div className="fig-hud">
          <span className="live">LIVE</span>
          <span>
            epoch <b>{hud.epoch}</b>
          </span>
          <span>
            nodes <b>{hud.nodes}</b>
          </span>
          <span className="best">
            best score <b>{hud.best.toFixed(3)}</b>
          </span>
          <span>
            operator <b>{hud.op}</b>
          </span>
        </div>
        <canvas ref={canvasRef} id="evoCanvas" />
      </div>

      <div className="fig-legend">
        <span>
          <i className="dot dr" /> Draft
        </span>
        <span>
          <i className="dot im" /> Improve
        </span>
        <span>
          <i className="dot db" /> Debug
        </span>
        <span>
          <i className="dot co" /> Crossover
        </span>
        <span>
          <i className="dot bx" /> failed run
        </span>
        <span>
          <i className="dot best-ring" /> <b style={{ color: 'var(--orange)' }}>incumbent best</b>
        </span>
      </div>

      <p className="fig-cap">
        <b>Live · illustrative simulation, not paper trace.</b> <span className="lbl">ExecRL-Evo</span> growing a
        population of executable programs — node size ∝ simulated validation score. Move your cursor to perturb it.
      </p>
    </div>
  );
};
