import { useEffect, useRef } from "react";
import { PLANETS } from "../data/planets";

interface Props {
  playing: boolean;
  speed: number;
  zoom: number;
  selected: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  reducedMotion: boolean;
  onSelect: (id: string | null) => void;
  onTogglePlay: () => void;
  onZoomBy: (dir: 1 | -1) => void;
  onSimDays: (days: number) => void;
}

/* ------- 视觉常量（非真实比例，为教学效果做了艺术化处理） ------- */
const ORBIT_F = [0.148, 0.215, 0.286, 0.362, 0.505, 0.65, 0.795, 0.94];
const P_RAD = [3.4, 5.4, 5.9, 4.5, 13.2, 10.8, 8.1, 7.9];
const TILT = 0.8; // 轻微俯视倾角，制造空间纵深
const SUN_R = 27;
const START_ANGLES = [0.9, 2.5, 4.3, 5.6, 1.7, 3.4, 0.25, 5.1];
const BASE_DAYS_PER_SEC = 20; // 1× 速度：1 秒 ≈ 20 个地球日
const PERIODS = PLANETS.map((p) => p.periodDays ?? 365);

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
  v: number;
  tint: string;
}
interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
}
interface HitTarget {
  id: string;
  x: number;
  y: number;
  r: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const TRAIL_SPANS = PERIODS.map((p) => Math.min(1.15, Math.max(0.14, 110 / p)));

export default function SolarSystem(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const simRef = useRef({
    angles: [...START_ANGLES],
    simDays: 0,
    t: 0,
    stars: [] as Star[],
    comets: [] as Comet[],
    cometTimer: 6,
    hoverId: null as string | null,
    mouse: null as { x: number; y: number } | null,
    hits: [] as HitTarget[],
    w: 0,
    h: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sim = simRef.current;

    /* ---------- 尺寸与星场 ---------- */
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sim.w = w;
      sim.h = h;
      const count = Math.max(140, Math.min(430, Math.round((w * h) / 2600)));
      const tints = ["#ffffff", "#ffffff", "#cfe2ff", "#ffe9c9", "#c9f2f5"];
      sim.stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1,
        a: 0.25 + Math.random() * 0.65,
        tw: 0.6 + Math.random() * 1.8,
        ph: Math.random() * Math.PI * 2,
        v: 1.2 + Math.random() * 4.5,
        tint: tints[Math.floor(Math.random() * tints.length)],
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---------- 交互 ---------- */
    const pick = (mx: number, my: number): string | null => {
      let best: HitTarget | null = null;
      let bestD = Infinity;
      for (const t of sim.hits) {
        const d = Math.hypot(mx - t.x, my - t.y);
        if (d <= t.r + 9 && d < bestD) {
          best = t;
          bestD = d;
        }
      }
      return best ? best.id : null;
    };
    const toLocal = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e: MouseEvent) => {
      const m = toLocal(e);
      sim.mouse = m;
      const id = pick(m.x, m.y);
      sim.hoverId = id;
      canvas.style.cursor = id ? "pointer" : "default";
    };
    const onLeave = () => {
      sim.mouse = null;
      sim.hoverId = null;
    };
    const onClick = (e: MouseEvent) => {
      const m = toLocal(e);
      propsRef.current.onSelect(pick(m.x, m.y));
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      propsRef.current.onZoomBy(e.deltaY < 0 ? 1 : -1);
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    /* ---------- 绘制 ---------- */
    const draw = (dt: number) => {
      const p = propsRef.current;
      const { w, h } = sim;
      if (w === 0 || h === 0) return;
      const reduced = p.reducedMotion;
      if (!reduced) sim.t += dt;
      const t = sim.t;

      ctx.clearRect(0, 0, w, h);

      /* 星场（视差漂移 + 闪烁） */
      for (const s of sim.stars) {
        const x = (s.x + t * s.v) % w;
        const twinkle = reduced ? 1 : 0.62 + 0.38 * Math.sin(t * s.tw + s.ph);
        ctx.globalAlpha = s.a * twinkle;
        ctx.fillStyle = s.tint;
        ctx.beginPath();
        ctx.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* 彗星 */
      if (!reduced && p.playing) {
        sim.cometTimer -= dt;
        if (sim.cometTimer <= 0 && sim.comets.length < 2) {
          const fromLeft = Math.random() > 0.5;
          sim.comets.push({
            x: fromLeft ? -40 : w + 40,
            y: h * (0.08 + Math.random() * 0.3),
            vx: (fromLeft ? 1 : -1) * (380 + Math.random() * 220),
            vy: 90 + Math.random() * 130,
            len: 110 + Math.random() * 70,
          });
          sim.cometTimer = 9 + Math.random() * 11;
        }
      }
      sim.comets = sim.comets.filter(
        (c) => c.x > -200 && c.x < w + 200 && c.y < h + 200
      );
      for (const c of sim.comets) {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        const mag = Math.hypot(c.vx, c.vy);
        const tx = (c.vx / mag) * c.len;
        const ty = (c.vy / mag) * c.len;
        const grad = ctx.createLinearGradient(c.x, c.y, c.x - tx, c.y - ty);
        grad.addColorStop(0, "rgba(210,240,255,0.9)");
        grad.addColorStop(1, "rgba(210,240,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - tx, c.y - ty);
        ctx.stroke();
        ctx.fillStyle = "rgba(235,248,255,0.95)";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 几何布局 */
      const cx = w / 2;
      const cy = h * 0.53;
      const R = Math.min(w * 0.445, h * 0.465);
      const scale = Math.max(0.62, Math.min(1.15, Math.min(w, h) / 880));
      const zoom = p.zoom;
      const sunR = SUN_R * scale * Math.pow(zoom, 0.55);

      /* 轨道 */
      if (p.showOrbits) {
        for (let i = 0; i < 8; i++) {
          const sel = PLANETS[i].id === p.selected;
          const hov = PLANETS[i].id === sim.hoverId;
          const rOrbit = ORBIT_F[i] * R * zoom;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rOrbit, rOrbit * TILT, 0, 0, Math.PI * 2);
          ctx.strokeStyle =
            sel || hov
              ? hexToRgba(PLANETS[i].color, sel ? 0.55 : 0.38)
              : "rgba(190,205,235,0.13)";
          ctx.lineWidth = sel || hov ? 1.4 : 1;
          ctx.stroke();
        }
      }

      /* 计算行星位置 */
      type PItem = { i: number; x: number; y: number; r: number };
      const items: PItem[] = PLANETS.map((body, i) => {
        const rOrbit = ORBIT_F[i] * R * zoom;
        const a = sim.angles[i];
        const pr = P_RAD[i] * scale * Math.pow(zoom, 0.5);
        return {
          i,
          x: cx + Math.cos(a) * rOrbit,
          y: cy + Math.sin(a) * rOrbit * TILT,
          r: pr,
        };
      });

      sim.hits = [
        { id: "sun", x: cx, y: cy, r: sunR + 6 },
        ...items.map((it) => ({
          id: PLANETS[it.i].id,
          x: it.x,
          y: it.y,
          r: Math.max(it.r, 10),
        })),
      ];

      /* 画家算法：先远处（y 小），太阳按自身 y 插入 */
      const ordered: PItem[] = [...items].sort((a, b) => a.y - b.y);
      const queue: (PItem | "sun")[] = [];
      let sunPlaced = false;
      for (const it of ordered) {
        if (!sunPlaced && it.y >= cy) {
          queue.push("sun");
          sunPlaced = true;
        }
        queue.push(it);
      }
      if (!sunPlaced) queue.push("sun");

      const drawTrail = (it: PItem) => {
        const body = PLANETS[it.i];
        const rOrbit = ORBIT_F[it.i] * R * zoom;
        const span = TRAIL_SPANS[it.i];
        const N = 24;
        const a = sim.angles[it.i];
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(1.1, it.r * 0.26);
        let px = it.x;
        let py = it.y;
        for (let k = 1; k <= N; k++) {
          const ak = a - (span * k) / N;
          const nx = cx + Math.cos(ak) * rOrbit;
          const ny = cy + Math.sin(ak) * rOrbit * TILT;
          ctx.strokeStyle = hexToRgba(
            body.color,
            0.42 * (1 - k / N) * (body.id === p.selected ? 1.5 : 1)
          );
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          px = nx;
          py = ny;
        }
      };

      const drawSaturnRing = (it: PItem, front: boolean) => {
        const rr = it.r;
        ctx.strokeStyle = hexToRgba("#e8d9a8", front ? 0.85 : 0.45);
        ctx.lineWidth = rr * 0.42;
        ctx.beginPath();
        if (front) ctx.ellipse(it.x, it.y, rr * 2.05, rr * 0.62, -0.32, 0.05, Math.PI - 0.05);
        else ctx.ellipse(it.x, it.y, rr * 2.05, rr * 0.62, -0.32, Math.PI, Math.PI * 2);
        ctx.stroke();
      };

      const drawPlanet = (it: PItem) => {
        const body = PLANETS[it.i];
        const { x, y, r } = it;

        drawTrail(it);
        if (body.id === "saturn") drawSaturnRing(it, false);

        const lightA = Math.atan2(cy - y, cx - x);
        const g = ctx.createRadialGradient(
          x + Math.cos(lightA) * r * 0.45,
          y + Math.sin(lightA) * r * 0.45,
          r * 0.12,
          x,
          y,
          r
        );
        g.addColorStop(0, hexToRgba("#ffffff", 0.95));
        g.addColorStop(0.25, body.color);
        g.addColorStop(1, hexToRgba(body.glow, 1));
        ctx.shadowColor = body.color;
        ctx.shadowBlur = r * 2.4;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (body.id === "saturn") drawSaturnRing(it, true);

        /* 地球的月球 */
        if (body.id === "earth") {
          const ma = t * 2.6 + 1.2;
          const mx = x + Math.cos(ma) * r * 2.7;
          const my = y + Math.sin(ma) * r * 1.35;
          ctx.fillStyle = "rgba(207,216,227,0.9)";
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(1.3, r * 0.24), 0, Math.PI * 2);
          ctx.fill();
        }

        /* 悬停 / 选中指示环 */
        const isSel = p.selected === body.id;
        const isHov = sim.hoverId === body.id;
        if (isSel || isHov) {
          ctx.beginPath();
          ctx.arc(x, y, r + 6, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(body.color, isSel ? 0.95 : 0.7);
          ctx.lineWidth = 1.4;
          if (isSel) {
            ctx.setLineDash([4, 6]);
            ctx.lineDashOffset = -t * 26;
          }
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(x, y, r + 11, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(body.color, 0.22);
          ctx.stroke();
        }

        /* 名称标签 */
        if (p.showLabels || isSel || isHov) {
          ctx.font = `500 ${Math.round(11 * scale)}px "Noto Sans SC", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = isSel || isHov ? "#ffffff" : "rgba(226,232,255,0.6)";
          ctx.fillText(body.nameZh, x, y + r + 9);
          ctx.shadowBlur = 0;
        }
      };

      const drawSun = () => {
        const pulse = reduced ? 0 : 1;
        const breathe = 1 + 0.045 * pulse * Math.sin(t * 1.4);
        const r0 = sunR * breathe;

        const g3 = ctx.createRadialGradient(cx, cy, r0 * 0.4, cx, cy, r0 * 6);
        g3.addColorStop(0, `rgba(255,158,44,${0.2 + 0.06 * pulse * Math.sin(t * 1.1)})`);
        g3.addColorStop(1, "rgba(255,158,44,0)");
        ctx.fillStyle = g3;
        ctx.beginPath();
        ctx.arc(cx, cy, r0 * 6, 0, Math.PI * 2);
        ctx.fill();

        const g2 = ctx.createRadialGradient(cx, cy, r0 * 0.5, cx, cy, r0 * 2.6);
        g2.addColorStop(0, "rgba(255,201,77,0.5)");
        g2.addColorStop(1, "rgba(255,201,77,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(cx, cy, r0 * 2.6, 0, Math.PI * 2);
        ctx.fill();

        const core = ctx.createRadialGradient(
          cx - r0 * 0.25,
          cy - r0 * 0.25,
          r0 * 0.1,
          cx,
          cy,
          r0
        );
        core.addColorStop(0, "#fff8e1");
        core.addColorStop(0.45, "#ffd75e");
        core.addColorStop(1, "#ff9e2c");
        ctx.shadowColor = "#ffc94d";
        ctx.shadowBlur = r0 * 1.6;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, r0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.selected === "sun" || sim.hoverId === "sun") {
          ctx.beginPath();
          ctx.arc(cx, cy, r0 + 8, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,201,77,0.85)";
          ctx.lineWidth = 1.4;
          if (p.selected === "sun") {
            ctx.setLineDash([4, 6]);
            ctx.lineDashOffset = -t * 26;
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (p.showLabels || p.selected === "sun" || sim.hoverId === "sun") {
          ctx.font = `500 ${Math.round(11 * scale)}px "Noto Sans SC", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = "rgba(255,231,178,0.85)";
          ctx.fillText("太阳", cx, cy + r0 + 10);
          ctx.shadowBlur = 0;
        }
      };

      for (const q of queue) {
        if (q === "sun") drawSun();
        else drawPlanet(q);
      }

      /* 悬停提示气泡 */
      if (sim.hoverId && sim.mouse) {
        const hit = sim.hits.find((h2) => h2.id === sim.hoverId);
        const body =
          sim.hoverId === "sun"
            ? null
            : PLANETS.find((b) => b.id === sim.hoverId);
        if (hit) {
          const name = sim.hoverId === "sun" ? "太阳" : body?.nameZh ?? "";
          const sub = "点击查看详情";
          ctx.font = `500 ${Math.round(12 * scale)}px "Noto Sans SC", sans-serif`;
          const wName = ctx.measureText(name).width;
          ctx.font = `400 ${Math.round(10 * scale)}px "Noto Sans SC", sans-serif`;
          const wSub = ctx.measureText(sub).width;
          const bw = Math.max(wName, wSub) + 24;
          const bh = 42;
          let bx = hit.x - bw / 2;
          let by = hit.y - hit.r - bh - 14;
          bx = Math.max(8, Math.min(w - bw - 8, bx));
          if (by < 8) by = hit.y + hit.r + 14;
          roundRect(ctx, bx, by, bw, bh, 9);
          ctx.fillStyle = "rgba(8,12,26,0.88)";
          ctx.fill();
          ctx.strokeStyle = "rgba(245,198,106,0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.font = `500 ${Math.round(12 * scale)}px "Noto Sans SC", sans-serif`;
          ctx.fillStyle = "#ffffff";
          ctx.fillText(name, bx + bw / 2, by + 7);
          ctx.font = `400 ${Math.round(10 * scale)}px "Noto Sans SC", sans-serif`;
          ctx.fillStyle = "rgba(226,232,255,0.55)";
          ctx.fillText(sub, bx + bw / 2, by + 24);
        }
      }
    };

    /* ---------- 主循环 ---------- */
    let raf = 0;
    let last = performance.now();
    let uiAccum = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = propsRef.current;
      if (p.playing) {
        const dtDays = dt * BASE_DAYS_PER_SEC * p.speed;
        sim.simDays += dtDays;
        for (let i = 0; i < 8; i++) {
          sim.angles[i] += (dtDays * Math.PI * 2) / PERIODS[i];
        }
      }
      draw(dt);
      uiAccum += dt;
      if (uiAccum > 0.15) {
        uiAccum = 0;
        p.onSimDays(sim.simDays);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-label="太阳系轨道动画画布"
      role="img"
    />
  );
}
