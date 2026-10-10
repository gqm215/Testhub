import type { CSSProperties, ReactNode } from "react";

interface ControlsProps {
  playing: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  follow: boolean;
  onToggleFollow: () => void;
  simTimeRef: { current: HTMLSpanElement | null };
}

const PRESETS = [0.5, 1, 5, 20];
const LOG_MIN = 0.1;
const LOG_RANGE = 500; // 0.1 × 500 = 50

const speedToSlider = (s: number) =>
  (Math.log(s / LOG_MIN) / Math.log(LOG_RANGE)) * 1000;

const formatSpeed = (s: number) =>
  s >= 10 ? `${Math.round(s)}×` : s >= 1 ? `${parseFloat(s.toFixed(1))}×` : `${s.toFixed(1)}×`;

function Toggle({
  active,
  onClick,
  dotColor,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dotColor: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 active:scale-95 ${
        active
          ? "border-white/20 bg-white/[0.08] text-slate-100"
          : "border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full transition-all duration-200"
        style={{
          background: active ? dotColor : "rgba(255,255,255,0.25)",
          boxShadow: active ? `0 0 8px ${dotColor}` : "none",
        }}
      />
      {children}
    </button>
  );
}

export default function Controls({
  playing,
  onTogglePlay,
  speed,
  onSpeedChange,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  follow,
  onToggleFollow,
  simTimeRef,
}: ControlsProps) {
  const sliderVal = speedToSlider(speed);

  return (
    <div className="fixed bottom-3 left-1/2 z-30 w-max max-w-[min(96vw,1000px)] -translate-x-1/2">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-[#070b18]/85 px-4 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-md">
        {/* play / pause */}
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "暂停" : "播放"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#0a0f1f] shadow-[0_0_18px_rgba(245,198,106,0.45)] transition-all duration-200 hover:scale-108 hover:shadow-[0_0_26px_rgba(245,198,106,0.65)] active:scale-92"
          style={{
            background: "linear-gradient(135deg, #ffe29a, #f5a83d)",
          }}
        >
          {playing ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2.5" y="1.5" width="3.4" height="11" rx="1" />
              <rect x="8.1" y="1.5" width="3.4" height="11" rx="1" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
              <path d="M4.2 2.4v9.2c0 .8.87 1.28 1.55.85l7.3-4.6a1 1 0 0 0 0-1.7L5.75 1.55A1.02 1.02 0 0 0 4.2 2.4Z" />
            </svg>
          )}
        </button>

        {/* speed */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] tracking-[0.2em] text-slate-500">
            速度
          </span>
          <div className="hidden items-center gap-1 md:flex">
            {PRESETS.map((p) => {
              const active = Math.abs(speed - p) < 0.001;
              return (
                <button
                  key={p}
                  onClick={() => onSpeedChange(p)}
                  className={`font-data rounded-md px-1.5 py-0.5 text-[11px] transition-all duration-150 active:scale-92 ${
                    active
                      ? "bg-solar-400/20 text-solar-300 shadow-[inset_0_0_0_1px_rgba(245,198,106,0.4)]"
                      : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {p}×
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            value={sliderVal}
            aria-label="时间流速"
            onChange={(e) => {
              const v = Number(e.target.value);
              onSpeedChange(LOG_MIN * Math.pow(LOG_RANGE, v / 1000));
            }}
            className="orbit-slider w-28 sm:w-36"
            style={{ "--fill": `${sliderVal / 10}%` } as CSSProperties}
          />
          <span className="font-data w-11 text-right text-sm font-semibold text-solar-300">
            {formatSpeed(speed)}
          </span>
        </div>

        <span className="hidden h-6 w-px bg-white/10 sm:block" />

        {/* display toggles */}
        <div className="flex items-center gap-1.5">
          <Toggle active={showOrbits} onClick={onToggleOrbits} dotColor="#6fc9cf">
            轨道
          </Toggle>
          <Toggle active={showLabels} onClick={onToggleLabels} dotColor="#9db8f0">
            标签
          </Toggle>
          <Toggle active={follow} onClick={onToggleFollow} dotColor="#f5c66a">
            跟随
          </Toggle>
        </div>

        <span className="hidden h-6 w-px bg-white/10 sm:block" />

        {/* mission clock */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-slate-500">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                playing ? "animate-pulse bg-emerald-400" : "bg-slate-600"
              }`}
            />
            已模拟
          </span>
          <span
            ref={simTimeRef}
            className="font-data min-w-[86px] text-xs font-medium tabular-nums text-ice-300"
          >
            0 天
          </span>
        </div>
      </div>
    </div>
  );
}
