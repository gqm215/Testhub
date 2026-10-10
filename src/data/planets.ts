export interface BodyData {
  id: string;
  name: string;
  english: string;
  category: string;
  isStar?: boolean;
  /** accent color used for UI highlights */
  color: string;
  /** sphere gradient: light → mid → terminator */
  c1: string;
  c2: string;
  c3: string;
  diameter: string;
  distance: string;
  au: string;
  orbitPeriod: string;
  /** real orbital period in Earth days (drives animation speed) */
  orbitDays: number;
  rotation: string;
  moons: string;
  temp: string;
  desc: string;
  funFact: string;
  /** orbit radius in world units (compressed for display) */
  orbitR: number;
  /** display radius in world units */
  size: number;
  startAngle: number;
  hasRings?: boolean;
  bands?: boolean;
}

/** simulated Earth-days that pass per real second at 1× speed */
export const DAYS_PER_SEC = 25;

export const SUN: BodyData = {
  id: "sun",
  name: "太阳",
  english: "Sun",
  category: "恒星 · G型主序星",
  isStar: true,
  color: "#f5c66a",
  c1: "#fff6d8",
  c2: "#ffc24d",
  c3: "#ff8a3c",
  diameter: "1,392,700 km",
  distance: "—（系统中心）",
  au: "0 AU",
  orbitPeriod: "约 2.3 亿年（绕银心）",
  orbitDays: 0,
  rotation: "25–35 天（较差自转）",
  moons: "—",
  temp: "表面约 5,500 °C",
  desc: "太阳是太阳系的中心恒星，占据整个太阳系总质量的 99.86%。它强大的引力支配着八大行星、矮行星与无数小天体的运行轨道。",
  funFact: "太阳每秒钟将约 400 万吨物质转化为纯能量，以光和热的形式辐射向宇宙——其中抵达地球的部分，驱动了我们几乎所有的天气与生命活动。",
  orbitR: 0,
  size: 40,
  startAngle: 0,
};

export const PLANETS: BodyData[] = [
  {
    id: "mercury",
    name: "水星",
    english: "Mercury",
    category: "类地行星",
    color: "#cbb59a",
    c1: "#e3d6bf",
    c2: "#9b8a72",
    c3: "#57493a",
    diameter: "4,879 km",
    distance: "5,790 万 km",
    au: "0.39 AU",
    orbitPeriod: "88 地球日",
    orbitDays: 87.97,
    rotation: "58.6 地球日",
    moons: "0 颗",
    temp: "−173 ~ 427 °C",
    desc: "距离太阳最近、体积最小的行星。它几乎没有大气层保温，表面布满与月球相似的撞击坑，昼夜温差是太阳系中最极端的。",
    funFact: "由于自转极慢而公转极快，水星上的一个「太阳日」（日出到下一次日出）长达 176 个地球日——比它 88 天的一年还要长一倍。",
    orbitR: 150,
    size: 5.5,
    startAngle: 0.9,
  },
  {
    id: "venus",
    name: "金星",
    english: "Venus",
    category: "类地行星",
    color: "#e8bf7a",
    c1: "#f9e3b0",
    c2: "#dca651",
    c3: "#7c5620",
    diameter: "12,104 km",
    distance: "1.082 亿 km",
    au: "0.72 AU",
    orbitPeriod: "224.7 地球日",
    orbitDays: 224.7,
    rotation: "243 地球日（逆向）",
    moons: "0 颗",
    temp: "平均约 464 °C",
    desc: "被浓厚的二氧化碳大气与硫酸云层包裹，失控的温室效应让金星成为太阳系中最炽热的行星——甚至比水星更热。",
    funFact: "金星的自转方向与大多数行星相反：如果你站在金星表面，会看到太阳从西边升起、东边落下。",
    orbitR: 195,
    size: 8.5,
    startAngle: 2.6,
  },
  {
    id: "earth",
    name: "地球",
    english: "Earth",
    category: "类地行星",
    color: "#6ab0f3",
    c1: "#bfe3ff",
    c2: "#3f7fd9",
    c3: "#152f66",
    diameter: "12,756 km",
    distance: "1.496 亿 km",
    au: "1.00 AU",
    orbitPeriod: "365.25 地球日",
    orbitDays: 365.25,
    rotation: "23.9 小时",
    moons: "1 颗（月球）",
    temp: "平均约 15 °C",
    desc: "目前已知唯一孕育生命的行星。表面约 71% 被液态水覆盖，适宜的温度、大气与磁场共同构成了生命的摇篮。",
    funFact: "地球并不是完美的球体——自转产生的离心力让赤道微微鼓起，赤道半径比极半径长约 21 km。",
    orbitR: 240,
    size: 9,
    startAngle: 4.4,
  },
  {
    id: "mars",
    name: "火星",
    english: "Mars",
    category: "类地行星",
    color: "#e0804f",
    c1: "#f5b183",
    c2: "#c65f35",
    c3: "#63280f",
    diameter: "6,792 km",
    distance: "2.279 亿 km",
    au: "1.52 AU",
    orbitPeriod: "687 地球日",
    orbitDays: 686.98,
    rotation: "24.6 小时",
    moons: "2 颗（火卫一、火卫二）",
    temp: "平均约 −63 °C",
    desc: "红色的荒漠世界。氧化铁染红了它的沙丘与峡谷，这里拥有太阳系最高的火山与最长的峡谷系统，是人类深空探测的焦点。",
    funFact: "火星上的奥林帕斯山高约 21.9 km，接近珠穆朗玛峰的三倍，是太阳系已知最高的火山。",
    orbitR: 290,
    size: 7,
    startAngle: 5.6,
  },
  {
    id: "jupiter",
    name: "木星",
    english: "Jupiter",
    category: "气态巨行星",
    color: "#d9a76a",
    c1: "#f2dcb4",
    c2: "#c08a4e",
    c3: "#63421e",
    diameter: "142,984 km",
    distance: "7.786 亿 km",
    au: "5.20 AU",
    orbitPeriod: "11.9 地球年",
    orbitDays: 4332.6,
    rotation: "9.9 小时",
    moons: "95 颗",
    temp: "云顶约 −108 °C",
    desc: "太阳系中体积与质量最大的行星，一颗没有固态表面的气态巨行星。标志性的大红斑是一场已持续数百年的巨型反气旋风暴。",
    funFact: "木星是八大行星中自转最快的——一天不到 10 小时。极速自转让它明显「发福」，赤道直径比两极方向宽出 7%。",
    orbitR: 360,
    size: 22,
    startAngle: 1.6,
    bands: true,
  },
  {
    id: "saturn",
    name: "土星",
    english: "Saturn",
    category: "气态巨行星",
    color: "#e2c584",
    c1: "#f5e5bd",
    c2: "#d3ab66",
    c3: "#6e5428",
    diameter: "120,536 km",
    distance: "14.34 亿 km",
    au: "9.58 AU",
    orbitPeriod: "29.5 地球年",
    orbitDays: 10759,
    rotation: "10.7 小时",
    moons: "146 颗",
    temp: "云顶约 −139 °C",
    desc: "以壮观的环系闻名。光环主体宽约 28 万公里，却薄得惊人——平均厚度仅数十米，由无数冰块与岩屑组成。",
    funFact: "土星的平均密度约 0.69 g/cm³，比水还低。如果宇宙中有一个足够大的水池，土星真的可以浮在水面上。",
    orbitR: 435,
    size: 19,
    startAngle: 3.4,
    hasRings: true,
    bands: true,
  },
  {
    id: "uranus",
    name: "天王星",
    english: "Uranus",
    category: "冰巨行星",
    color: "#8fd5d8",
    c1: "#dff6f4",
    c2: "#6fb9c2",
    c3: "#2a5f68",
    diameter: "51,118 km",
    distance: "28.71 亿 km",
    au: "19.20 AU",
    orbitPeriod: "84 地球年",
    orbitDays: 30687,
    rotation: "17.2 小时（逆向）",
    moons: "28 颗",
    temp: "云顶约 −195 °C",
    desc: "一颗淡青色的冰巨行星，大气中的甲烷吸收了红光。它最奇特之处在于自转轴倾角接近 98°，几乎是「躺着」绕太阳滚动。",
    funFact: "因为近乎横躺的姿态，天王星的每个极点都会经历长达 42 年的白昼，随后是同样漫长的 42 年黑夜。",
    orbitR: 520,
    size: 15,
    startAngle: 0.2,
  },
  {
    id: "neptune",
    name: "海王星",
    english: "Neptune",
    category: "冰巨行星",
    color: "#6f8ce8",
    c1: "#b7c9f5",
    c2: "#4a63cf",
    c3: "#1a2566",
    diameter: "49,528 km",
    distance: "44.95 亿 km",
    au: "30.07 AU",
    orbitPeriod: "164.8 地球年",
    orbitDays: 60190,
    rotation: "16.1 小时",
    moons: "16 颗",
    temp: "云顶约 −201 °C",
    desc: "距离太阳最远的行星，深蓝色大气中翻涌着太阳系最猛烈的风暴。它是第一颗「先由数学计算预言、后被望远镜证实」的行星。",
    funFact: "海王星上的风速可达每小时 2,100 km，约为地球最强台风的六倍——尽管它接收的太阳能量不足地球的千分之一。",
    orbitR: 610,
    size: 14.5,
    startAngle: 4.9,
  },
];

export const BODIES: BodyData[] = [SUN, ...PLANETS];
