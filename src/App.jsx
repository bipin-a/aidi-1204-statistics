import { useState, useEffect } from "react";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ═══════════════════ MATH ═══════════════════ */
const normalPDF = (x, mu = 0, sig = 1) =>
  (1 / (sig * Math.sqrt(2 * Math.PI))) *
  Math.exp(-0.5 * ((x - mu) / sig) ** 2);
const erf = (x) => {
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
const normalCDF = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
const pFromZ = (z, tail = "two") => {
  const left = normalCDF(z);
  if (tail === "left") return left;
  if (tail === "right") return 1 - left;
  return 2 * Math.min(left, 1 - left);
};
function gamma(z) {
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
const tPDF = (x, df) =>
  (gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2))) *
  Math.pow(1 + (x * x) / df, -(df + 1) / 2);
const fPDF = (x, d1, d2) => {
  if (x <= 0) return 0;

  const num = Math.pow(d1 * x, d1) * Math.pow(d2, d2);
  const den = Math.pow(d1 * x + d2, d1 + d2);
  const beta = (gamma(d1 / 2) * gamma(d2 / 2)) / gamma((d1 + d2) / 2);
  return (1 / (x * beta)) * Math.sqrt(num / den);
};
const gen = (fn, a, b, n = 200) => {
  const s = (b - a) / n;
  const r = [];

  for (let x = a; x <= b; x += s) {
    r.push({ x: Math.round(x * 100) / 100, y: fn(x) });
  }

  return r;
};
function tCDF(x, df) {
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
function fCDF(x, d1, d2) {
  if (x <= 1e-6) return 0;

  const N = 1200;
  const lo = 1e-6;
  const h = (x - lo) / N;
  let s = fPDF(lo, d1, d2) + fPDF(x, d1, d2);
  for (let i = 1; i < N; i += 1) {
    s += (i % 2 === 0 ? 2 : 4) * fPDF(lo + i * h, d1, d2);
  }

  return Math.max(0, Math.min(1, (s * h) / 3));
}

/* ═══════════════════ TOKENS ═══════════════════ */
const C = {
  bg: "#FAFAF7",
  card: "#FFF",
  text: "#1a1a1a",
  sub: "#6b6560",
  muted: "#9b9590",
  accent: "#D4572A",
  accentLt: "#FCEEE8",
  blue: "#2E6DA4",
  blueLt: "#E8F0F8",
  green: "#3D7A53",
  greenLt: "#E5F2EA",
  purple: "#6B5B95",
  purpleLt: "#EDEBF4",
  gold: "#B8860B",
  goldLt: "#FEF8E8",
  red: "#B8312F",
  redLt: "#FCEAEA",
  teal: "#1A7A7A",
  tealLt: "#E0F5F5",
  border: "#E8E4DE",
  codeBg: "#F4F1EB",
};

/* ═══════════════════ UI ATOMS ═══════════════════ */
const Pill = ({ c, children }) => (
  <span
    style={{
      display: "inline-block",
      background: c || C.accentLt,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      fontFamily: "var(--m)",
    }}
  >
    {children}
  </span>
);

const SH = ({ n, t, s }) => (
  <div style={{ marginBottom: 24 }}>
    <div
      style={{
        fontFamily: "var(--m)",
        fontSize: 11,
        color: C.accent,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      Part {n}
    </div>
    <h2
      style={{
        fontFamily: "var(--h)",
        fontSize: 28,
        fontWeight: 400,
        color: C.text,
        lineHeight: 1.2,
        margin: 0,
      }}
    >
      {t}
    </h2>
    {s && <p style={{ fontSize: 14, color: C.sub, margin: "6px 0 0" }}>{s}</p>}
    <div
      style={{
        width: 40,
        height: 3,
        background: C.accent,
        marginTop: 12,
        borderRadius: 2,
      }}
    />
  </div>
);

const Card = ({ children, a, bg, style }) => (
  <div
    style={{
      background: bg || C.card,
      border: `1px solid ${C.border}`,
      borderLeft: a ? `4px solid ${a}` : undefined,
      borderRadius: 8,
      padding: "18px 22px",
      marginBottom: 18,
      ...style,
    }}
  >
    {children}
  </div>
);

const CoreCard = ({ title, children, a = C.blue, color, bg = C.blueLt, label = "Key Idea" }) => {
  const accent = color || a;
  return (
    <Card a={accent} bg={bg}>
    <div
      style={{
        fontFamily: "var(--m)",
        fontSize: 11,
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    {title && <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>}
    <div style={{ lineHeight: 1.75 }}>{children}</div>
    </Card>
  );
};

const ConceptCard = ({ title, children, a = C.blue, bg = C.blueLt, label = "How to Read This" }) => (
  <Card a={a} bg={bg}>
    <div
      style={{
        fontFamily: "var(--m)",
        fontSize: 11,
        color: a,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
    <div style={{ lineHeight: 1.75 }}>{children}</div>
  </Card>
);

const TypeTag = ({ children, bg = C.codeBg, color = C.sub }) => (
  <span
    style={{
      display: "inline-block",
      marginLeft: 8,
      padding: "2px 7px",
      borderRadius: 999,
      background: bg,
      color,
      fontSize: 11,
      fontFamily: "var(--m)",
      verticalAlign: "middle",
    }}
  >
    {children}
  </span>
);

const DD = ({ title, children, open: dOpen }) => {
  const [o, sO] = useState(dOpen || false);

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        marginBottom: 14,
        overflow: "hidden",
        background: C.card,
      }}
    >
      <button
        onClick={() => sO(!o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          border: "none",
          background: o ? C.codeBg : "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--m)",
            fontSize: 13,
            color: C.accent,
            transform: o ? "rotate(90deg)" : "none",
            display: "inline-block",
            transition: "transform 0.2s",
          }}
        >
          ▸
        </span>
        <span
          style={{
            fontFamily: "var(--s)",
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
            flex: 1,
          }}
        >
          {title}
        </span>
        <span style={{ fontFamily: "var(--m)", fontSize: 10, color: C.muted }}>
          {o ? "−" : "+"}
        </span>
      </button>

      {o && (
        <div
          style={{
            padding: "14px 18px",
            borderTop: `1px solid ${C.border}`,
            lineHeight: 1.75,
            fontSize: 15,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Confusion drill-down (distinct styling)
const Confusion = ({ title, children }) => {
  const [o, sO] = useState(false);

  return (
    <div
      style={{
        border: `2px dashed ${C.teal}`,
        borderRadius: 8,
        marginBottom: 14,
        overflow: "hidden",
        background: o ? C.tealLt : "transparent",
      }}
    >
      <button
        onClick={() => sO(!o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15 }}>💡</span>
        <span
          style={{
            fontFamily: "var(--s)",
            fontSize: 14,
            fontWeight: 600,
            color: C.teal,
            flex: 1,
          }}
        >
          {title}
        </span>
        <span style={{ fontFamily: "var(--m)", fontSize: 10, color: C.teal }}>
          {o ? "−" : "+"}
        </span>
      </button>

      {o && (
        <div
          style={{
            padding: "14px 18px",
            borderTop: `1px dashed ${C.teal}`,
            lineHeight: 1.75,
            fontSize: 15,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const FB = ({ parts, notes }) => (
  <div
    style={{
      background: C.codeBg,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "16px 18px",
      margin: "14px 0",
      overflowX: "auto",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 4,
        fontSize: 17,
        fontFamily: "var(--m)",
        marginBottom: notes ? 12 : 0,
      }}
    >
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            color: p.c || C.text,
            fontWeight: p.b ? 700 : 400,
            background: p.h || "transparent",
            padding: p.c ? "1px 4px" : 0,
            borderRadius: 3,
            whiteSpace: "nowrap",
          }}
        >
          {p.t}
        </span>
      ))}
    </div>

    {notes && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {notes.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: n.c,
                flexShrink: 0,
              }}
            />
            <span style={{ color: C.sub }}>{n.l}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Formula = ({ children }) => (
  <div
    style={{
      background: C.codeBg,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: "12px 18px",
      fontFamily: "var(--m)",
      fontSize: 14,
      textAlign: "center",
      margin: "14px 0",
      overflowX: "auto",
    }}
  >
    {children}
  </div>
);

const St = ({ n, children }) => (
  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
    <div
      style={{
        minWidth: 26,
        height: 26,
        borderRadius: "50%",
        background: C.accentLt,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: C.accent,
        fontFamily: "var(--m)",
      }}
    >
      {n}
    </div>
    <div style={{ flex: 1, paddingTop: 1, lineHeight: 1.75 }}>{children}</div>
  </div>
);

const DistanceVsAreaCard = ({ statLabel = "z-score", statExample = "2.65" }) => (
  <ConceptCard title="Distance vs area: the two numbers students mix up most">
    <St n="1">
      <strong>{statLabel} = {statExample}</strong>
      <TypeTag bg={C.purpleLt} color={C.purple}>distance</TypeTag>
      <br />
      This is a <strong>location on the x-axis</strong>. It tells you how far the result is from H0.
    </St>

    <St n="2">
      <strong>p-value = shaded tail area</strong>
      <TypeTag bg={C.tealLt} color={C.teal}>probability</TypeTag>
      <br />
      This is an <strong>area under the curve</strong>, not a point on the axis.
    </St>

    <St n="3">
      <strong>alpha = 0.05</strong>
      <TypeTag bg={C.accentLt} color={C.accent}>probability threshold</TypeTag>
      <br />
      Alpha is the <strong>maximum tail area</strong> you are willing to call “just chance.”
    </St>

    <St n="4">
      <strong>y-axis = density</strong>
      <TypeTag>not probability</TypeTag>
      <br />
      Probability comes from the <strong>shaded area</strong>, not from the curve height.
    </St>
  </ConceptCard>
);

const ComparisonCard = ({
  title = "What are we actually comparing?",
  observedLabel = "Sample mean",
  observedValue = "x̄ = 23",
  nullLabel = "Null mean",
  nullValue = "μ0 = 20",
  noiseLabel = "Standard error",
  noiseValue = "SE = 1.131",
  statLine = "z = (23 - 20) / 1.131 = 2.65",
}) => (
  <ConceptCard title={title} a={C.gold} bg={C.goldLt} label="Core Comparison">
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
        <strong>{observedLabel}:</strong> {observedValue}
        <TypeTag bg={C.blueLt} color={C.blue}>observed result</TypeTag>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
        <strong>{nullLabel}:</strong> {nullValue}
        <TypeTag bg={C.purpleLt} color={C.purple}>benchmark from H0</TypeTag>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
        <strong>{noiseLabel}:</strong> {noiseValue}
        <TypeTag bg={C.greenLt} color={C.green}>measuring stick</TypeTag>
      </div>
    </div>

    <Card style={{ background: C.codeBg, marginTop: 12, marginBottom: 0 }}>
      <div style={{ fontFamily: "var(--m)", fontSize: 13.5, textAlign: "center" }}>
        {statLine}
      </div>
    </Card>

    <p style={{ marginTop: 12, marginBottom: 0 }}>
      We test whether the <strong>observed result</strong> is unusually far from the
      <strong> null value</strong>, using the <strong>standard error as the ruler</strong>.
    </p>
  </ConceptCard>
);

const CW = ({ title, children, cap }) => (
  <div style={{ margin: "18px 0" }}>
    {title && (
      <div
        style={{
          fontFamily: "var(--m)",
          fontSize: 11,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
    )}
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 12px 8px" }}>
      {children}
    </div>
    {cap && (
      <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>
        {cap}
      </div>
    )}
  </div>
);

const Sl = ({ label, value, min, max, step, onChange, color, display }) => (
  <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
    <span style={{ color: C.sub }}>{label}: </span>
    <strong style={{ color: color || C.accent, fontSize: 15 }}>{display || value}</strong>
    <input
      type="range"
      min={min}
      max={max}
      step={step || 1}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{ display: "block", width: "100%", marginTop: 2, accentColor: color || C.accent }}
    />
  </label>
);

const CR = ({ items, hl }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit,minmax(110px,1fr))`,
      gap: 8,
      background: hl ? C.greenLt : C.codeBg,
      border: `1px solid ${hl ? C.green : C.border}`,
      borderRadius: 8,
      padding: 12,
      textAlign: "center",
      marginTop: 12,
    }}
  >
    {items.map(([l, v, b], i) => (
      <div key={i}>
        <div style={{ fontFamily: "var(--m)", fontSize: 9.5, color: C.muted, textTransform: "uppercase" }}>{l}</div>
        <div style={{ fontSize: b ? 18 : 15, fontWeight: b ? 700 : 600, color: b ? (hl ? C.green : C.accent) : C.text }}>
          {v}
        </div>
      </div>
    ))}
  </div>
);

const Worked = ({ title, children }) => (
  <Card a={C.blue} bg={C.blueLt}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: title ? 12 : 0 }}>
      <span style={{ fontSize: 14 }}>✎</span>
      <span
        style={{
          fontFamily: "var(--m)",
          fontSize: 11,
          color: C.blue,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Worked Example
      </span>
    </div>
    {title && <div style={{ fontFamily: "var(--h)", fontSize: 18, marginBottom: 10 }}>{title}</div>}
    {children}
  </Card>
);

const Danger = ({ title, children }) => (
  <Card a={C.red} bg={C.redLt}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: title ? 10 : 0 }}>
      <span style={{ fontSize: 14 }}>✗</span>
      <span
        style={{
          fontFamily: "var(--m)",
          fontSize: 11,
          color: C.red,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Wrong Test
      </span>
    </div>
    {title && <div style={{ fontFamily: "var(--h)", fontSize: 18, marginBottom: 10 }}>{title}</div>}
    {children}
  </Card>
);

/* ═══════════════════ CALCULATORS ═══════════════════ */

const SECalc = () => {
  const [n, sN] = useState(16);
  const sigma = 20;
  const se = sigma / Math.sqrt(n);

  const pop = gen((x) => normalPDF(x, 100, sigma), 20, 180, 250);
  const samp = gen((x) => normalPDF(x, 100, se), 20, 180, 250);

  return (
    <div>
      <Sl label="Sample size (n)" value={n} min={2} max={200} onChange={sN} />
      <CR
        items={[
          ["σ", sigma],
          ["√n", Math.sqrt(n).toFixed(2)],
          ["SE = σ/√n", se.toFixed(2), true],
        ]}
      />

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart margin={{ top: 8, right: 15, bottom: 35, left: 10 }}>
          <defs>
            <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.muted} stopOpacity={0.06} />
              <stop offset="100%" stopColor={C.muted} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.18} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />

          <XAxis
            dataKey="x"
            type="number"
            domain={[20, 180]}
            tick={{ fontSize: 10, fill: C.muted }}
            label={{
              value: "Value",
              position: "insideBottom",
              offset: -8,
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <YAxis
            tick={{ fontSize: 10, fill: C.muted }}
            width={35}
            label={{
              value: "Density",
              angle: -90,
              position: "insideLeft",
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <Area
            data={pop}
            dataKey="y"
            stroke={C.muted}
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill="url(#sp)"
            name="Individuals in the population"
            dot={false}
          />

          <Area
            data={samp}
            dataKey="y"
            stroke={C.accent}
            strokeWidth={2.5}
            fill="url(#ss)"
            name={`Sample means (SE = ${se.toFixed(1)})`}
            dot={false}
          />

          <ReferenceLine x={100} stroke={C.muted} strokeDasharray="3 3" />

          <Legend wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 6 }}>
        As <strong>n</strong> increases, the distribution of <strong>sample means</strong> gets narrower.
      </div>

      <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 4, lineHeight: 1.5 }}>
        Gray shows the spread of individual observations. Orange shows the spread of sample means.
      </div>
    </div>
  );
};

const DOFCalc = () => {
  const [df, sD] = useState(4);

  const zD = gen((x) => normalPDF(x), -5, 5);
  const tD = gen((x) => tPDF(x, df), -5, 5);

  return (
    <div>
      <Sl label="Degrees of freedom" value={df} min={1} max={60} onChange={sD} color={C.purple} />

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart margin={{ top: 8, right: 15, bottom: 35, left: 10 }}>
          <defs>
            <linearGradient id="zt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.blue} stopOpacity={0.08} />
              <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.purple} stopOpacity={0.15} />
              <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />

          <XAxis
            dataKey="x"
            type="number"
            domain={[-5, 5]}
            ticks={[-4, -2, 0, 2, 4]}
            tick={{ fontSize: 10, fill: C.muted }}
            label={{
              value: "t or z value",
              position: "insideBottom",
              offset: -8,
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <YAxis
            tick={{ fontSize: 10, fill: C.muted }}
            width={35}
            label={{
              value: "Density",
              angle: -90,
              position: "insideLeft",
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <Area
            data={zD}
            dataKey="y"
            stroke={C.blue}
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#zt)"
            name="Standard normal (Z)"
            dot={false}
          />

          <Area
            data={tD}
            dataKey="y"
            stroke={C.purple}
            strokeWidth={2.5}
            fill="url(#tt)"
            name={`t distribution (df = ${df})`}
            dot={false}
          />

          <Legend wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 6 }}>
        Lower <strong>df</strong> means fatter tails, so for a fixed alpha test, more extreme
        values are needed to reject H0.
      </div>

      <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 4 }}>
        {df <= 5
          ? "Very fat tails — lots of uncertainty."
          : df <= 15
            ? "Noticeably wider than normal."
            : df <= 30
              ? "Almost identical to Z now."
              : "Practically the same as Z."}
      </div>
    </div>
  );
};

const TValueCalc = () => {
  const [tObs, sTObs] = useState(2.1);
  const [df, sDf] = useState(12);
  const [tail, sTail] = useState("two");

  const data = gen((x) => tPDF(x, df), -5, 5, 400);

  const leftArea = tCDF(tObs, df);
  const rightArea = 1 - leftArea;
  const p = tail === "left" ? leftArea : tail === "right" ? rightArea : 2 * Math.min(leftArea, rightArea);

  const shaded = data.map((d) => {
    let area = 0;

    if (tail === "left") {
      area = d.x <= tObs ? d.y : 0;
    } else if (tail === "right") {
      area = d.x >= tObs ? d.y : 0;
    } else {
      area = Math.abs(d.x) >= Math.abs(tObs) ? d.y : 0;
    }

    return { ...d, area, curve: d.y };
  });

  const tailLabel = tail === "left" ? "Left-tailed" : tail === "right" ? "Right-tailed" : "Two-tailed";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Sl
          label="Observed t-score"
          value={tObs}
          min={-4}
          max={4}
          step={0.1}
          onChange={sTObs}
          color={C.purple}
          display={tObs.toFixed(1)}
        />

        <Sl
          label="Degrees of freedom"
          value={df}
          min={1}
          max={60}
          step={1}
          onChange={sDf}
          color={C.gold}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {["left", "right", "two"].map((v) => (
          <button
            key={v}
            onClick={() => sTail(v)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: `2px solid ${tail === v ? C.purple : C.border}`,
              background: tail === v ? C.purpleLt : "transparent",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "var(--m)",
              fontWeight: tail === v ? 700 : 400,
            }}
          >
            {v === "left" ? "Left-tailed" : v === "right" ? "Right-tailed" : "Two-tailed"}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={shaded} margin={{ top: 10, right: 20, bottom: 35, left: 10 }}>
          <defs>
            <linearGradient id="tcurveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.blue} stopOpacity={0.1} />
              <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tareaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.purple} stopOpacity={0.22} />
              <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />

          <XAxis
            dataKey="x"
            type="number"
            domain={[-5, 5]}
            ticks={[-4, -2, 0, 2, 4]}
            tick={{ fontSize: 10, fill: C.muted }}
            label={{
              value: "t-score",
              position: "insideBottom",
              offset: -8,
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <YAxis
            tick={{ fontSize: 10, fill: C.muted }}
            width={35}
            label={{
              value: "Density",
              angle: -90,
              position: "insideLeft",
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <Area
            dataKey="curve"
            stroke={C.blue}
            strokeWidth={1.8}
            fill="url(#tcurveFill)"
            name={`t distribution (df = ${df})`}
            dot={false}
          />

          <Area
            dataKey="area"
            stroke={C.purple}
            strokeWidth={1.8}
            fill="url(#tareaFill)"
            name="p-value area"
            dot={false}
          />

          <ReferenceLine
            x={tObs}
            stroke={C.purple}
            strokeDasharray="5 5"
            label={{
              value: `t = ${tObs.toFixed(1)}`,
              position: "top",
              fill: C.purple,
              fontSize: 11,
            }}
          />

          {tail === "two" && <ReferenceLine x={-tObs} stroke={C.purple} strokeDasharray="5 5" />}
        </AreaChart>
      </ResponsiveContainer>

      <CR
        items={[
          ["Tail", tailLabel],
          ["df", df],
          ["Observed t", <><span>{tObs.toFixed(1)}</span><TypeTag bg={C.purpleLt} color={C.purple}>distance</TypeTag></>, true],
          ["p-value", <><span>{p < 0.001 ? "<0.001" : p.toFixed(4)}</span><TypeTag bg={C.tealLt} color={C.teal}>area</TypeTag></>, true],
          ["Decision", p < 0.05 ? "Reject H0" : "Fail to reject", true],
        ]}
        hl={p < 0.05}
      />

      <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 6 }}>
        Purple shaded area = the p-value for the observed t-score.
      </div>
    </div>
  );
};

const ZTestCalc = () => {
  const [xbar, sX] = useState(23);
  const [mu0, sM] = useState(20);
  const [sigma, sS] = useState(8);
  const [n, sN] = useState(50);
  const [tail, sT] = useState("two");
  const [view, sV] = useState("p");

  const se = sigma / Math.sqrt(n);
  const z = se > 0 ? (xbar - mu0) / se : 0;
  const leftArea = normalCDF(z);
  const rightArea = 1 - leftArea;
  const p = tail === "left" ? leftArea : tail === "right" ? rightArea : 2 * Math.min(leftArea, rightArea);
  const sig = p < 0.05;

  const data = gen((x) => normalPDF(x), -4, 4, 350);
  const isReject = (x) =>
    tail === "two" ? x < -1.96 || x > 1.96 : tail === "right" ? x > 1.645 : x < -1.645;

  const chartData = data.map((d) => {
    let pArea = 0;
    if (tail === "left") {
      pArea = d.x <= z ? d.y : 0;
    } else if (tail === "right") {
      pArea = d.x >= z ? d.y : 0;
    } else {
      pArea = Math.abs(d.x) >= Math.abs(z) ? d.y : 0;
    }

    return {
      ...d,
      keep: !isReject(d.x) ? d.y : 0,
      reject: isReject(d.x) ? d.y : 0,
      pArea,
    };
  });

  const critText = tail === "two" ? "±1.96" : tail === "right" ? "1.645" : "-1.645";
  const tailLabel = tail === "left" ? "Left-tailed" : tail === "right" ? "Right-tailed" : "Two-tailed";
  const xTicks =
    tail === "two"
      ? [-3, -1.96, 0, 1.96, 3]
      : tail === "right"
        ? [-3, 0, 1.645, 3]
        : [-3, -1.645, 0, 3];
  const zAbs = Math.abs(z);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Sl label="Sample mean Xbar" value={xbar} min={0} max={100} onChange={sX} color={C.blue} />

        <Sl label="Hypothesized mu0" value={mu0} min={0} max={100} onChange={sM} color={C.purple} />

        <Sl label="Population sigma" value={sigma} min={1} max={30} onChange={sS} color={C.green} />

        <Sl label="Sample size n" value={n} min={5} max={200} onChange={sN} color={C.gold} />
      </div>

      <div style={{ display: "flex", gap: 6, margin: "10px 0 8px", flexWrap: "wrap" }}>
        {["left", "right", "two"].map((v) => (
          <button
            key={v}
            onClick={() => sT(v)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: `2px solid ${tail === v ? C.accent : C.border}`,
              background: tail === v ? C.accentLt : "transparent",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "var(--m)",
              fontWeight: tail === v ? 700 : 400,
            }}
          >
            {v === "left" ? "Left-tailed" : v === "right" ? "Right-tailed" : "Two-tailed"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, margin: "0 0 10px", flexWrap: "wrap" }}>
        {[
          ["p", "Observed p-value"],
          ["critical", "Critical region"],
          ["both", "Show both"],
        ].map(([v, label]) => (
          <button
            key={v}
            onClick={() => sV(v)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: `2px solid ${view === v ? C.purple : C.border}`,
              background: view === v ? C.purpleLt : "transparent",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "var(--m)",
              fontWeight: view === v ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 35, left: 10 }}>
          <defs>
            <linearGradient id="zAlphaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.16} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="zPAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.purple} stopOpacity={0.22} />
              <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />

          <XAxis
            dataKey="x"
            type="number"
            domain={[-4, 4]}
            ticks={xTicks}
            tick={{ fontSize: 10, fill: C.muted }}
            label={{
              value: "Z-score",
              position: "insideBottom",
              offset: -8,
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <YAxis
            tick={{ fontSize: 10, fill: C.muted }}
            width={35}
            label={{
              value: "Density",
              angle: -90,
              position: "insideLeft",
              style: { fill: C.sub, fontSize: 12 },
            }}
          />

          <Area
            dataKey="y"
            stroke={C.blue}
            strokeWidth={1.8}
            fill="none"
            name="Normal curve"
            dot={false}
          />

          {(view === "critical" || view === "both") && (
            <>
              <Area
                dataKey="keep"
                stroke={C.blue}
                strokeWidth={1.4}
                fill={C.blueLt}
                name="Non-rejection region"
                dot={false}
              />
              <Area
                dataKey="reject"
                stroke={C.accent}
                strokeWidth={1.4}
                fill="url(#zAlphaFill)"
                name="Critical region (alpha)"
                dot={false}
              />
            </>
          )}

          {(view === "p" || view === "both") && (
            <Area
              dataKey="pArea"
              stroke={C.purple}
              strokeWidth={1.8}
              fill="url(#zPAreaFill)"
              name="p-value area"
              dot={false}
            />
          )}

          {(view === "critical" || view === "both") && tail === "two" && (
            <>
              <ReferenceLine x={-1.96} stroke={C.accent} strokeDasharray="5 5" />
              <ReferenceLine x={1.96} stroke={C.accent} strokeDasharray="5 5" />
            </>
          )}

          {(view === "critical" || view === "both") && tail === "right" && (
            <ReferenceLine x={1.645} stroke={C.accent} strokeDasharray="5 5" />
          )}
          {(view === "critical" || view === "both") && tail === "left" && (
            <ReferenceLine x={-1.645} stroke={C.accent} strokeDasharray="5 5" />
          )}

          <ReferenceLine
            x={z}
            stroke={C.purple}
            strokeDasharray="5 5"
            label={{ value: `z = ${z.toFixed(2)}`, position: "top", fill: C.purple, fontSize: 11 }}
          />

          {(view === "p" || view === "both") && tail === "two" && (
            <ReferenceLine x={-zAbs} stroke={C.purple} strokeDasharray="5 5" />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 6 }}>
        {view === "p" && "Purple area = the p-value for your observed z-score."}
        {view === "critical" && "Orange area = the rejection region at alpha = 0.05."}
        {view === "both" && "Purple shows the observed p-value. Orange shows the alpha cutoff region."}
      </div>

      <CR
        items={[
          ["Tail", tailLabel],
          ["SE", se.toFixed(3)],
          ["Observed z", <><span>{z.toFixed(3)}</span><TypeTag bg={C.purpleLt} color={C.purple}>distance</TypeTag></>, true],
          ["p-value", <><span>{p < 0.001 ? "<0.001" : p.toFixed(4)}</span><TypeTag bg={C.tealLt} color={C.teal}>area</TypeTag></>, true],
          ["alpha", <><span>0.05</span><TypeTag bg={C.accentLt} color={C.accent}>area threshold</TypeTag></>],
          ["Critical z", critText],
          ["Decision", sig ? "Reject H0" : "Fail to reject", true],
        ]}
        hl={sig}
      />

      <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 4, lineHeight: 1.5 }}>
        Same decision either way: crossing the critical cutoff matches <strong>p &lt; alpha</strong>.
      </div>
    </div>
  );
};

const ABCalc = () => {
  const [nA, sNA] = useState(1000);
  const [cA, sCA] = useState(120);
  const [nB, sNB] = useState(1000);
  const [cB, sCB] = useState(148);

  const pA = cA / nA;
  const pB = cB / nB;
  const pool = (cA + cB) / (nA + nB);
  const se = Math.sqrt(pool * (1 - pool) * (1 / nA + 1 / nB));
  const z = se > 0 ? (pB - pA) / se : 0;
  const p = pFromZ(z);
  const sig = p < 0.05;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: C.blueLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 10, color: C.blue, marginBottom: 6 }}>CONTROL (A)</div>
          <Sl label="Visitors" value={nA} min={50} max={5000} step={50} onChange={(v) => { sNA(v); sCA(Math.min(cA, v)); }} color={C.blue} />

          <Sl label="Conversions" value={cA} min={0} max={nA} onChange={sCA} color={C.blue} display={`${cA} (${(pA * 100).toFixed(1)}%)`} />
        </div>

        <div style={{ background: C.accentLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 10, color: C.accent, marginBottom: 6 }}>VARIANT (B)</div>
          <Sl label="Visitors" value={nB} min={50} max={5000} step={50} onChange={(v) => { sNB(v); sCB(Math.min(cB, v)); }} color={C.accent} />

          <Sl label="Conversions" value={cB} min={0} max={nB} onChange={sCB} color={C.accent} display={`${cB} (${(pB * 100).toFixed(1)}%)`} />
        </div>
      </div>
      <CR items={[["Pooled p", pool.toFixed(4)], ["SE", se.toFixed(4)], ["Z", z.toFixed(3), true], ["p-value", p.toFixed(4), true], ["Verdict", sig ? "Significant" : "Not sig.", true]]} hl={sig} />
    </div>
  );
};

const OneTCalc = () => {
  const [xbar, sX] = useState(105);
  const [mu0, sM] = useState(100);
  const [s, sS] = useState(15);
  const [n, sN] = useState(25);

  const se = s / Math.sqrt(n);
  const t = se > 0 ? (xbar - mu0) / se : 0;
  const df = n - 1;
  const pV = 2 * (1 - tCDF(Math.abs(t), df));
  const sig = pV < 0.05;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Sl label="Sample mean Xbar" value={xbar} min={50} max={150} onChange={sX} color={C.blue} />
        <Sl label="Hypothesized mu0" value={mu0} min={50} max={150} onChange={sM} color={C.purple} />
        <Sl label="Sample SD (s)" value={s} min={1} max={40} onChange={sS} color={C.green} />
        <Sl label="Sample size n" value={n} min={3} max={100} onChange={sN} color={C.gold} />
      </div>
      <CR items={[["SE", se.toFixed(3)], ["df", df], ["t", t.toFixed(3), true], ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true], ["Result", sig ? "Reject H0" : "Fail to reject", true]]} hl={sig} />
    </div>
  );
};

const TwoTCalc = () => {
  const [x1, sX1] = useState(82);
  const [s1, sS1] = useState(10);
  const [n1, sN1] = useState(30);

  const [x2, sX2] = useState(78);
  const [s2, sS2] = useState(12);
  const [n2, sN2] = useState(30);

  const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);
  const t = se > 0 ? (x1 - x2) / se : 0;

  const dfN = Math.pow((s1 * s1) / n1 + (s2 * s2) / n2, 2);
  const dfD = Math.pow((s1 * s1) / n1, 2) / (n1 - 1) + Math.pow((s2 * s2) / n2, 2) / (n2 - 1);
  const dfExact = dfD > 0 ? dfN / dfD : 1;
  const df = Math.round(dfExact);

  const pV = 2 * (1 - tCDF(Math.abs(t), dfExact));
  const sig = pV < 0.05;
  const cd = Math.abs(x1 - x2) / Math.sqrt((s1 * s1 + s2 * s2) / 2);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: C.blueLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 10, color: C.blue }}>GROUP 1</div>

          <Sl label="Mean" value={x1} min={40} max={120} onChange={sX1} color={C.blue} />
          <Sl label="SD" value={s1} min={1} max={30} onChange={sS1} color={C.blue} />
          <Sl label="n" value={n1} min={3} max={100} onChange={sN1} color={C.blue} />
        </div>

        <div style={{ background: C.accentLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 10, color: C.accent }}>GROUP 2</div>

          <Sl label="Mean" value={x2} min={40} max={120} onChange={sX2} color={C.accent} />
          <Sl label="SD" value={s2} min={1} max={30} onChange={sS2} color={C.accent} />
          <Sl label="n" value={n2} min={3} max={100} onChange={sN2} color={C.accent} />
        </div>
      </div>
      <CR items={[["SE", se.toFixed(3)], ["df", df], ["t", t.toFixed(3), true], ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true], ["Cohen's d", cd.toFixed(2)], ["Result", sig ? "Reject H0" : "Fail to reject", true]]} hl={sig} />
    </div>
  );
};

const PairedTCalc = () => {
  const [dbar, sD] = useState(2.5);
  const [sd, sSd] = useState(1.6);
  const [n, sN] = useState(10);

  const se = sd / Math.sqrt(n);
  const t = se > 0 ? dbar / se : 0;
  const df = n - 1;
  const pV = 2 * (1 - tCDF(Math.abs(t), df));
  const sig = pV < 0.05;

  return (
    <div>
      <Sl label="Mean difference (dbar)" value={dbar} min={-10} max={10} step={0.1} onChange={sD} color={C.blue} display={dbar.toFixed(1)} />

      <Sl label="SD of differences" value={sd} min={0.1} max={15} step={0.1} onChange={sSd} color={C.purple} display={sd.toFixed(1)} />

      <Sl label="Number of pairs" value={n} min={3} max={50} onChange={sN} color={C.green} />

      <CR items={[["SE", se.toFixed(3)], ["df", df], ["t", t.toFixed(3), true], ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true], ["Result", sig ? "Reject H0" : "Fail to reject", true]]} hl={sig} />
    </div>
  );
};

const FCalc = () => {
  const [d1, sD1] = useState(3);
  const [d2, sD2] = useState(15);

  const data = gen((x) => fPDF(x, d1, d2), 0.01, 5.5, 200);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Sl label="df1 (numerator)" value={d1} min={1} max={20} onChange={sD1} />
        <Sl label="df2 (denominator)" value={d2} min={2} max={50} onChange={sD2} color={C.gold} />
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 15, bottom: 15, left: 5 }}>
          <defs>
            <linearGradient id="ff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.18} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="x" type="number" domain={[0, 5.5]} tick={{ fontSize: 10, fill: C.muted }} />
          <YAxis tick={{ fontSize: 10, fill: C.muted }} width={30} />

          <Area dataKey="y" stroke={C.accent} strokeWidth={2.5} fill="url(#ff)" name={`F(${d1},${d2})`} dot={false} />

          <ReferenceLine x={1} stroke={C.muted} strokeDasharray="5 5" />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const ANOVACalc = () => {
  const [m1, sM1] = useState(72);
  const [m2, sM2] = useState(78);
  const [m3, sM3] = useState(85);

  const [v1, sV1] = useState(64);
  const [v2, sV2] = useState(81);
  const [v3, sV3] = useState(49);

  const [ng, sNG] = useState(10);

  const gm = (m1 + m2 + m3) / 3;
  const ssB = ng * ((m1 - gm) ** 2 + (m2 - gm) ** 2 + (m3 - gm) ** 2);
  const ssW = (ng - 1) * (v1 + v2 + v3);

  const msB = ssB / 2;
  const msW = ssW / (3 * ng - 3);
  const f = msW > 0 ? msB / msW : 0;
  const pV = 1 - fCDF(f, 2, 3 * ng - 3);
  const sig = pV < 0.05;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[[m1, sM1, v1, sV1, C.blue, "1"], [m2, sM2, v2, sV2, C.purple, "2"], [m3, sM3, v3, sV3, C.accent, "3"]].map(([m, sm, v, sv, c, l]) => (
          <div key={l} style={{ background: c === C.blue ? C.blueLt : c === C.purple ? C.purpleLt : C.accentLt, borderRadius: 8, padding: 10 }}>
            <div style={{ fontFamily: "var(--m)", fontSize: 10, color: c }}>GROUP {l}</div>
            <Sl label="Mean" value={m} min={50} max={100} onChange={sm} color={c} />
            <Sl label="Var" value={v} min={10} max={200} onChange={sv} color={c} />
          </div>
        ))}
      </div>
      <Sl label="n per group" value={ng} min={5} max={50} onChange={sNG} color={C.gold} />

      <CR items={[["Grand mean", gm.toFixed(1)], ["SS_between", ssB.toFixed(0)], ["SS_within", ssW.toFixed(0)], ["F", f.toFixed(2), true], ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true], ["Result", sig ? "Reject H0" : "Fail to reject", true]]} hl={sig} />
    </div>
  );
};

const IntCalc = () => {
  const [a1b1, s11] = useState(120);
  const [a1b2, s12] = useState(60);
  const [a2b1, s21] = useState(90);
  const [a2b2, s22] = useState(85);

  const data = [{ x: "Urban", A: a1b1, B: a2b1 }, { x: "Rural", A: a1b2, B: a2b2 }];

  const cross = (a1b1 > a2b1) !== (a1b2 > a2b2);
  const slopeA = a1b2 - a1b1;
  const slopeB = a2b2 - a2b1;
  const interaction = Math.abs(slopeA - slopeB) > 1e-9;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: C.accentLt, borderRadius: 8, padding: 10 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 10, color: C.accent }}>STRATEGY A</div>
          <Sl label="Urban" value={a1b1} min={20} max={200} onChange={s11} color={C.accent} />
          <Sl label="Rural" value={a1b2} min={20} max={200} onChange={s12} color={C.accent} />
        </div>

        <div style={{ background: C.blueLt, borderRadius: 8, padding: 10 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 10, color: C.blue }}>STRATEGY B</div>
          <Sl label="Urban" value={a2b1} min={20} max={200} onChange={s21} color={C.blue} />
          <Sl label="Rural" value={a2b2} min={20} max={200} onChange={s22} color={C.blue} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 25, bottom: 15, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="x" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 10, fill: C.muted }} width={35} />

          <Line dataKey="A" stroke={C.accent} strokeWidth={3} dot={{ r: 5, fill: C.accent }} name="Strategy A" />

          <Line dataKey="B" stroke={C.blue} strokeWidth={3} dot={{ r: 5, fill: C.blue }} name="Strategy B" />

          <Legend wrapperStyle={{ fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ textAlign: "center", fontSize: 13, marginTop: 4, color: interaction ? C.red : C.green, fontWeight: 600 }}>
        {!interaction
          ? "Parallel lines → No interaction."
          : cross
            ? "Lines cross → Interaction! Best strategy depends on market."
            : "Non-parallel lines → Interaction, even without crossing."}
      </div>
    </div>
  );
};

/* ═══════════════════ NAV ═══════════════════ */
const secs = [
  { id: "overview", l: "Overview" },
  { id: "datatypes", l: "Your Data Type" },
  { id: "foundations", l: "Foundations" },
  { id: "z-test", l: "Z-Test" },
  { id: "ab-test", l: "A/B Testing" },
  { id: "t-dist", l: "t-Distribution" },
  { id: "t-tests", l: "t-Tests" },
  { id: "wrong-test", l: "Wrong Test" },
  { id: "f-dist", l: "F-Distribution" },
  { id: "anova", l: "One-Way ANOVA" },
  { id: "two-way", l: "Two-Way ANOVA" },
  { id: "assumptions", l: "Assumptions" },
  { id: "beyond-p", l: "Beyond p-Values" },
  { id: "decision", l: "Decision Guide" },
];

/* ═══════════════════ APP ═══════════════════ */
export default function App() {
  const [active, setA] = useState("overview");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        const v = es.filter((e) => e.isIntersecting);
        if (v.length) setA(v[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    secs.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        "--h": "'DM Serif Display', Georgia, serif",
        "--s": "'DM Sans', system-ui, sans-serif",
        "--m": "'JetBrains Mono', monospace",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
      .tutorial-nav{position:fixed;top:0;left:0;width:195px;height:100vh;background:${C.card};border-right:1px solid ${C.border};padding:20px 0;overflow-y:auto;z-index:999}
      .tutorial-main{margin-left:195px;padding:36px 38px 80px;max-width:760px;font-family:var(--s);font-size:15.5px;line-height:1.75;color:${C.text}}
      @media (max-width: 900px){
        .tutorial-nav{position:sticky;width:100%;height:auto;max-height:45vh;border-right:none;border-bottom:1px solid ${C.border}}
        .tutorial-main{margin-left:0;padding:20px 16px 60px;max-width:none}
      }`}</style>

      <nav className="tutorial-nav">
        <div
          style={{
            padding: "0 14px 16px",
            fontFamily: "var(--h)",
            fontSize: 15,
            color: C.accent,
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 10,
          }}
        >
          Hypothesis Testing
        </div>

        {secs.map((s) => (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "6px 14px",
              border: "none",
              cursor: "pointer",
              background: active === s.id ? C.accentLt : "transparent",
              color: active === s.id ? C.accent : C.muted,
              fontWeight: active === s.id ? 600 : 400,
              fontFamily: "var(--m)",
              fontSize: 11,
              borderLeft: active === s.id ? `3px solid ${C.accent}` : "3px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {s.l}
          </button>
        ))}
      </nav>

      <main className="tutorial-main">
        <section id="overview">
          <div style={{ marginBottom: 44 }}>
            <Pill c={C.greenLt}>Interactive Tutorial</Pill>

            <h1 style={{ fontFamily: "var(--h)", fontSize: 34, fontWeight: 400, lineHeight: 1.15, margin: "12px 0 8px" }}>Hypothesis Testing</h1>

            <p style={{ fontSize: 16, color: C.sub, margin: 0 }}>From Z-Tests to A/B Testing to Two-Way ANOVA</p>

            <div style={{ marginTop: 14, padding: "10px 14px", background: C.codeBg, borderRadius: 8, fontSize: 13, color: C.sub }}>
              <strong style={{ color: C.text }}>Prerequisite:</strong> You know the Central Limit Theorem - sample means are roughly normally distributed for large n.
            </div>
          </div>

          <SH n="0" t="The Big Picture" />

          <p>
            Every test asks: <strong>"Is this real, or just noise?"</strong>
          </p>

          <FB parts={[{ t: "Test Stat", c: C.accent, b: true }, { t: "=" }, { t: "(What I saw", c: C.blue }, { t: "-" }, { t: "Expected)", c: C.purple }, { t: "/" }, { t: "Noise", c: C.green }]} notes={[{ c: C.blue, l: "Your sample result" }, { c: C.purple, l: "What H0 predicts" }, { c: C.green, l: "Standard error" }]} />
          <p>
            Big ratio → surprising → probably real.
            <br />
            Small ratio → ordinary → probably noise.
          </p>

          <Confusion title="Confusion: What are Type I and Type II errors?">
            <p>
              <strong>Type I error (false positive):</strong> You reject H0 when it's actually true. You "find" an effect that isn't there. The probability of this is alpha (usually 0.05).
            </p>

            <p>
              <strong>Type II error (false negative):</strong> You fail to reject H0 when it's actually false. You miss a real effect. The probability of this is beta.
            </p>

            <p>
              <strong>Power = 1 - beta</strong> = the probability of correctly detecting a real effect.
            </p>

            <p>
              <strong>The tradeoff:</strong> Making alpha smaller (harder to reject H0) reduces false positives but increases false negatives. You can't minimize both without more data.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div style={{ background: C.redLt, borderRadius: 6, padding: 10, fontSize: 13 }}>
                <strong>Type I:</strong> Convicting an innocent person. alpha controls this.
              </div>

              <div style={{ background: C.goldLt, borderRadius: 6, padding: 10, fontSize: 13 }}>
                <strong>Type II:</strong> Letting a guilty person go free. Power controls this.
              </div>
            </div>
          </Confusion>
        </section>

        <section id="datatypes" style={{ marginTop: 52 }}>
          <SH n="1" t="What Distribution Does My Data Come From?" s="This decides which test to use" />

          <p>
            The single most important question before picking a test: <strong>is each observation a number or a yes/no?</strong>
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0" }}>
            <Card a={C.blue} bg={C.blueLt}>
              <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.blue, marginBottom: 6 }}>CONTINUOUS DATA</div>

              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Each observation is a number on a scale.</p>

              <p style={{ margin: "0 0 6px", fontSize: 14 }}>Heights, weights, test scores, blood pressure, reaction times, revenue amounts.</p>

              <p style={{ margin: 0, fontSize: 14 }}>The underlying distribution can be anything - normal, skewed, bimodal. The CLT makes the <em>sample mean</em> normal.</p>

              <div style={{ marginTop: 10, fontFamily: "var(--m)", fontSize: 12, color: C.blue }}>→ Z-test, t-test, ANOVA</div>
            </Card>
            <Card a={C.accent} bg={C.accentLt}>
              <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.accent, marginBottom: 6 }}>BINARY DATA (BERNOULLI)</div>

              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Each observation is yes or no.</p>

              <p style={{ margin: "0 0 6px", fontSize: 14 }}>Clicked or didn't. Bought or didn't. Cured or not. Passed or failed.</p>

              <p style={{ margin: 0, fontSize: 14 }}>Each observation is a Bernoulli trial with probability p. The conversion rate is the mean of many coin flips.</p>

              <div style={{ marginTop: 10, fontFamily: "var(--m)", fontSize: 12, color: C.accent }}>→ Z-test for proportions (A/B test)</div>
            </Card>
          </div>

          <CoreCard title="Why this changes the test you use" a={C.gold} bg={C.goldLt}>
            <p>
              <strong>Continuous data:</strong> you usually do not know the population standard deviation sigma,
              so you estimate it with <em>s</em>. That extra uncertainty leads to t-based methods.
            </p>

            <p>
              <strong>Binary data:</strong> for proportions, large-sample test statistics are approximately normal,
              so z-based methods are used.
            </p>

            <p style={{ marginBottom: 0 }}>
              That is why A/B tests are usually z-based, while many mean comparisons are t-based.
            </p>
          </CoreCard>

          <Confusion title="Confusion: 'Don't all tests assume normal data?'">
            <p>
              <strong>No.</strong> The tests assume the <em>test statistic</em> is approximately normal (or t, or F). That's different from the raw data being normal.
            </p>

            <p>The CLT is the bridge. It says: no matter what the individual data looks like, the <em>average</em> of enough observations is approximately normal.</p>

            <p>So your data can be skewed, bimodal, or Bernoulli. As long as n is large enough, the sample mean (or proportion) is approximately normal, and the test works.</p>

            <p>
              <strong>Exception:</strong> Small samples (n &lt; 15) with very skewed data. Here the CLT hasn't kicked in. Use non-parametric tests instead.
            </p>
          </Confusion>

          <Card style={{ background: C.codeBg }}>
            <div style={{ fontFamily: "var(--m)", fontSize: 12.5, lineHeight: 2, whiteSpace: "pre-wrap" }}>{`Your data

|

|- Binary (yes/no) ---- Bernoulli ---- Z-test for proportions

|                                       (A/B testing)

|

|- Continuous (number) -- Could be any shape

                          |

                          |- sigma known ---- Z-test

                          |- sigma unknown -- t-test or ANOVA`}</div>
          </Card>
        </section>

        <section id="foundations" style={{ marginTop: 52 }}>
          <SH n="2" t="Standard Error & Degrees of Freedom" s="Two building blocks every test uses" />

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>Standard Error (SE)</h3>

          <p>How much would the sample mean jump around if you repeated the study?</p>

          <FB parts={[{ t: "SE", c: C.accent, b: true }, { t: "=" }, { t: "sigma", c: C.blue, b: true }, { t: "/" }, { t: "sqrt(n)", c: C.green, b: true }]} notes={[{ c: C.blue, l: "sigma - spread of individuals" }, { c: C.green, l: "sqrt(n) - more data = less noise" }, { c: C.accent, l: "SE - spread of sample means" }]} />
          <p>More data → smaller SE → easier to spot real effects.</p>

          <DD title="Why sqrt(n)? (Diminishing returns)">
            <p>Errors partly cancel when you average. The cancellation follows a square-root law.</p>

            <p>To cut noise in half, you need 4x the data. To halve again, 16x. Diminishing returns.</p>
          </DD>

          <CW title="Live: Watch SE shrink as n grows">
            <SECalc />
          </CW>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "24px 0 8px" }}>Degrees of Freedom (df)</h3>

          <p>How many independent pieces of information are left after estimating something.</p>

          <p>4 friends, 4 chairs. First 3 pick freely. The 4th has no choice. df = 3.</p>

          <p>Compute a mean from n values. Once you know the mean and n-1 values, the last is locked. df = n-1.</p>

          <CoreCard title="Why degrees of freedom matter" a={C.purple} bg={C.purpleLt}>
            <p>Low df means fatter tails, so stronger evidence is needed to reject H0.</p>
            <p>High df means the t-distribution gets closer to the normal distribution.</p>
            <p style={{ marginBottom: 0 }}>
              So the same test statistic can lead to a different p-value depending on df.
            </p>
          </CoreCard>

          <CW title="Live: How df shapes the t-distribution">
            <DOFCalc />
          </CW>
        </section>

        <section id="z-test" style={{ marginTop: 52 }}>
          <SH n="3" t="Z-Test" s="The normal-distribution version of hypothesis testing (when σ is known)" />

          <p>
            Use a <strong>z-test</strong> when the population standard deviation <strong>σ</strong> is known.
            In practice this is uncommon for means, but common for large-sample proportion tests.
          </p>

          <FB
            parts={[
              { t: "Z", c: C.accent, b: true },
              { t: "= (" },
              { t: "Xbar", c: C.blue, b: true },
              { t: "-" },
              { t: "mu0", c: C.purple, b: true },
              { t: ") / (" },
              { t: "sigma / sqrt(n)", c: C.green, b: true },
              { t: ")" },
            ]}
            notes={[
              { c: C.blue, l: "Observed sample mean" },
              { c: C.purple, l: "Null benchmark" },
              { c: C.green, l: "Standard error (known σ)" },
            ]}
          />

          <p>
            A z-score tells you how far your result is from the null value, measured in
            <strong> standard errors</strong>.
          </p>

          <Card style={{ background: C.codeBg }}>
            <p style={{ margin: 0 }}>
              <strong>Z = 0</strong> means the sample matches the null exactly.
              <strong> |Z| ≈ 2</strong> means the result is unusual.
              For a two-sided test, about <strong>95%</strong> of z-scores lie between
              <strong> -1.96 and +1.96</strong>, so values beyond that are in the most extreme 5%.
            </p>
          </Card>

          <CoreCard title="Z vs t: the real distinction" a={C.accent} bg={C.accentLt}>
            <p>
              The main question is not “large sample or small sample?” The main question is:
              <strong> do you know the population standard deviation σ?</strong>
            </p>
            <p>
              If <strong>σ is known</strong>, use a z-test. If <strong>σ is unknown</strong> and must be
              estimated from the sample, use a t-test.
            </p>
            <p style={{ marginBottom: 0 }}>
              Sample size still matters because the t-distribution gets closer to the normal distribution as n grows.
            </p>
          </CoreCard>

          <Card style={{ background: C.codeBg }}>
            <p style={{ margin: "0 0 8px" }}>
              Z-tests can be used for one-sample means, two-sample means when population variances are known,
              and proportion tests.
            </p>
            <p style={{ margin: 0 }}>
              You can make the decision either by comparing your statistic to a <strong>critical value</strong>
              or by using a <strong>p-value</strong>. When done correctly, both methods agree.
            </p>
          </Card>

          <DD title="One-tailed vs. two-tailed">
            <p>
              <strong>Two-tailed:</strong> “Is it different?” Use this when you care about either direction.
            </p>
            <p>
              <strong>Left-tailed:</strong> “Is it smaller?”
            </p>
            <p>
              <strong>Right-tailed:</strong> “Is it larger?”
            </p>
            <p style={{ marginBottom: 0 }}>
              Pick the direction <strong>before</strong> seeing the data. If unsure, use a two-tailed test.
            </p>
          </DD>

          <CoreCard title="From z-score to p-value" a={C.blue} bg={C.blueLt}>
            <St n="1">Compute <strong>z = (observed - expected) / SE</strong>.</St>
            <St n="2">Use a z-table or calculator to find the <strong>area to the left</strong> of z.</St>
            <St n="3">
              Convert that area to the correct tail probability:
              <br />
              Left-tailed: <strong>p = left area</strong>
              <br />
              Right-tailed: <strong>p = 1 - left area</strong>
              <br />
              Two-tailed: <strong>p = 2 × smaller tail area</strong>
            </St>
            <St n="4">Compare p to alpha and decide whether to reject H0.</St>
          </CoreCard>

          <CoreCard title="What is the difference between z, t, and p?" a={C.teal} bg={C.tealLt}>
            <St n="1">
              <strong>z or t:</strong> how far the data are from the null, measured in standard errors.
            </St>
            <St n="2">
              <strong>p-value:</strong> the probability of seeing a result at least that extreme if H0 were true.
            </St>
            <St n="3">
              The same score can map to a different p-value if the reference distribution changes.
            </St>
          </CoreCard>

          <Worked title="Hospital Wait Times">
            <p>Claim: avg = 20 min. Sample: n = 50, mean = 23. σ = 8. α = 0.05, two-tailed.</p>

            <St n="1">
              <strong>Set hypotheses:</strong> H0: μ = 20, H1: μ ≠ 20.
            </St>
            <St n="2">
              <strong>Compute the standard error:</strong> SE = 8 / √50 = <strong>1.131</strong>
            </St>
            <St n="3">
              <strong>Compute the z-score:</strong> Z = (23 - 20) / 1.131 = <strong>2.65</strong>
            </St>
            <St n="4">
              <strong>Decision:</strong> p = 0.008 → <strong>Reject H0.</strong> The average wait time is significantly different from 20 minutes.
            </St>
          </Worked>

          <ComparisonCard
            observedLabel="Sample mean"
            observedValue="x̄ = 23"
            nullLabel="Null mean"
            nullValue="μ0 = 20"
            noiseLabel="Standard error"
            noiseValue="SE = 8 / √50 = 1.131"
            statLine="z = (23 - 20) / 1.131 = 2.65"
          />

          <Card style={{ background: C.codeBg }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>
              From z = 2.65 to p = 0.008
            </div>

            <p style={{ fontSize: 14, marginTop: 0 }}>
              A z-table is the manual version of what the calculator does automatically.
              Most z-tables show the <strong>cumulative area to the left</strong> of a z-score.
            </p>

            <div
              style={{
                overflowX: "auto",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                margin: "14px 0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  fontFamily: "var(--m)",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.accent}`, background: C.codeBg }}>
                    <th style={{ padding: 8, color: C.muted, borderRight: `1px solid ${C.border}` }}>Z</th>
                    <th style={{ padding: 8 }}>0.04</th>
                    <th style={{ padding: 8, color: C.accent, background: C.accentLt }}>0.05</th>
                    <th style={{ padding: 8 }}>0.06</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: 8, fontWeight: "bold", borderRight: `1px solid ${C.border}` }}>2.5</td>
                    <td>0.9945</td>
                    <td style={{ background: C.accentLt }}>0.9946</td>
                    <td>0.9948</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.accentLt }}>
                    <td
                      style={{
                        padding: 8,
                        fontWeight: "bold",
                        color: C.accent,
                        borderRight: `1px solid ${C.border}`,
                      }}
                    >
                      2.6
                    </td>
                    <td>0.9959</td>
                    <td style={{ fontWeight: "bold", color: "#fff", background: C.accent }}>0.9960</td>
                    <td>0.9961</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, fontWeight: "bold", borderRight: `1px solid ${C.border}` }}>2.7</td>
                    <td>0.9969</td>
                    <td style={{ background: C.accentLt }}>0.9970</td>
                    <td>0.9971</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ConceptCard title="How to read a z-table entry" a={C.teal} bg={C.tealLt} label="Z-Table">
              <St n="1">
                Look up <strong>2.65</strong> using row <strong>2.6</strong> and column <strong>0.05</strong>.
              </St>
              <St n="2">
                The entry <strong>0.9960</strong> means:
                <br />
                <strong>P(Z ≤ 2.65) = 0.9960</strong>
              </St>
              <St n="3">
                In plain English: <strong>99.60% of the normal curve lies to the left of z = 2.65.</strong>
              </St>
              <St n="4">
                For a two-tailed test, first find the right tail:
                <strong> 1 - 0.9960 = 0.0040</strong>,
                then double it:
                <strong> p = 0.0080</strong>.
              </St>
            </ConceptCard>
          </Card>

          <DistanceVsAreaCard statLabel="z-score" statExample="2.65" />

          <DD title="What is Phi? (Optional notation)">
            <p>Statisticians often write the left-tail area as:</p>
            <Card style={{ background: C.codeBg }}>
              <div style={{ fontFamily: "var(--m)", fontSize: 14, textAlign: "center", lineHeight: 1.9 }}>
                Phi(z) = P(Z ≤ z)
              </div>
            </Card>
            <p>
              So <strong>Phi(2.65) = 0.9960</strong> means 99.60% of the standard normal curve lies to the left of 2.65.
            </p>
            <p style={{ marginBottom: 0 }}>
              You do <strong>not</strong> need Phi notation to do hypothesis tests. It is just compact notation for “left-tail area.”
            </p>
          </DD>

          <Confusion title="Confusion: 'p-value = probability H0 is true'">
            <p>
              The p-value is <strong>not</strong> the probability that H0 is true.
            </p>
            <p>
              It is the probability of seeing data <em>this extreme or more</em>, <strong>assuming H0 is true</strong>.
            </p>
            <p>
              So <strong>p = 0.03</strong> means: “If H0 were true, there would be a 3% chance of getting a result this extreme.”
            </p>
          </Confusion>

          <DD title="Why do we say 'fail to reject' instead of 'accept H0'?">
            <p>
              Not finding strong evidence against H0 is not the same as proving H0 is true.
            </p>
            <p>
              With noisy data or small samples, real effects can be missed. That is why we say
              <strong> fail to reject</strong>, not <strong>accept</strong>.
            </p>
            <p style={{ marginBottom: 0 }}>
              Confidence intervals help here: a wide interval means many effect sizes are still plausible.
            </p>
          </DD>

          <CW title="Live: Z-Test Calculator + Visualization">
            <ZTestCalc />
          </CW>
        </section>

        <section id="ab-test" style={{ marginTop: 52 }}>
          <SH n="4" t="A/B Testing" s="Comparing two conversion rates" />

          <p>
            Each visitor converts or doesn't. That's a <strong>Bernoulli trial</strong>.
          </p>

          <p>For large samples, proportions are approximately normal with variance p(1-p), so z-based tests are used.</p>
          <p>Because proportion variance is determined by p(1-p), the large-sample test statistic is naturally z-based.</p>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>The Pooled Proportion</h3>

          <p>H0 says both groups have the same rate. We estimate that shared rate by pooling:</p>
          <FB parts={[{ t: "p", c: C.accent, b: true, h: C.accentLt }, { t: "= (" }, { t: "conversions1 + conversions2", c: C.blue, b: true }, { t: ") / (" }, { t: "visitors1 + visitors2", c: C.green, b: true }, { t: ")" }]} notes={[{ c: C.accent, l: "Pooled rate - best estimate under H0" }, { c: C.blue, l: "Total successes" }, { c: C.green, l: "Total trials" }]} />

          <CoreCard title="Why pool instead of using each group's rate?" color={C.accent} bg={C.accentLt}>
            <p>
              Under <strong>H0: pA = pB</strong>, both groups come from one shared underlying conversion rate.
            </p>

            <p>
              So the standard error should be built from one shared estimate of that null rate,
              which is exactly what the pooled proportion does.
            </p>

            <p>
              Using separate group rates builds variability under the alternative, not under the null,
              so it is the wrong reference frame for this hypothesis test.
            </p>
          </CoreCard>

          <ComparisonCard
            observedLabel="Observed difference"
            observedValue="p̂B - p̂A"
            nullLabel="Null difference"
            nullValue="0"
            noiseLabel="Pooled standard error"
            noiseValue="√[ p(1-p)(1/n1 + 1/n2) ]"
            statLine="z = (p̂B - p̂A) / pooled SE"
          />

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>The Full Formula</h3>
          <FB parts={[{ t: "Z", c: C.accent, b: true }, { t: "= (" }, { t: "pB - pA", c: C.blue, b: true }, { t: ") / sqrt(" }, { t: "p(1-p)", c: C.purple, b: true }, { t: "x" }, { t: "(1/n1 + 1/n2)", c: C.green, b: true }, { t: ")" }]} notes={[{ c: C.blue, l: "Observed difference" }, { c: C.purple, l: "Bernoulli variance (pooled)" }, { c: C.green, l: "Both sample sizes" }]} />

          <Worked title="Checkout Button: Blue vs. Green">
            <p>Blue: 1000 visitors, 120 converts (12%). Green: 1000, 148 converts (14.8%).</p>
            <St n="1">
              Pooled p = 268/2000 = <strong>0.134</strong>
            </St>
            <St n="2">
              SE = sqrt(0.134 x 0.866 x 0.002) = <strong>0.01525</strong>
            </St>
            <St n="3">
              Z = 0.028/0.01525 = <strong>1.836</strong>. p = 0.066. <strong>Not significant.</strong>
            </St>
          </Worked>

          <Confusion title="Confusion: 'My A/B test proved the button caused more sales'">
            <p>A/B tests with proper randomization <em>can</em> support causal claims - that's their strength.</p>

            <p>But only if done right. Watch for: unequal traffic splits, peeking at results early, external events affecting one group, or the test running during an unusual period.</p>

            <p>
              <strong>Observational data</strong> (not randomized) can NEVER prove causation, no matter how significant the p-value. Correlation != causation. Ice cream sales and drownings are both correlated with summer, not with each other.
            </p>

            <p>If you can't randomize, you can only say "associated with," not "caused by."</p>
          </Confusion>

          <DD title="Common A/B testing mistakes">
            <p>
              <strong>Peeking:</strong> Checking daily and stopping when p&lt;0.05. Use fixed sample size or sequential testing.
            </p>

            <p>
              <strong>Too small:</strong> Most tests need thousands per group. Run a power analysis first.
            </p>

            <p>
              <strong>Winner's curse:</strong> The estimated effect of a "winner" is usually inflated.
            </p>
          </DD>

          <CW title="Live: A/B Test Calculator">
            <ABCalc />
          </CW>
        </section>

        <section id="t-dist" style={{ marginTop: 52 }}>
          <SH n="5" t="The t-Distribution" s="When you estimate sigma from your sample" />

          <p>
            You rarely know <strong>σ</strong>. Instead, you estimate the spread with the sample standard deviation
            <strong> s</strong>. That extra uncertainty gives the t-distribution its fatter tails.
          </p>
          <FB parts={[{ t: "t", c: C.accent, b: true }, { t: "= (" }, { t: "Xbar", c: C.blue, b: true }, { t: "-" }, { t: "mu0", c: C.purple, b: true }, { t: ") / (" }, { t: "s", c: C.red, b: true }, { t: "/ sqrt" }, { t: "n", c: C.green, b: true }, { t: ")" }]} notes={[{ c: C.red, l: "s - estimated, not known" }, { c: C.accent, l: "Follows t, not Z" }, { c: C.green, l: "df = n - 1" }]} />

          <p>Fatter tails = stronger evidence needed to reject H0. Protects you with small samples.</p>

          <CoreCard title="Why t is different from z" a={C.purple} bg={C.purpleLt}>
            <p>
              In a <strong>z-test</strong>, the population standard deviation <strong>σ</strong> is known.
            </p>
            <p>
              In a <strong>t-test</strong>, you do <strong>not</strong> know σ, so you estimate the spread using the
              sample standard deviation <strong>s</strong>.
            </p>
            <p>
              That estimate adds extra uncertainty, so the reference distribution is <strong>t</strong> instead of
              <strong> z</strong>.
            </p>
            <p style={{ marginBottom: 0 }}>
              The amount of extra uncertainty depends on the <strong>degrees of freedom</strong>: low df gives
              fatter tails, while high df makes t look more like z.
            </p>
          </CoreCard>

          <ComparisonCard
            observedLabel="Observed mean difference"
            observedValue="x̄ - μ0"
            nullLabel="Null value"
            nullValue="usually 0"
            noiseLabel="Estimated standard error"
            noiseValue="s / √n"
            statLine="t = (observed - expected) / estimated SE"
          />

          <DistanceVsAreaCard statLabel="t-score" statExample="2.1" />

          <DD title="Optional: how to use a t-table by hand">
            <St n="1">Choose the test direction, alpha, and correct df.</St>
            <St n="2">Go to the df row and alpha column to find the critical t-value.</St>
            <St n="3">Reject H0 if your observed t is more extreme than that cutoff.</St>
            <St n="4">Example: with df = 12 and two-tailed alpha = 0.05, the critical value is about ±2.179.</St>
            <St n="5">So |t| = 2.50 rejects, while |t| = 1.80 does not.</St>
          </DD>

          <CW
            title="Live: From observed t-score to p-value"
            cap="Move the observed t-score, change degrees of freedom, and switch tail type. The shaded area is the p-value."
          >
            <TValueCalc />
          </CW>

          <DD title="When does t vs. Z matter?">
            <p>n &lt; 15 → big difference. n = 15-30 → noticeable. n &gt; 30 → nearly identical.</p>

            <p>When sigma is unknown, the t-test is the standard choice for continuous mean comparisons.</p>
          </DD>
        </section>

        <section id="t-tests" style={{ marginTop: 52 }}>
          <SH n="6" t="t-Tests" s="Three versions for different data structures" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, margin: "14px 0" }}>
            {[ ["One-Sample", "Is this mean different from a value?", C.blueLt], ["Two-Sample", "Do two groups have different means?", C.purpleLt], ["Paired", "Did matched observations change?", C.accentLt] ].map(([n, q, c]) => (
              <div key={n} style={{ background: c, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{n}</div>
                <div style={{ fontSize: 13, color: C.sub }}>{q}</div>
              </div>
            ))}
          </div>

          <CoreCard title="How do I know which t-test to use?" color={C.purple} bg={C.purpleLt}>
            <St n="1">
              <strong>One-sample t-test:</strong> use this when you have <strong>one group</strong> and
              want to compare its mean to a known value or benchmark.
            </St>
            <St n="2">
              <strong>Two-sample t-test:</strong> use this when you have <strong>two separate independent groups</strong>,
              such as treatment vs control.
            </St>
            <St n="3">
              <strong>Paired t-test:</strong> use this when measurements are <strong>linked</strong>,
              such as before/after on the same person or matched pairs.
            </St>
            <p style={{ marginTop: 10 }}>
              The key question is: <strong>are the observations independent, or naturally paired?</strong>
            </p>
          </CoreCard>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>One-Sample t-Test</h3>

          <p>Is this group's mean different from a target number?</p>
          <p>
            Under <strong>H0</strong>, the population mean equals the benchmark <strong>μ0</strong>.
          </p>
          <p>Typical use case: compare a class, clinic, or product average to a known benchmark.</p>

          <p style={{ margin: "10px 0 6px", fontFamily: "var(--m)", fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Formula breakdown
          </p>
          <FB parts={[{ t: "t", c: C.accent, b: true }, { t: "= (" }, { t: "Xbar - mu0", c: C.blue, b: true }, { t: ") / (" }, { t: "s / sqrt(n)", c: C.green, b: true }, { t: ")" }]} notes={[{ c: C.blue, l: "How far from the target" }, { c: C.green, l: "Standard error (estimated)" }]} />

          <p>Same as Z-test but with <em>s</em> instead of sigma. Compare against t-distribution, df = n-1.</p>
          <CW title="Live: One-Sample t-Test">
            <OneTCalc />
          </CW>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "24px 0 8px" }}>Two-Sample t-Test</h3>

          <p>Do two unrelated groups have different means?</p>
          <p>
            Under <strong>H0</strong>, the two population means are equal, so the expected difference
            <strong> μ1 - μ2</strong> is <strong>0</strong>.
          </p>

          <p style={{ margin: "10px 0 6px", fontFamily: "var(--m)", fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Formula breakdown
          </p>
          <FB parts={[{ t: "t", c: C.accent, b: true }, { t: "= (" }, { t: "X1 - X2", c: C.blue, b: true }, { t: ") / sqrt(" }, { t: "s1^2/n1", c: C.purple, b: true }, { t: "+" }, { t: "s2^2/n2", c: C.green, b: true }, { t: ")" }]} notes={[{ c: C.blue, l: "Difference in means" }, { c: C.purple, l: "Noise from group 1" }, { c: C.green, l: "Noise from group 2" }]} />

          <p>Welch's version adjusts df when variances differ. Use it by default.</p>
          <DD title="Why is the two-sample df not just n1 + n2 - 2 here?">
            <p>In a classic pooled two-sample t-test, degrees of freedom are:</p>
            <Card style={{ background: C.codeBg }}>
              <div
                style={{
                  fontFamily: "var(--m)",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 1.9,
                }}
              >
                df = n1 + n2 - 2
              </div>
            </Card>
            <p>
              This tutorial uses <strong>Welch's t-test</strong>, which does not assume equal variances and
              uses an adjusted df instead.
            </p>
            <p>Welch is usually safer when groups have different spreads, so it is the default here.</p>
          </DD>
          <CW title="Live: Two-Sample t-Test">
            <TwoTCalc />
          </CW>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "24px 0 8px" }}>Paired t-Test</h3>

          <p>Before/after or matched data. Same subject in both conditions.</p>
          <p>
            Under <strong>H0</strong>, the mean of the within-pair differences is <strong>0</strong>.
          </p>

          <p style={{ margin: "10px 0 6px", fontFamily: "var(--m)", fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Formula breakdown
          </p>
          <FB parts={[{ t: "t", c: C.accent, b: true }, { t: "=" }, { t: "dbar", c: C.blue, b: true }, { t: "/ (" }, { t: "sd", c: C.purple, b: true }, { t: "/" }, { t: "sqrt(n)", c: C.green, b: true }, { t: ")" }]} notes={[{ c: C.blue, l: "Mean of within-pair differences" }, { c: C.purple, l: "How much differences vary" }, { c: C.green, l: "Number of pairs" }]} />

          <p>Removes between-person variation → much more powerful than independent t-test.</p>
          <DD title="How a paired t-test really works">
            <p>
              A paired t-test does <strong>not</strong> compare two separate group means directly.
            </p>
            <p>It converts each pair into a difference score:</p>
            <Card style={{ background: C.codeBg }}>
              <div
                style={{
                  fontFamily: "var(--m)",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 1.9,
                }}
              >
                difference = after - before
              </div>
            </Card>
            <p>
              Then it tests whether the <strong>mean of those differences</strong> is significantly different
              from zero.
            </p>
            <p>
              This is why paired tests are often more powerful: they remove person-to-person variation and
              isolate within-person change.
            </p>
          </DD>
          <CW title="Live: Paired t-Test">
            <PairedTCalc />
          </CW>
        </section>

        <section id="wrong-test" style={{ marginTop: 52 }}>
          <SH n="7" t="Wrong Test, Wrong Answer" s="What happens when you pick incorrectly" />

          <Danger title="Z-test when sigma is unknown (n=12)">
            <p>You use Z critical +-1.96. Correct: t critical +-2.201.</p>

            <p>
              <strong>Impact:</strong> ~60% more false positives than expected.
            </p>
          </Danger>
          <DD title="Why it matters more for small samples">
            <p>At n=12 the t and Z tails diverge significantly. At n=100 they're nearly identical. The error shrinks as n grows.</p>
          </DD>

          <Danger title="Independent t-test on paired data">
            <p>SE can be 5-6x too large. A real effect gives t~1.2 instead of t~7.0.</p>

            <p>
              <strong>Impact:</strong> You miss a real finding entirely.
            </p>
          </Danger>

          <Danger title="Multiple t-tests instead of ANOVA">
            <p>5 groups → 10 tests → 40% chance of at least one false positive.</p>

            <p>10 groups → 45 tests → 90% chance.</p>
          </Danger>

          <Danger title="Switching to one-tailed after seeing data">
            <p>p=0.07 two-tailed → switch to one-tailed → p=0.035. "Significant!"</p>

            <p>
              <strong>Impact:</strong> Real error rate is 10%, not 5%. This is p-hacking.
            </p>
          </Danger>
        </section>

        <section id="f-dist" style={{ marginTop: 52 }}>
          <SH n="8" t="The F-Distribution" s="For comparing sources of variation" />

          <FB parts={[{ t: "F", c: C.accent, b: true }, { t: "=" }, { t: "Variance between groups", c: C.blue, b: true }, { t: "/" }, { t: "Variance within groups", c: C.green, b: true }]} notes={[{ c: C.blue, l: "Signal + noise" }, { c: C.green, l: "Noise only" }, { c: C.accent, l: "F ~ 1 → no effect. F >> 1 → real differences." }]} />
          <DD title="Key properties">
            <p>Always positive. Right-skewed. Two df parameters. t^2 = F(1, df).</p>
          </DD>
          <CW title="Live: F-Distribution Explorer">
            <FCalc />
          </CW>
        </section>

        <section id="anova" style={{ marginTop: 52 }}>
          <SH n="9" t="One-Way ANOVA" s="Compare 3+ groups without inflating errors" />

          <p>If group means are equal, spread between groups should match spread within groups. If between is much larger → real differences.</p>
          <FB parts={[{ t: "F", c: C.accent, b: true }, { t: "=" }, { t: "MS_between", c: C.blue, b: true }, { t: "/" }, { t: "MS_within", c: C.green, b: true }]} notes={[{ c: C.blue, l: "SS_between / (k-1)" }, { c: C.green, l: "SS_within / (N-k)" }]} />

          <CoreCard title="Why ANOVA instead of many t-tests?" color={C.accent} bg={C.accentLt}>
            <p>Each individual t-test carries its own false-positive risk (often 5%).</p>
            <p>As you run more pairwise tests, those risks stack up and the chance of at least one false alarm rises quickly.</p>
            <p>
              ANOVA starts with one global question: <strong>is there evidence that not all means are equal?</strong>
              If yes, then use post-hoc tests to locate where differences are.
            </p>
          </CoreCard>

          <CoreCard title="What are SS and MS?" color={C.blue} bg={C.blueLt}>
            <p>
              <strong>SS_between:</strong> How spread out group means are. Bigger → groups differ more.
            </p>

            <p>
              <strong>SS_within:</strong> How spread out values are within each group. This is pure noise.
            </p>

            <p>
              <strong>MS</strong> = SS / df. Dividing by df makes the values comparable.
            </p>
          </CoreCard>

          <p style={{ marginTop: 6 }}>
            <strong>Important:</strong> ANOVA tells you that at least one mean differs, but not which one.
            Use <strong>post-hoc tests</strong> (such as Tukey's HSD or Bonferroni) to identify the specific group differences.
          </p>

          <Confusion title="Confusion: 'ANOVA found a difference, so the treatment works'">
            <p>ANOVA detects <em>differences</em>. Whether those differences are <em>causal</em> depends on your study design.</p>

            <p>
              <strong>Randomized experiment:</strong> Participants randomly assigned to groups → ANOVA can support causal claims.
            </p>

            <p>
              <strong>Observational study:</strong> Groups formed naturally (e.g., comparing people who chose different diets) → ANOVA shows association, not causation. Confounding variables could explain the difference.
            </p>
          </Confusion>

          <Worked title="Three Teaching Methods">
            <p>A: mean=72, var=64. B: mean=78, var=81. C: mean=85, var=49. n=10 each.</p>
            <St n="1">Grand mean = 78.33</St>
            <St n="2">
              SS_between = <strong>847</strong>, SS_within = <strong>1746</strong>
            </St>
            <St n="3">
              F = 423.5/64.7 = <strong>6.55</strong> → Reject H0
            </St>
          </Worked>
          <CW title="Live: ANOVA Calculator">
            <ANOVACalc />
          </CW>
        </section>

        <section id="two-way" style={{ marginTop: 52 }}>
          <SH n="10" t="Two-Way ANOVA" s="Two factors + their interaction" />

          <p>
            The key question: does one factor's effect <strong>depend on</strong> the other?
          </p>
          <FB parts={[{ t: "SS_total", c: C.muted }, { t: "=" }, { t: "SS_A", c: C.blue, b: true }, { t: "+" }, { t: "SS_B", c: C.green, b: true }, { t: "+" }, { t: "SS_AxB", c: C.accent, b: true }, { t: "+" }, { t: "SS_within", c: C.muted }]} notes={[{ c: C.blue, l: "Factor A" }, { c: C.green, l: "Factor B" }, { c: C.accent, l: "Interaction" }]} />
          <DD title="What is an interaction?">
            <p>
              <strong>No interaction:</strong> A's effect is the same at every level of B. Lines are parallel.
            </p>

            <p>
              <strong>Interaction:</strong> A's effect changes depending on B. Lines cross or diverge.
            </p>
          </DD>

          <DD title="Why interaction can make main effects misleading">
            <p>If Strategy A gives 120 in urban and 60 in rural, its average is 90.</p>

            <p>Strategy B gives 90 and 85, average 87.5. Main effects say "roughly equal."</p>

            <p>But the real story is: A dominates in cities, B dominates in rural. The average hides everything.</p>

            <p>
              <strong>Rule:</strong> Check interaction first. If significant, don't interpret main effects alone.
            </p>
          </DD>
          <CW title="Live: Interaction Plot">
            <IntCalc />
          </CW>
        </section>

        <section id="assumptions" style={{ marginTop: 52 }}>
          <SH n="11" t="Assumptions" s="What to check and what to do when they fail" />

          <div style={{ overflowX: "auto", margin: "14px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.accent}` }}>
                  {["Assumption", "If violated...", "Fix"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--m)", fontSize: 10, color: C.muted, textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  ["Independence", "P-values meaningless", "Mixed/multilevel models"],
                  ["Normality", "Minor for large n", "Non-parametric or bootstrap"],
                  ["Equal variances", "Inflated false positives", "Welch's t or Welch's ANOVA"],
                  ["Balanced design", "Confounded effects", "Type III sums of squares"],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    {r.map((c, j) => (
                      <td key={j} style={{ padding: "10px", fontWeight: j === 0 ? 600 : 400 }}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CoreCard title="What to check first" a={C.gold} bg={C.goldLt}>
            <St n="1">
              <strong>Independence is non-negotiable:</strong> if observations are dependent, p-values can be invalid.
            </St>
            <St n="2">
              <strong>Equal variances:</strong> important for some tests, but often manageable with Welch methods.
            </St>
            <St n="3">
              <strong>Normality:</strong> often less serious than students think when sample sizes are reasonably large.
            </St>
          </CoreCard>
          <DD title="Optional: what to do when assumptions fail">
            <p><strong>Independence fails:</strong> use repeated-measures, mixed, clustered, or time-series methods.</p>
            <p><strong>Equal variances fail:</strong> use Welch's t-test or Welch's ANOVA.</p>
            <p><strong>Normality is poor with small n:</strong> consider bootstrap or non-parametric alternatives.</p>
            <p style={{ marginBottom: 0 }}>
              Quick backup tests: Mann-Whitney U, Wilcoxon signed-rank, and Kruskal-Wallis.
            </p>
          </DD>
        </section>

        <section id="beyond-p" style={{ marginTop: 52 }}>
          <SH n="12" t="Beyond p-Values" s="What else you need to report" />

          <p>A p-value says how surprising the result is if H0 were true. That's it. You also need:</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, margin: "14px 0" }}>
            <Card a={C.blue}>
              <strong>Effect Size</strong>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>How big? Cohen's d: 0.2=small, 0.5=medium, 0.8=large.</p>
            </Card>

            <Card a={C.green}>
              <strong>Confidence Interval</strong>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Range of plausible values. Width = precision.</p>
            </Card>

            <Card a={C.purple}>
              <strong>Power</strong>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Could your study even detect the effect?</p>
            </Card>
          </div>

          <CoreCard title="Confidence intervals and hypothesis tests tell the same story" color={C.green} bg={C.greenLt}>
            <p>
              For a two-sided test at alpha = 0.05, the decision rule matches the 95% confidence interval.
            </p>
            <St n="1">
              If the 95% CI excludes the null value, reject H0.
            </St>
            <St n="2">
              If the 95% CI includes the null value, fail to reject H0.
            </St>
            <p style={{ marginTop: 10 }}>
              p-values emphasize surprise under H0. Confidence intervals emphasize plausible effect sizes and precision.
              Report both when possible.
            </p>
          </CoreCard>

          <Confusion title="Confusion: 'Not significant = no effect'">
            <p>
              <strong>Wrong.</strong> "Not significant" means you didn't find enough evidence. That's different from the effect being zero.
            </p>

            <p>Maybe you just didn't have enough data. A study with n=10 might get p=0.12 for a large, real effect.</p>

            <p>
              <strong>Absence of evidence is not evidence of absence.</strong>
            </p>

            <p>If the confidence interval is wide (e.g., [-2, 15]), you can't conclude anything. If it's tight around zero (e.g., [-0.3, 0.4]), then the effect is probably small.</p>
          </Confusion>

          <Confusion title="Confusion: 'Significant = important'">
            <p>
              <strong>Wrong.</strong> With 100,000 observations, a 0.01-point difference can be "significant."
            </p>

            <p>That difference is statistically real - not random noise. But it's too tiny to matter for anyone.</p>

            <p>
              <strong>Statistical significance != practical importance.</strong> Always check effect size.
            </p>

            <p>A drug that lowers blood pressure by 0.1 mmHg might be "significant" with enough patients. No doctor would prescribe it.</p>
          </Confusion>

          <Confusion title="Confusion: 'The true value has a 95% chance of being in the CI'">
            <p>
              <strong>Technically wrong</strong> (though the intuition is close).
            </p>

            <p>The true value is fixed - it's either in the interval or it isn't. There's no probability about it.</p>

            <p>What 95% means: if you repeated the study many times, 95% of the intervals you'd compute would contain the true value.</p>

            <p>It's about the <em>procedure</em>, not this specific interval. In practice, the difference rarely matters. But on exams, the wording matters.</p>
          </Confusion>
        </section>

        <section id="decision" style={{ marginTop: 52 }}>
          <SH n="13" t="Decision Guide" s="Which test should you use?" />
          <div style={{ overflowX: "auto", margin: "14px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.accent}` }}>
                  {["Situation", "Data", "Groups", "Test"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--m)", fontSize: 10, color: C.muted, textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  ["Mean vs. benchmark", "Continuous, sigma known", "1", "Z-test"],
                  ["Mean vs. benchmark", "Continuous, sigma unknown", "1", "One-sample t"],
                  ["Two conversion rates", "Binary (Bernoulli)", "2", "A/B test (Z)"],
                  ["Two independent means", "Continuous", "2", "Two-sample t"],
                  ["Before/after", "Continuous (paired)", "2", "Paired t"],
                  ["3+ group means", "Continuous", "3+", "One-way ANOVA"],
                  ["Two factors", "Continuous", "Varies", "Two-way ANOVA"],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    {r.map((c, j) => (
                      <td key={j} style={{ padding: "10px", fontWeight: j === 3 ? 700 : 400, color: j === 3 ? C.accent : C.text }}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CoreCard title="Practical workflow" a={C.green} bg={C.greenLt}>
            <St n="1">Identify the variable type and study design.</St>
            <St n="2">Choose the matching test.</St>
            <St n="3">Compute the test statistic.</St>
            <St n="4">Get the p-value or compare with a critical value.</St>
            <St n="5">State the decision: reject H0 or fail to reject H0.</St>
            <St n="6">Report effect size, confidence interval, and key assumptions.</St>
          </CoreCard>

          <Card style={{ background: C.codeBg }}>
            <div style={{ fontFamily: "var(--m)", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre", overflowX: "auto" }}>{`Central Limit Theorem

|

|- Binary data (Bernoulli)

|  |- Z-test for proportions (A/B test)

|       |- Uses pooled proportion under H0

|

|- Continuous data, sigma known

|  |- Z-test

|

|- Continuous data, sigma unknown

|  |- One-sample t-test

|  |- Two-sample t-test (Welch's)

|  |- Paired t-test

|

|- Comparing 3+ groups (continuous)

   |- One-way ANOVA → post-hoc tests

   |- Two-way ANOVA → check interaction first`}</div>
          </Card>

          <div style={{ marginTop: 28, padding: "22px 18px", background: `linear-gradient(135deg,${C.accentLt} 0%,${C.blueLt} 100%)`, borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--h)", fontSize: 20, marginBottom: 8 }}>The Unifying Idea</div>
            <p style={{ maxWidth: 500, margin: "0 auto", fontSize: 15, lineHeight: 1.75 }}>
              Every test computes: <em>(signal - expected) / noise.</em>
              <br />
              More data → less noise → easier to spot real effects.
              <br />
              Z, t, and F are just different rulers for "how surprising is this?"
            </p>
          </div>
        </section>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textAlign: "center" }}>
          Interactive tutorial with drill-downs, live calculators, and annotated formulas.
        </div>
      </main>
    </div>
  );
}
