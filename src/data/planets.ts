export interface CelestialBody {
  id: string;
  nameZh: string;
  nameEn: string;
  type: string;
  /** 直径（km） */
  diameterKm: number;
  /** 与太阳平均距离（百万 km），太阳为 null */
  distanceMkm: number | null;
  /** 天文单位，太阳为 null */
  au: number | null;
  /** 公转周期（地球日），太阳为 null */
  periodDays: number | null;
  /** 自转周期（展示文本） */
  rotation: string;
  /** 已知卫星数，太阳为 null */
  moons: number | null;
  /** 主题色 */
  color: string;
  glow: string;
  fact: string;
  /** 直径约为地球的多少倍 */
  earthRatio: number;
}

export const SUN: CelestialBody = {
  id: "sun",
  nameZh: "太阳",
  nameEn: "SUN",
  type: "恒星 · G 型主序星",
  diameterKm: 1392700,
  distanceMkm: null,
  au: null,
  periodDays: null,
  rotation: "约 27 天（赤道）",
  moons: null,
  color: "#ffc94d",
  glow: "#ff9e2c",
  fact: "太阳占据了整个太阳系总质量的 99.86%，其核心温度高达约 1,500 万摄氏度。",
  earthRatio: 109,
};

export const PLANETS: CelestialBody[] = [
  {
    id: "mercury",
    nameZh: "水星",
    nameEn: "MERCURY",
    type: "类地行星",
    diameterKm: 4879,
    distanceMkm: 57.9,
    au: 0.39,
    periodDays: 88,
    rotation: "58.6 天",
    moons: 0,
    color: "#b8a99a",
    glow: "#8f7f70",
    fact: "水星表面昼夜温差接近 600°C，是太阳系中温差最极端的行星。",
    earthRatio: 0.38,
  },
  {
    id: "venus",
    nameZh: "金星",
    nameEn: "VENUS",
    type: "类地行星",
    diameterKm: 12104,
    distanceMkm: 108.2,
    au: 0.72,
    periodDays: 225,
    rotation: "243 天（逆行）",
    moons: 0,
    color: "#ecc978",
    glow: "#d4a94e",
    fact: "金星自转方向与众行星相反，而且它的一天（243 天）比一年（225 天）还长。",
    earthRatio: 0.95,
  },
  {
    id: "earth",
    nameZh: "地球",
    nameEn: "EARTH",
    type: "类地行星",
    diameterKm: 12756,
    distanceMkm: 149.6,
    au: 1.0,
    periodDays: 365,
    rotation: "23.9 小时",
    moons: 1,
    color: "#4d9de0",
    glow: "#2f6fd0",
    fact: "地球是目前已知唯一孕育生命的星球，表面约 71% 被海洋覆盖。",
    earthRatio: 1,
  },
  {
    id: "mars",
    nameZh: "火星",
    nameEn: "MARS",
    type: "类地行星",
    diameterKm: 6792,
    distanceMkm: 227.9,
    au: 1.52,
    periodDays: 687,
    rotation: "24.6 小时",
    moons: 2,
    color: "#e2694a",
    glow: "#c14e30",
    fact: "火星拥有太阳系最高的山峰——奥林帕斯山，高度约 21.9 公里。",
    earthRatio: 0.53,
  },
  {
    id: "jupiter",
    nameZh: "木星",
    nameEn: "JUPITER",
    type: "气态巨行星",
    diameterKm: 142984,
    distanceMkm: 778.6,
    au: 5.2,
    periodDays: 4333,
    rotation: "9.9 小时",
    moons: 95,
    color: "#d9a066",
    glow: "#b57e45",
    fact: "木星的大红斑是一场已持续至少数百年的巨型风暴，宽度超过地球直径。",
    earthRatio: 11.2,
  },
  {
    id: "saturn",
    nameZh: "土星",
    nameEn: "SATURN",
    type: "气态巨行星",
    diameterKm: 120536,
    distanceMkm: 1433.5,
    au: 9.58,
    periodDays: 10759,
    rotation: "10.7 小时",
    moons: 146,
    color: "#e6c98a",
    glow: "#c9a75e",
    fact: "土星的平均密度低于水——如果有足够大的海洋，它可以浮在水面上。",
    earthRatio: 9.45,
  },
  {
    id: "uranus",
    nameZh: "天王星",
    nameEn: "URANUS",
    type: "冰巨行星",
    diameterKm: 51118,
    distanceMkm: 2872.5,
    au: 19.2,
    periodDays: 30687,
    rotation: "17.2 小时（侧躺）",
    moons: 28,
    color: "#7fd4d9",
    glow: "#4fb3ba",
    fact: "天王星的自转轴倾角约 98°，几乎是“躺”在轨道上绕太阳滚动。",
    earthRatio: 4.0,
  },
  {
    id: "neptune",
    nameZh: "海王星",
    nameEn: "NEPTUNE",
    type: "冰巨行星",
    diameterKm: 49528,
    distanceMkm: 4495.1,
    au: 30.1,
    periodDays: 60190,
    rotation: "16.1 小时",
    moons: 16,
    color: "#5a7fe8",
    glow: "#3c5ec9",
    fact: "海王星上的风速可达每小时 2,100 公里，是太阳系中最猛烈的风暴之地。",
    earthRatio: 3.88,
  },
];

export const BODIES: CelestialBody[] = [SUN, ...PLANETS];

export const bodyById = (id: string | null): CelestialBody | null =>
  BODIES.find((b) => b.id === id) ?? null;

/** 格式化公转周期展示 */
export function formatPeriod(days: number | null): string {
  if (days == null) return "—";
  if (days < 1000) return `${days} 天`;
  return `${(days / 365.25).toFixed(1)} 年`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
