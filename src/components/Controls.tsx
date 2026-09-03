import type { CSSProperties } from "react";

export const SPEED_MIN = 0.1;
export const SPEED_MAX = 20;

export const speedToSlider = (speed: number) =>
  Math.log(speed / SPEED_MIN) / Math.log(SPEED_MAX / SPEED_MIN);
export const sliderToSpeed = (v: number) =>
  SPEED_MIN * Math.pow(SPEED_MAX / SPEED_MIN, v);

interface Props {
  playing: boolean;
  speed: number;
  zoom: number;
  simDays: number;
  showOrbits: boolean;
  showLabels: boolean;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onZoomBy: (dir: 1 | -1) => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onReset: () => void;
}

const PRESETS = [0.5, 1, 2, 5, 10];

const fmtSpeed = (s: number) =>
  s >= 10 ? `${Math.round(s)}×` : s >= 1 ? `${s.toFixed(1)}×` : `${s.toFixed(2)}×`;

export default function Controls({
  playing,
  speed,
  zoom,
  simDays,
  showOrbits,
  showLabels,
  onTogglePlay,
  onSpeedChange,
  onZoomBy,
  onToggleOrbits,
  onToggleLabels,
  onReset,
}: Props) {
  const years = Math.floor(simDays / 365.25);
  const days = Math.floor(simDays % 365.25);
  const v = speedToSlider(speed);
  const btnBase =
    "flex items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-200 hover:border-solar-400/60 hover:text-solar-300 active:scale-90";

  return (
    <div className="absolute bottom-4 left-1/2 z-30 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 md:bottom-6">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-2xl border border-white/10 bg-[#070b18]/85 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-md md:rounded-full md:px-6">
        {/* 播放 / 暂停 */}
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "暂停" : "播放"}
          title={playing ? "暂停（空格）" : "播放（空格）"}
          className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-solar-300 to-solar-500 text-[#1a1205] shadow-[0_0_24px_rgba(245,198,106,0.45)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-90"
        >
          <span className="absolute inset-0 rounded-full bg-solar-300/40 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" className="relative">
              <rect x="3" y="2.5" width="3.6" height="11" rx="1.2" fill="currentColor" />
              <rect x="9.4" y="2.5" width="3.6" height="11" rx="1.2" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" className="relative ml-0.5">
              <path d="M4 2.8a1 1 0 0 1 1.53-.85l8.2 5.2a1 1 0 0 1 0 1.7l-8.2 5.2A1 1 0 0 1 4 13.2V2.8z" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* 模拟时间 */}
        <div className="w-[104px] shrink-0">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/35">模拟时间</div>
          <div className="font-data text-sm font-semibold text-solar-300">
            {years > 0 ? `${years} 年 ` : ""}
            {days} 天
          </div>
        </div>

        <div className="hidden h-9 w-px bg-white/10 md:block" />

        {/* 速度 */}
        <div className="flex shrink-0 items-center gap-3">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">速度</span>
              <span className="font-data text-xs font-semibold text-white">{fmtSpeed(speed)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={v}
              aria-label="模拟速度"
              onChange={(e) => onSpeedChange(sliderToSpeed(parseFloat(e.target.value)))}
              className="orbit-slider w-36 md:w-40"
              style={{ "--fill": `${v * 100}%` } as CSSProperties}
            />
            <div className="mt-1.5 flex gap-1">
              {PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`font-data rounded-full border px-1.5 py-[1px] text-[10px] leading-4 transition-all duration-200 active:scale-90 ${
                    Math.abs(speed - s) < 0.05
                      ? "border-solar-400/70 bg-solar-400/15 text-solar-300"
                      : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden h-9 w-px bg-white/10 md:block" />

        {/* 缩放 */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={() => onZoomBy(-1)} aria-label="缩小" title="缩小" className={`${btnBase} h-8 w-8`}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-data w-11 text-center text-xs font-medium text-white/70">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => onZoomBy(1)} aria-label="放大" title="放大（滚轮）" className={`${btnBase} h-8 w-8`}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="hidden h-9 w-px bg-white/10 md:block" />

        {/* 显示开关 + 重置 */}
        <div className="flex shrink-0 items-center gap-1.5">
          {(
            [
              ["轨道", showOrbits, onToggleOrbits],
              ["标签", showLabels, onToggleLabels],
            ] as const
          ).map(([label, on, fn]) => (
            <button
              key={label}
              onClick={fn}
              aria-pressed={on}
              title={`切换${label}显示`}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 active:scale-90 ${
                on
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 text-white/35 hover:text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={onReset}
            aria-label="重置模拟"
            title="重置模拟"
            className={`${btnBase} ml-1 h-8 w-8`}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M12 7a5 5 0 1 1-1.6-3.68M12 1.5v2.8H9.2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
