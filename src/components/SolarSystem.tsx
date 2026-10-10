import { useEffect, useRef, useState } from "react";
import {
  BODIES,
  PLANETS,
  SUN,
  DAYS_PER_SEC,
  type BodyData,
} from "../data/planets";

const TAU = Math.PI * 2;

interface Props {
  playing: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  follow: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  simTimeRef: { current: HTMLSpanElement | null };
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
}
interface Twinkle extends Star {
  phase: number;
  speed: number;
}
interface Shoot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
interface ScreenPos {
  id: string;
  x: number;
  y: number;
  r: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function SolarSystem({
  playing,
  speed,
  showOrbits,
  showLabels,
  follow,
  selectedId,
  onSelect,
  simTimeRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const uiRef = useRef({ playing, speed, showOrbits, showLabels, follow, selectedId });
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    uiRef.current = { playing, speed, showOrbits, showLabels, follow, selectedId };
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();

    const bg = document.createElement("canvas");
    const bgCtx = bg.getContext("2d")!;
    let twinkles: Twinkle[] = [];
    let shoots: Shoot[] = [];
    let shootTimer = 3.5;

    // camera in world units — starts slightly offset for a gentle intro drift
    const cam = { x: 90, y: -70, zoom: 0.15 };
    const sim = { days: 0 };
    const screenPos: ScreenPos[] = [];
    let hoverLocal: string | null = null;

    /* ---------------- background ---------------- */
    const buildBackground = () => {
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const base = bgCtx.createLinearGradient(0, 0, 0, H);
      base.addColorStop(0, "#060a18");
      base.addColorStop(0.55, "#04060f");
      base.addColorStop(1, "#03040a");
      bgCtx.fillStyle = base;
      bgCtx.fillRect(0, 0, W, H);

      const blobs = [
        { x: W * 0.16, y: H * 0.2, r: Math.max(W, H) * 0.52, c: "rgba(24,132,148,0.10)" },
        { x: W * 0.86, y: H * 0.78, r: Math.max(W, H) * 0.55, c: "rgba(196,96,58,0.075)" },
        { x: W * 0.64, y: H * 0.12, r: Math.max(W, H) * 0.42, c: "rgba(74,96,196,0.095)" },
        { x: W * 0.28, y: H * 0.88, r: Math.max(W, H) * 0.36, c: "rgba(148,72,128,0.055)" },
      ];
      for (const b of blobs) {
        const g = bgCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        bgCtx.fillStyle = g;
        bgCtx.fillRect(0, 0, W, H);
      }

      // static star field
      for (let i = 0; i < 260; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = rand(0.3, 1.25);
        bgCtx.globalAlpha = rand(0.12, 0.7);
        bgCtx.fillStyle = Math.random() < 0.12 ? "#ffe9c4" : "#cfdaf6";
        bgCtx.beginPath();
        bgCtx.arc(x, y, r, 0, TAU);
        bgCtx.fill();
      }
      // a few bright stars with cross glints
      for (let i = 0; i < 7; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = rand(1.3, 2);
        const g = bgCtx.createRadialGradient(x, y, 0, x, y, r * 5);
        g.addColorStop(0, "rgba(255,255,255,0.85)");
        g.addColorStop(0.25, "rgba(205,220,255,0.28)");
        g.addColorStop(1, "rgba(205,220,255,0)");
        bgCtx.globalAlpha = 1;
        bgCtx.fillStyle = g;
        bgCtx.beginPath();
        bgCtx.arc(x, y, r * 5, 0, TAU);
        bgCtx.fill();
      }
      bgCtx.globalAlpha = 1;

      // vignette
      const v = bgCtx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.32,
        W / 2, H / 2, Math.max(W, H) * 0.72
      );
      v.addColorStop(0, "rgba(2,4,10,0)");
      v.addColorStop(1, "rgba(2,4,10,0.55)");
      bgCtx.fillStyle = v;
      bgCtx.fillRect(0, 0, W, H);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      bg.width = W * dpr;
      bg.height = H * dpr;
      buildBackground();
      twinkles = Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(0.4, 1.4),
        a: rand(0.25, 0.8),
        phase: rand(0, TAU),
        speed: rand(0.6, 2.2),
      }));
    };

    const w2sX = (wx: number) => (wx - cam.x) * cam.zoom + W / 2;
    const w2sY = (wy: number) => (wy - cam.y) * cam.zoom + H / 2;

    /* ---------------- drawing helpers ---------------- */
    const drawRingHalf = (
      px: number,
      py: number,
      r: number,
      back: boolean
    ) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.42);
      const a0 = back ? Math.PI : 0;
      const a1 = back ? TAU : Math.PI;
      ctx.lineWidth = r * 0.3;
      ctx.strokeStyle = "rgba(214,190,140,0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 2.0, r * 0.62, 0, a0, a1);
      ctx.stroke();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = "rgba(238,218,170,0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.52, r * 0.46, 0, a0, a1);
      ctx.stroke();
      ctx.restore();
    };

    const drawBands = (px: number, py: number, r: number, dark: string) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, r, 0, TAU);
      ctx.clip();
      ctx.fillStyle = dark;
      for (const [off, h] of [
        [-0.52, 0.2],
        [-0.1, 0.16],
        [0.3, 0.22],
      ] as const) {
        ctx.fillRect(px - r, py + off * r, r * 2, h * r);
      }
      ctx.restore();
    };

    const drawLabel = (text: string, wx: number, wy: number, z: number) => {
      ctx.font = `500 ${12 / z}px "Noto Sans SC", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.lineWidth = 3.5 / z;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(4,7,16,0.78)";
      ctx.strokeText(text, wx, wy);
      ctx.fillStyle = "rgba(226,232,240,0.92)";
      ctx.fillText(text, wx, wy);
    };

    /* ---------------- main loop ---------------- */
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ui = uiRef.current;
      if (ui.playing) sim.days += dt * DAYS_PER_SEC * ui.speed;
      const t = now / 1000;

      const fit = (Math.min(W, H) / 2 - 42) / 665;

      // selected body world position (needed for follow-cam + highlight)
      const sel = ui.selectedId
        ? BODIES.find((b) => b.id === ui.selectedId) ?? null
        : null;
      let selWX = 0;
      let selWY = 0;
      if (sel && sel.orbitR > 0) {
        const ang = sel.startAngle + (TAU * sim.days) / sel.orbitDays;
        selWX = Math.cos(ang) * sel.orbitR;
        selWY = Math.sin(ang) * sel.orbitR;
      }

      // camera targets
      let tx = 0;
      let ty = 0;
      let tz = fit;
      if (sel && sel.orbitR > 0 && ui.follow) {
        tx = selWX;
        ty = selWY;
        tz = Math.min(Math.max(fit * 3.6, 0.5), 2.4);
      } else if (sel && sel.isStar && ui.follow) {
        tz = fit * 1.9;
      }
      const k = 1 - Math.exp(-dt * 4.2);
      cam.x += (tx - cam.x) * k;
      cam.y += (ty - cam.y) * k;
      cam.zoom += (tz - cam.zoom) * k;
      const z = cam.zoom;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(bg, 0, 0, W, H);

      // twinkling stars
      for (const s of twinkles) {
        const a = s.a * (0.45 + 0.55 * Math.sin(t * s.speed + s.phase));
        if (a < 0.03) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#cdd8f5";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // shooting stars
      shootTimer -= dt;
      if (shootTimer <= 0) {
        shootTimer = rand(6, 13);
        const dir = Math.random() < 0.5 ? -1 : 1;
        shoots.push({
          x: rand(W * 0.15, W * 0.85),
          y: rand(0, H * 0.35),
          vx: dir * rand(190, 330),
          vy: rand(120, 210),
          life: 1,
        });
      }
      shoots = shoots.filter((s) => s.life > 0);
      for (const s of shoots) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 1.15;
        const tx2 = s.x - s.vx * 0.18;
        const ty2 = s.y - s.vy * 0.18;
        const g = ctx.createLinearGradient(s.x, s.y, tx2, ty2);
        g.addColorStop(0, `rgba(255,255,255,${Math.max(0, 0.85 * s.life)})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }

      /* ---- world space ---- */
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(z, z);
      ctx.translate(-cam.x, -cam.y);

      // orbit paths
      if (ui.showOrbits) {
        for (const p of PLANETS) {
          const active = ui.selectedId === p.id || hoverLocal === p.id;
          ctx.beginPath();
          ctx.arc(0, 0, p.orbitR, 0, TAU);
          if (active) {
            ctx.lineWidth = 4.5 / z;
            ctx.strokeStyle = hexA(p.color, 0.14);
            ctx.stroke();
            ctx.lineWidth = 1.5 / z;
            ctx.strokeStyle = hexA(p.color, 0.75);
          } else {
            ctx.lineWidth = 1 / z;
            ctx.strokeStyle = "rgba(148,163,184,0.15)";
          }
          ctx.stroke();
        }
      }

      screenPos.length = 0;

      // sun
      const pulse = 1 + Math.sin(t * 1.8) * 0.025;
      const sr = SUN.size * pulse;
      let g = ctx.createRadialGradient(0, 0, sr * 0.4, 0, 0, sr * 3.4);
      g.addColorStop(0, "rgba(255,190,90,0.30)");
      g.addColorStop(0.45, "rgba(255,140,50,0.10)");
      g.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, sr * 3.4, 0, TAU);
      ctx.fill();

      g = ctx.createRadialGradient(-sr * 0.22, -sr * 0.22, sr * 0.08, 0, 0, sr);
      g.addColorStop(0, "#fff8dc");
      g.addColorStop(0.35, "#ffe29a");
      g.addColorStop(0.72, "#ffb84d");
      g.addColorStop(1, "#ff8a3c");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, sr, 0, TAU);
      ctx.fill();

      screenPos.push({
        id: SUN.id,
        x: w2sX(0),
        y: w2sY(0),
        r: Math.max(sr * z, 16),
      });

      if (ui.selectedId === SUN.id) {
        ctx.setLineDash([6 / z, 5 / z]);
        ctx.lineDashOffset = (-t * 26) / z;
        ctx.lineWidth = 1.5 / z;
        ctx.strokeStyle = hexA(SUN.color, 0.9);
        ctx.beginPath();
        ctx.arc(0, 0, sr + 10 / z, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (ui.showLabels || ui.selectedId === SUN.id || hoverLocal === SUN.id) {
        drawLabel(SUN.name, 0, sr + 22 / z, z);
      }

      // planets
      for (const p of PLANETS) {
        const ang = p.startAngle + (TAU * sim.days) / p.orbitDays;
        const px = Math.cos(ang) * p.orbitR;
        const py = Math.sin(ang) * p.orbitR;
        const r = p.size;

        screenPos.push({
          id: p.id,
          x: w2sX(px),
          y: w2sY(py),
          r: Math.max(r * z, 13),
        });

        // ambient glow
        const gg = ctx.createRadialGradient(px, py, r * 0.4, px, py, r * 2.6);
        gg.addColorStop(0, hexA(p.color, 0.26));
        gg.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(px, py, r * 2.6, 0, TAU);
        ctx.fill();

        if (p.hasRings) drawRingHalf(px, py, r, true);

        // sphere lit from the sun's direction
        const d = Math.hypot(px, py) || 1;
        const lx = px - (px / d) * r * 0.45;
        const ly = py - (py / d) * r * 0.45;
        const sg = ctx.createRadialGradient(lx, ly, r * 0.12, px, py, r * 1.05);
        sg.addColorStop(0, p.c1);
        sg.addColorStop(0.55, p.c2);
        sg.addColorStop(1, p.c3);
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TAU);
        ctx.fill();

        if (p.bands) drawBands(px, py, r, "rgba(90,55,25,0.16)");

        if (p.hasRings) drawRingHalf(px, py, r, false);

        // the Moon
        if (p.id === "earth") {
          const mr = r + 8;
          ctx.beginPath();
          ctx.arc(px, py, mr, 0, TAU);
          ctx.lineWidth = 0.7 / z;
          ctx.strokeStyle = "rgba(203,213,225,0.22)";
          ctx.stroke();
          const ma = TAU * (sim.days / 27.3);
          ctx.fillStyle = "#c9ccd4";
          ctx.beginPath();
          ctx.arc(px + Math.cos(ma) * mr, py + Math.sin(ma) * mr, 2.4, 0, TAU);
          ctx.fill();
        }

        // hover + selection rings
        if (hoverLocal === p.id && ui.selectedId !== p.id) {
          ctx.lineWidth = 1 / z;
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.beginPath();
          ctx.arc(px, py, r + 5 / z, 0, TAU);
          ctx.stroke();
        }
        if (ui.selectedId === p.id) {
          ctx.setLineDash([6 / z, 5 / z]);
          ctx.lineDashOffset = (-t * 26) / z;
          ctx.lineWidth = 1.5 / z;
          ctx.strokeStyle = hexA(p.color, 0.95);
          ctx.beginPath();
          ctx.arc(px, py, r + 8 / z, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (ui.showLabels || ui.selectedId === p.id || hoverLocal === p.id) {
          const off = p.hasRings ? r * 1.55 : r;
          drawLabel(p.name, px, py - off - 10 / z, z);
        }
      }

      ctx.restore();

      // simulated-time readout
      const el = simTimeRef.current;
      if (el) {
        const days = sim.days;
        const years = Math.floor(days / 365.25);
        const rem = Math.floor(days - years * 365.25);
        el.textContent =
          years > 0 ? `${years} 年 ${rem} 天` : `${Math.floor(days)} 天`;
      }

      raf = requestAnimationFrame(frame);
    };

    /* ---------------- pointer interaction ---------------- */
    const hitTest = (mx: number, my: number): string | null => {
      for (let i = screenPos.length - 1; i >= 0; i--) {
        const s = screenPos[i];
        if (Math.hypot(mx - s.x, my - s.y) <= s.r + 4) return s.id;
      }
      return null;
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const id = hitTest(mx, my);
      if (id !== hoverLocal) {
        hoverLocal = id;
        setHoverId(id);
      }
      canvas.style.cursor = id ? "pointer" : "default";
      const tip = tooltipRef.current;
      if (tip) {
        tip.style.left = `${e.clientX + 16}px`;
        tip.style.top = `${e.clientY + 14}px`;
      }
    };

    const onLeave = () => {
      hoverLocal = null;
      setHoverId(null);
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const id = hitTest(e.clientX - rect.left, e.clientY - rect.top);
      onSelectRef.current(id);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoverBody: BodyData | null = hoverId
    ? BODIES.find((b) => b.id === hoverId) ?? null
    : null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        aria-label="太阳系轨道模拟画布"
      />
      {/* hover tooltip */}
      <div
        ref={tooltipRef}
        className={`pointer-events-none fixed z-40 -translate-y-0 rounded-md border border-white/12 bg-[#0a1024]/92 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-opacity duration-150 ${
          hoverBody ? "opacity-100" : "opacity-0"
        }`}
        style={{ left: -200, top: -200 }}
      >
        {hoverBody && (
          <div className="flex items-baseline gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 self-center rounded-full"
              style={{
                background: hoverBody.color,
                boxShadow: `0 0 8px ${hoverBody.color}`,
              }}
            />
            <span className="font-display text-sm leading-none text-slate-100">
              {hoverBody.name}
            </span>
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {hoverBody.english}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
