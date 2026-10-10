import type { CSSProperties } from "react";
import type { BodyData } from "../data/planets";

interface Props {
  body: BodyData;
  onClose: () => void;
}

export default function InfoPanel({ body, onClose }: Props) {
  const stats: [string, string][] = [
    ["直径", body.diameter],
    ["距太阳距离", body.distance],
    ["轨道半径", body.au],
    ["公转周期", body.orbitPeriod],
    ["自转周期", body.rotation],
    ["已知卫星", body.moons],
    ["温度", body.temp],
    ["类型", body.category],
  ];

  return (
    <aside
      key={body.id}
      className="anim-panel-in fixed z-30 overflow-hidden rounded-xl border border-white/10 bg-[#070b18]/88 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-md left-3 right-3 bottom-[150px] max-h-[42vh] sm:left-auto sm:right-5 sm:bottom-auto sm:top-24 sm:w-[348px] sm:max-h-[calc(100vh-210px)]"
      style={{ boxShadow: `0 24px 70px rgba(0,0,0,0.55), 0 0 44px ${body.color}1f` }}
    >
      {/* accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${body.color}, ${body.color}33 60%, transparent)`,
        }}
      />
      <div className="slim-scroll h-full overflow-y-auto">
        <div className="p-5">
          {/* header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-block rounded-full border px-2.5 py-0.5 font-data text-[10px] uppercase tracking-[0.22em]"
                style={{
                  borderColor: `${body.color}55`,
                  color: body.color,
                  background: `${body.color}12`,
                }}
              >
                {body.english}
              </span>
              <h2 className="font-display mt-2 text-[32px] leading-none text-slate-50">
                {body.name}
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">{body.category}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="关闭档案"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-slate-400 transition-all duration-200 hover:rotate-90 hover:border-white/30 hover:text-slate-100 active:scale-90"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* planet swatch */}
          <div
            className="anim-stat-in mt-4 flex h-16 items-center justify-center rounded-lg border border-white/5"
            style={{
              animationDelay: "60ms",
              background: `radial-gradient(circle at 32% 30%, ${body.c1}2e, transparent 65%), radial-gradient(circle at 70% 80%, ${body.color}1c, transparent 60%), rgba(255,255,255,0.02)`,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-9 w-9 rounded-full"
                style={{
                  background: `radial-gradient(circle at 32% 30%, ${body.c1}, ${body.c2} 55%, ${body.c3})`,
                  boxShadow: `0 0 18px ${body.color}66, inset -3px -3px 6px rgba(0,0,0,0.4)`,
                }}
              />
              <span className="font-data text-xs tracking-[0.25em] text-slate-400">
                {body.isStar ? "SYSTEM CENTER" : `ORBIT № ${["MERCURY","VENUS","EARTH","MARS","JUPITER","SATURN","URANUS","NEPTUNE"].indexOf(body.english.toUpperCase()) + 1}`}
              </span>
            </div>
          </div>

          {/* stats */}
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {stats.map(([label, value], i) => (
              <div
                key={label}
                className="anim-stat-in rounded-lg border border-white/5 bg-white/[0.035] px-3 py-2.5"
                style={{ animationDelay: `${100 + i * 45}ms` }}
              >
                <dt className="text-[10px] tracking-wider text-slate-500">
                  {label}
                </dt>
                <dd className="font-data mt-1 text-[13px] font-medium leading-snug text-slate-100">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* description */}
          <p
            className="anim-stat-in mt-4 text-[13px] leading-relaxed text-slate-300"
            style={{ animationDelay: "480ms" }}
          >
            {body.desc}
          </p>

          {/* fun fact */}
          <div
            className="anim-stat-in mt-4 rounded-r-lg border-l-2 bg-white/[0.04] px-3.5 py-3"
            style={{
              animationDelay: "560ms",
              borderColor: body.color,
            } as CSSProperties}
          >
            <p
              className="font-data text-[10px] uppercase tracking-[0.28em]"
              style={{ color: body.color }}
            >
              冷知识
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300/90">
              {body.funFact}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
