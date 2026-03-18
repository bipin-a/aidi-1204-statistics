export const normalPDF = (x, mu = 0, sig = 1) =>
  (1 / (sig * Math.sqrt(2 * Math.PI))) *
  Math.exp(-0.5 * ((x - mu) / sig) ** 2);
export const erf = (x) => {
  const a = [
    0.254829592,
    -0.284496736,
    1.421413741,
    -1.453152027,
    1.061405429,
  ];
  const p = 0.3275911;

  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);

  const y =
    1 -
    (((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t) *
      Math.exp(-ax * ax);
  return s * y;
};
export const normalCDF = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
export const pFromZ = (z, tail = "two") => {
  const left = normalCDF(z);
  if (tail === "left") return left;
  if (tail === "right") return 1 - left;
  return 2 * Math.min(left, 1 - left);
};
export function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

  z -= 1;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  let x = c[0];
  for (let i = 1; i < 9; i += 1) x += c[i] / (z + i);

  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
export const tPDF = (x, df) =>
  (gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2))) *
  Math.pow(1 + (x * x) / df, -(df + 1) / 2);
export const gen = (fn, a, b, n = 200) => {
  const s = (b - a) / n;
  const r = [];

  for (let x = a; x <= b; x += s) {
    r.push({ x: Math.round(x * 100) / 100, y: fn(x) });
  }

  return r;
};
export function tCDF(x, df) {
  if (df > 200) return normalCDF(x);
  if (x === 0) return 0.5;

  const absX = Math.abs(x);
  const N = 1200;
  const h = absX / N;
  let s = tPDF(0, df) + tPDF(absX, df);
  for (let i = 1; i < N; i += 1) {
    s += (i % 2 === 0 ? 2 : 4) * tPDF(i * h, df);
  }

  const area = (s * h) / 3;
  const cdf = x > 0 ? 0.5 + area : 0.5 - area;
  return Math.max(0, Math.min(1, cdf));
}

export function tCritical(df, alpha = 0.05, tail = "two") {
  const target = tail === "two" ? 1 - alpha / 2 : 1 - alpha;
  let lo = 0;
  let hi = 20;

  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (tCDF(mid, df) < target) lo = mid;
    else hi = mid;
  }

  return (lo + hi) / 2;
}
