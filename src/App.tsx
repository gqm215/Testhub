import { useEffect, useRef, useState } from "react";
import SolarSystem from "./components/SolarSystem";
import InfoPanel from "./components/InfoPanel";
import Controls from "./components/Controls";
import { BODIES } from "./data/planets";

export default function App() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [follow, setFollow] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hint, setHint] = useState(true);
  const simTimeRef = useRef<HTMLSpanElement | null>(null);

  const selectedBody = BODIES.find((b) => b.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId) setHint(false);
  }, [selectedId]);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 10000);
    return () => clearTimeout(t);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedId((cur) => {
          const idx = BODIES.findIndex((b) => b.id === cur);
          const delta = e.key === "ArrowRight" ? 1 : -1;
          const next =
            idx === -1
              ? e.key === "ArrowRight"
                ? 0
                : BODIES.length - 1
              : (idx + delta + BODIES.length) % BODIES.length;
          return BODIES[next].id;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-space-950 text-slate-100">
      <SolarSystem
        playing={playing}
        speed={speed}
        showOrbits={showOrbits}
        showLabels={showLabels}
        follow={follow}
        selectedId={selectedId}
        onSelect={setSelectedId}
        simTimeRef={simTimeRef}
      />

      {/* ambient drifting nebulae above the canvas */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <div
          className="nebula-a absolute -left-[12%] -top-[18%] h-[62vh] w-[58vw] rounded-full opacity-[0.13]"
          style={{
            background:
              "radial-gradient(circle, rgba(45,180,190,0.55) 0%, rgba(45,180,190,0) 68%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="nebula-b absolute -bottom-[20%] -right-[10%] h-[66vh] w-[54vw] rounded-full opacity-[0.12]"
          style={{
            background:
              "radial-gradient(circle, rgba(240,150,70,0.5) 0%, rgba(240,150,70,0) 68%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* vignette for UI legibility */}
      <div
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,5,12,0.72) 0%, rgba(3,5,12,0) 18%), linear-gradient(0deg, rgba(3,5,12,0.6) 0%, rgba(3,5,12,0) 16%)",
        }}
      />

      {/* ---------- header ---------- */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="pointer-events-auto">
            <div className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                className="text-solar-400"
              >
                <circle cx="10" cy="10" r="3" fill="currentColor" />
                <ellipse
                  cx="10"
                  cy="10"
                  rx="8.5"
                  ry="3.6"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  opacity="0.75"
                  transform="rotate(-18 10 10)"
                />
                <circle cx="17" cy="6.4" r="1.3" fill="currentColor" opacity="0.9" />
              </svg>
              <span className="font-data text-[10px] font-medium uppercase tracking-[0.34em] text-solar-400/90">
                Interactive Orrery
              </span>
            </div>
            <h1 className="font-display mt-1.5 text-[26px] leading-tight text-slate-50 sm:text-3xl">
              太阳系 · 轨道演示
            </h1>
            <p className="mt-1 hidden text-xs text-slate-400/90 sm:block">
              点击任意天体查看档案 · 拖动滑块调节时间流速
            </p>
          </div>

          {/* body quick-nav */}
          <nav className="pointer-events-auto flex max-w-full flex-wrap justify-start gap-1.5 sm:max-w-[46vw] sm:justify-end">
            {BODIES.map((b) => {
              const active = selectedId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(active ? null : b.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 active:scale-95 ${
                    active
                      ? "border-white/30 bg-white/[0.09] text-slate-50"
                      : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
                  }`}
                  style={
                    active
                      ? { borderColor: `${b.color}88`, boxShadow: `0 0 14px ${b.color}33` }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 32% 30%, ${b.c1}, ${b.c2} 60%, ${b.c3})`,
                      boxShadow: active ? `0 0 8px ${b.color}` : "none",
                    }}
                  />
                  {b.name}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ---------- hint ---------- */}
      {hint && !selectedBody && (
        <div className="anim-hint pointer-events-none fixed bottom-[86px] left-1/2 z-20 -translate-x-1/2">
          <div className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-[#070b18]/80 px-4 py-2 text-xs text-slate-300 backdrop-blur-md">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-solar-300">
              <path
                d="M6 1.5 14.5 8l-3.6.9L8.5 14 6 1.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            点击行星或太阳查看数据 ·
            <kbd>Space</kbd> 播放 / 暂停 ·
            <kbd>←</kbd>
            <kbd>→</kbd> 切换天体
          </div>
        </div>
      )}

      {/* ---------- footnote ---------- */}
      <p className="pointer-events-none fixed bottom-3 left-4 z-10 hidden text-[10px] leading-relaxed text-slate-600 lg:block">
        天体尺寸与轨道间距经压缩处理 · 数据为近似值
        <br />
        1× 速度下 1 秒 ≈ 25 个地球日
      </p>

      {/* ---------- UI ---------- */}
      <Controls
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits((v) => !v)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        follow={follow}
        onToggleFollow={() => setFollow((v) => !v)}
        simTimeRef={simTimeRef}
      />

      {selectedBody && (
        <InfoPanel body={selectedBody} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
