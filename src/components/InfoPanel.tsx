import {
  bodyById,
  formatNumber,
  formatPeriod,
  type CelestialBody,
} from "../data/planets";

interface Props {
  selectedId: string | null;
  onClose: () => void;
}

function Stat({
  label,
  value,
  sub,
  delay,
}: {
  label: string;
  value: string;
  sub?: string;
  delay: number;
}) {
  return (
    <div
      className="anim-stat-in rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-[10px] tracking-wider text-white/40">{label}</div>
      <div className="font-data mt-0.5 text-[15px] font-semibold leading-tight text-white">
        {value}
      </div>
      {sub && <div className="font-data text-[10px] text-white/35">{sub}</div>}
    </div>
  );
}

export default function InfoPanel({ selectedId, onClose }: Props) {
  const body: CelestialBody | null = bodyById(selectedId);
  const open = body != null;

  return (
    <aside
      className={`absolute right-4 top-1/2 z-30 w-[330px] max-w-[calc(100vw-2rem)] -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:right-6 ${
        open
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-8 opacity-0"
      }`}
      aria-hidden={!open}
    >
      {body && (
        <div
          key={body.id}
          className="anim-panel-in relative overflow-hidden rounded-xl border border-white/10 bg-[#080d1d]/90 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-md"
        >
          {/* 顶部色彩晕染 */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28"
            style={{
              background: `radial-gradient(120% 130% at 85% 0%, ${body.color}33 0%, transparent 60%)`,
            }}
          />

          <button
            onClick={onClose}
            aria-label="关闭详情面板"
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors duration-200 hover:border-white/30 hover:text-white"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative p-5">
            <div className="flex items-center gap-3.5">
              <div
                className="h-12 w-12 shrink-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 32% 30%, #ffffffcc 0%, ${body.color} 38%, ${body.glow} 100%)`,
                  boxShadow: `0 0 22px ${body.color}88, inset -3px -4px 8px rgba(0,0,0,0.35)`,
                }}
              />
              <div>
                <div className="font-display text-[32px] leading-none text-white">
                  {body.nameZh}
                </div>
                <div className="font-data mt-1 text-[11px] font-medium tracking-[0.3em] text-white/40">
                  {body.nameEn}
                </div>
              </div>
            </div>

            <div
              className="anim-stat-in mt-3 inline-block rounded-full border px-2.5 py-0.5 text-[11px]"
              style={{
                borderColor: `${body.color}55`,
                color: body.color,
                background: `${body.color}14`,
                animationDelay: "60ms",
              }}
            >
              {body.type}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat
                label="直径"
                value={`${formatNumber(body.diameterKm)} km`}
                sub={`≈ ${body.earthRatio >= 1 ? formatNumber(body.earthRatio) : body.earthRatio} × 地球`}
                delay={100}
              />
              <Stat
                label="与太阳距离"
                value={
                  body.distanceMkm != null ? `${formatNumber(body.distanceMkm)} 百万km` : "—"
                }
                sub={body.au != null ? `${body.au} AU` : "系统中心"}
                delay={160}
              />
              <Stat
                label="公转周期"
                value={formatPeriod(body.periodDays)}
                sub={
                  body.periodDays != null && body.periodDays >= 1000
                    ? `${formatNumber(body.periodDays)} 天`
                    : body.periodDays != null
                      ? `${(body.periodDays / 365.25).toFixed(2)} 地球年`
                      : "不绕自身公转"
                }
                delay={220}
              />
              <Stat
                label="自转周期"
                value={body.rotation}
                sub={body.moons != null ? `已知卫星 ${body.moons} 颗` : "等离子体差速自转"}
                delay={280}
              />
            </div>

            <blockquote
              className="anim-stat-in mt-4 border-l-2 pl-3 text-[12.5px] leading-relaxed text-white/65"
              style={{ borderColor: body.color, animationDelay: "340ms" }}
            >
              {body.fact}
            </blockquote>

            <p className="anim-stat-in mt-4 text-right text-[10px] text-white/30" style={{ animationDelay: "400ms" }}>
              数据为近似值 · 仅供教学演示
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
