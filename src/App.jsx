import { useState, useEffect, useId, useRef } from "react";
import { K } from "./components/Latex.jsx";

import { normalCDF, pFromZ, tCDF, tCritical } from "./math.js";

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
  const panelId = useId();
  const buttonId = `${panelId}-button`;

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
        type="button"
        id={buttonId}
        onClick={() => sO(!o)}
        aria-expanded={o}
        aria-controls={panelId}
        className="tutorial-disclosure-button"
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
        <span style={{ fontFamily: "var(--m)", fontSize: 11, color: C.muted }}>
          {o ? "−" : "+"}
        </span>
      </button>

      {o && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
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
  const panelId = useId();
  const buttonId = `${panelId}-button`;

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
        type="button"
        id={buttonId}
        onClick={() => sO(!o)}
        aria-expanded={o}
        aria-controls={panelId}
        className="tutorial-disclosure-button"
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
        <span style={{ fontFamily: "var(--m)", fontSize: 11, color: C.teal }}>
          {o ? "−" : "+"}
        </span>
      </button>

      {o && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
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

const Sl = ({ label, value, min, max, step, onChange, color, display }) => {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const normalizedStep = step || 1;

  const setValue = (next) => {
    if (Number.isNaN(next)) return;
    onChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <label id={labelId} htmlFor={inputId} style={{ color: C.sub, fontSize: 13 }}>
          {label}
        </label>
        {display && (
          <strong style={{ color: color || C.accent, fontSize: 15 }}>
            {display}
          </strong>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 110px",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={normalizedStep}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          aria-label={`${label} slider`}
          style={{ width: "100%", marginTop: 2, accentColor: color || C.accent }}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={normalizedStep}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          aria-label={label}
          style={{
            width: "100%",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: "var(--m)",
            color: C.text,
            background: C.card,
          }}
        />
      </div>
    </div>
  );
};

const CR = ({ items, hl }) => (
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      background: hl ? C.greenLt : C.codeBg,
      border: `1px solid ${hl ? C.green : C.border}`,
      borderRadius: 8,
      overflow: "hidden",
      marginTop: 12,
    }}
  >
    <caption
      style={{
        fontFamily: "var(--m)",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: hl ? C.green : C.muted,
        padding: "10px 12px 6px",
        captionSide: "top",
      }}
    >
      Calculator Summary
    </caption>
    <tbody>
      {items.map(([l, v, b], i) => (
        <tr key={i} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
          <th
            scope="row"
            style={{
              width: "40%",
              textAlign: "left",
              padding: "10px 12px",
              fontFamily: "var(--m)",
              fontSize: 11,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              verticalAlign: "top",
            }}
          >
            {l}
          </th>
          <td
            style={{
              padding: "10px 12px",
              fontSize: b ? 17 : 15,
              fontWeight: b ? 700 : 600,
              color: b ? (hl ? C.green : C.accent) : C.text,
            }}
          >
            {v}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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

const Remember = ({ children }) => (
  <Card a={C.green} bg={C.greenLt}>
    <div
      style={{
        fontFamily: "var(--m)",
        fontSize: 11,
        color: C.green,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 8,
      }}
    >
      Remember
    </div>
    <div style={{ lineHeight: 1.75 }}>{children}</div>
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

const StandardErrorFigure = () => {
  return (
    <svg
      viewBox="0 0 420 220"
      aria-label="Annotated figure showing how standard error shrinks as sample size grows"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect x="0" y="0" width="420" height="220" rx="14" fill={C.codeBg} />
      <line x1="42" y1="24" x2="42" y2="182" stroke={C.muted} strokeWidth="1.5" />
      <line x1="42" y1="182" x2="392" y2="182" stroke={C.muted} strokeWidth="1.5" />
      <text x="14" y="28" fill={C.sub} fontSize="11" fontFamily="var(--m)">
        SE
      </text>
      <text x="338" y="205" fill={C.sub} fontSize="11" fontFamily="var(--m)">
        sample size (n)
      </text>
      <path
        d="M42 162 C86 118 126 92 176 74 C226 58 288 45 392 32"
        fill="none"
        stroke={C.accent}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line x1="132" y1="182" x2="132" y2="64" stroke={C.blue} strokeWidth="1.5" strokeDasharray="6 5" />
      <line x1="292" y1="182" x2="292" y2="45" stroke={C.blue} strokeWidth="1.5" strokeDasharray="6 5" />
      <circle cx="132" cy="104" r="5" fill={C.blue} />
      <circle cx="292" cy="54" r="5" fill={C.blue} />
      <text x="112" y="198" fill={C.blue} fontSize="11" fontFamily="var(--m)">
        n = 100
      </text>
      <text x="270" y="198" fill={C.blue} fontSize="11" fontFamily="var(--m)">
        n = 400
      </text>
      <rect x="150" y="18" width="136" height="44" rx="8" fill={C.card} stroke={C.border} />
      <text x="164" y="38" fill={C.text} fontSize="12" fontFamily="var(--m)">
        4× more data
      </text>
      <text x="164" y="54" fill={C.accent} fontSize="12" fontFamily="var(--m)" fontWeight="700">
        ≈ half the SE
      </text>
      <text x="56" y="166" fill={C.muted} fontSize="11" fontFamily="var(--m)">
        noisy estimate
      </text>
      <text x="298" y="60" fill={C.muted} fontSize="11" fontFamily="var(--m)">
        tighter estimate
      </text>
    </svg>
  );
};

const StandardNormalFigure = () => (
  <svg
    viewBox="0 0 420 220"
    aria-label="Annotated standard normal curve showing critical values and tail areas"
    style={{ width: "100%", height: "auto", display: "block" }}
  >
    <rect x="0" y="0" width="420" height="220" rx="14" fill={C.codeBg} />
    <line x1="34" y1="176" x2="386" y2="176" stroke={C.muted} strokeWidth="1.5" />
    <path
      d="M34 176 C78 176 116 52 210 46 C304 52 342 176 386 176"
      fill="none"
      stroke={C.accent}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path d="M34 176 C66 176 92 144 108 114 L108 176 Z" fill={C.tealLt} stroke={C.teal} strokeWidth="1.5" />
    <path d="M312 176 L312 114 C328 144 354 176 386 176 Z" fill={C.tealLt} stroke={C.teal} strokeWidth="1.5" />
    <line x1="108" y1="176" x2="108" y2="92" stroke={C.purple} strokeWidth="1.5" strokeDasharray="6 5" />
    <line x1="312" y1="176" x2="312" y2="92" stroke={C.purple} strokeWidth="1.5" strokeDasharray="6 5" />
    <text x="92" y="194" fill={C.purple} fontSize="11" fontFamily="var(--m)">
      −1.96
    </text>
    <text x="302" y="194" fill={C.purple} fontSize="11" fontFamily="var(--m)">
      +1.96
    </text>
    <rect x="126" y="20" width="170" height="42" rx="8" fill={C.card} stroke={C.border} />
    <text x="140" y="38" fill={C.text} fontSize="12" fontFamily="var(--m)">
      z-score = location on the axis
    </text>
    <text x="140" y="54" fill={C.teal} fontSize="12" fontFamily="var(--m)" fontWeight="700">
      p-value = shaded tail area
    </text>
    <text x="48" y="108" fill={C.teal} fontSize="11" fontFamily="var(--m)">
      left tail
    </text>
    <text x="324" y="108" fill={C.teal} fontSize="11" fontFamily="var(--m)">
      right tail
    </text>
  </svg>
);

const TvsZFigure = () => (
  <svg
    viewBox="0 0 420 220"
    aria-label="Annotated comparison of the t-distribution and z-distribution with heavier tails at low df"
    style={{ width: "100%", height: "auto", display: "block" }}
  >
    <rect x="0" y="0" width="420" height="220" rx="14" fill={C.codeBg} />
    <line x1="34" y1="176" x2="386" y2="176" stroke={C.muted} strokeWidth="1.5" />
    <path
      d="M34 176 C78 176 116 54 210 46 C304 54 342 176 386 176"
      fill="none"
      stroke={C.accent}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M34 176 C74 170 122 102 210 88 C298 102 346 170 386 176"
      fill="none"
      stroke={C.blue}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <line x1="92" y1="176" x2="92" y2="120" stroke={C.blue} strokeWidth="1.5" strokeDasharray="6 5" />
    <line x1="328" y1="176" x2="328" y2="120" stroke={C.blue} strokeWidth="1.5" strokeDasharray="6 5" />
    <rect x="214" y="20" width="150" height="50" rx="8" fill={C.card} stroke={C.border} />
    <text x="228" y="40" fill={C.blue} fontSize="12" fontFamily="var(--m)" fontWeight="700">
      low df = fatter tails
    </text>
    <text x="228" y="56" fill={C.text} fontSize="12" fontFamily="var(--m)">
      stronger evidence needed
    </text>
    <rect x="44" y="22" width="132" height="48" rx="8" fill={C.card} stroke={C.border} />
    <line x1="58" y1="38" x2="90" y2="38" stroke={C.accent} strokeWidth="3" />
    <text x="98" y="42" fill={C.text} fontSize="12" fontFamily="var(--m)">
      z-distribution
    </text>
    <line x1="58" y1="58" x2="90" y2="58" stroke={C.blue} strokeWidth="3" />
    <text x="98" y="62" fill={C.text} fontSize="12" fontFamily="var(--m)">
      t-distribution
    </text>
  </svg>
);

/* ═══════════════════ CALCULATORS ═══════════════════ */

const ZTestCalc = () => {
  const [xbar, sX] = useState(23);
  const [mu0, sM] = useState(20);
  const [sigma, sS] = useState(8);
  const [n, sN] = useState(50);
  const [tail, sT] = useState("two");

  const se = sigma / Math.sqrt(n);
  const z = se > 0 ? (xbar - mu0) / se : 0;
  const leftArea = normalCDF(z);
  const rightArea = 1 - leftArea;
  const p = tail === "left" ? leftArea : tail === "right" ? rightArea : 2 * Math.min(leftArea, rightArea);
  const sig = p < 0.05;

  const critText = tail === "two" ? "±1.96" : tail === "right" ? "1.645" : "-1.645";
  const tailLabel = tail === "left" ? "Left-tailed" : tail === "right" ? "Right-tailed" : "Two-tailed";

  return (
    <div>
      <div className="responsive-grid-2" style={{ gap: 8 }}>
        <Sl label="Sample mean (x̄)" value={xbar} min={0} max={100} onChange={sX} color={C.blue} />

        <Sl label="Hypothesized mean (μ₀)" value={mu0} min={0} max={100} onChange={sM} color={C.purple} />

        <Sl label="Population standard deviation (σ)" value={sigma} min={1} max={30} onChange={sS} color={C.green} />

        <Sl label="Sample size (n)" value={n} min={5} max={200} onChange={sN} color={C.gold} />
      </div>

      <div style={{ display: "flex", gap: 6, margin: "10px 0 8px", flexWrap: "wrap" }}>
        {["left", "right", "two"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => sT(v)}
            aria-pressed={tail === v}
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

      <CR
        items={[
          ["Tail", tailLabel],
          ["SE", se.toFixed(3)],
          ["Observed z", <><span>{z.toFixed(3)}</span><TypeTag bg={C.purpleLt} color={C.purple}>distance</TypeTag></>, true],
          ["p-value", <><span>{p < 0.001 ? "<0.001" : p.toFixed(4)}</span><TypeTag bg={C.tealLt} color={C.teal}>area</TypeTag></>, true],
          ["alpha", <><span>0.05</span><TypeTag bg={C.accentLt} color={C.accent}>area threshold</TypeTag></>],
          ["Critical value", critText],
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
      <div className="responsive-grid-2" style={{ gap: 12 }}>
        <div style={{ background: C.blueLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.blue, marginBottom: 6 }}>CONTROL (A)</div>
          <Sl label="Control visitors (nA)" value={nA} min={50} max={5000} step={50} onChange={(v) => { sNA(v); sCA(Math.min(cA, v)); }} color={C.blue} />

          <Sl label="Control conversions (xA)" value={cA} min={0} max={nA} onChange={sCA} color={C.blue} display={`${cA} (${(pA * 100).toFixed(1)}%)`} />
        </div>

        <div style={{ background: C.accentLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.accent, marginBottom: 6 }}>VARIANT (B)</div>
          <Sl label="Variant visitors (nB)" value={nB} min={50} max={5000} step={50} onChange={(v) => { sNB(v); sCB(Math.min(cB, v)); }} color={C.accent} />

          <Sl label="Variant conversions (xB)" value={cB} min={0} max={nB} onChange={sCB} color={C.accent} display={`${cB} (${(pB * 100).toFixed(1)}%)`} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.muted, marginTop: 12 }}>
        Two-sided test
      </div>
      <CR
        items={[
          ["Pooled proportion", pool.toFixed(4)],
          ["SE", se.toFixed(4)],
          ["z-score", z.toFixed(3), true],
          ["p-value", p.toFixed(4), true],
          ["Decision", sig ? "Significant" : "Not significant", true],
        ]}
        hl={sig}
      />
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
  const crit = tCritical(df);
  const sig = pV < 0.05;

  return (
    <div>
      <div className="responsive-grid-2" style={{ gap: 8 }}>
        <Sl label="Sample mean (x̄)" value={xbar} min={50} max={150} onChange={sX} color={C.blue} />
        <Sl label="Hypothesized mean (μ₀)" value={mu0} min={50} max={150} onChange={sM} color={C.purple} />
        <Sl label="Sample standard deviation (s)" value={s} min={1} max={40} onChange={sS} color={C.green} />
        <Sl label="Sample size (n)" value={n} min={3} max={100} onChange={sN} color={C.gold} />
      </div>
      <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.muted, marginTop: 12 }}>
        Two-sided test
      </div>
      <CR
        items={[
          ["SE", se.toFixed(3)],
          ["df", df],
          ["t-statistic", t.toFixed(3), true],
          ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true],
          ["Critical value", `±${crit.toFixed(3)}`],
          ["Decision", sig ? "Reject H0" : "Fail to reject", true],
        ]}
        hl={sig}
      />
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
  const crit = tCritical(dfExact);
  const sig = pV < 0.05;
  const cd = Math.abs(x1 - x2) / Math.sqrt((s1 * s1 + s2 * s2) / 2);

  return (
    <div>
      <div className="responsive-grid-2" style={{ gap: 12 }}>
        <div style={{ background: C.blueLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.blue }}>GROUP 1</div>

          <Sl label="Group 1 mean (x̄₁)" value={x1} min={40} max={120} onChange={sX1} color={C.blue} />
          <Sl label="Group 1 standard deviation (s₁)" value={s1} min={1} max={30} onChange={sS1} color={C.blue} />
          <Sl label="Group 1 sample size (n₁)" value={n1} min={3} max={100} onChange={sN1} color={C.blue} />
        </div>

        <div style={{ background: C.accentLt, borderRadius: 8, padding: 12 }}>
          <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.accent }}>GROUP 2</div>

          <Sl label="Group 2 mean (x̄₂)" value={x2} min={40} max={120} onChange={sX2} color={C.accent} />
          <Sl label="Group 2 standard deviation (s₂)" value={s2} min={1} max={30} onChange={sS2} color={C.accent} />
          <Sl label="Group 2 sample size (n₂)" value={n2} min={3} max={100} onChange={sN2} color={C.accent} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.muted, marginTop: 12 }}>
        Two-sided test
      </div>
      <CR
        items={[
          ["SE", se.toFixed(3)],
          ["df", df],
          ["t-statistic", t.toFixed(3), true],
          ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true],
          ["Critical value", `±${crit.toFixed(3)}`],
          ["Cohen's d (avg. variance)", cd.toFixed(2)],
          ["Decision", sig ? "Reject H0" : "Fail to reject", true],
        ]}
        hl={sig}
      />
      <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 6 }}>
        Textbooks often use a pooled-SD version of Cohen&apos;s d. This calculator shows the average-variance version.
      </div>
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
  const crit = tCritical(df);
  const sig = pV < 0.05;

  return (
    <div>
      <Sl label="Mean difference (d̄)" value={dbar} min={-10} max={10} step={0.1} onChange={sD} color={C.blue} display={dbar.toFixed(1)} />

      <Sl label="Standard deviation of differences (s_d)" value={sd} min={0.1} max={15} step={0.1} onChange={sSd} color={C.purple} display={sd.toFixed(1)} />

      <Sl label="Number of pairs (n)" value={n} min={3} max={50} onChange={sN} color={C.green} />

      <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.muted, marginTop: 12 }}>
        Two-sided test
      </div>
      <CR
        items={[
          ["SE", se.toFixed(3)],
          ["df", df],
          ["t-statistic", t.toFixed(3), true],
          ["p-value", pV < 0.001 ? "<0.001" : pV.toFixed(4), true],
          ["Critical value", `±${crit.toFixed(3)}`],
          ["Decision", sig ? "Reject H0" : "Fail to reject", true],
        ]}
        hl={sig}
      />
    </div>
  );
};

/* ═══════════════════ NAV ═══════════════════ */
const secs = [
  { id: "basics", l: "Basics", group: true },
  { id: "se", l: "Standard Error" },
  { id: "df", l: "Degrees of Freedom" },
  { id: "clt", l: "Central Limit Theorem" },
  { id: "tests", l: "Tests", group: true },
  { id: "z-test", l: "Z-Test" },
  { id: "t-test", l: "t-Tests" },
  { id: "ab-test", l: "A/B Testing" },
  { id: "practice", l: "In Practice", group: true },
  { id: "wrong-test", l: "Wrong Test" },
  { id: "assumptions", l: "Assumptions" },
  { id: "beyond-p", l: "Beyond p-Values" },
  { id: "decision", l: "Decision Guide" },
];

/* ═══════════════════ APP ═══════════════════ */
export default function App() {
  const [active, setA] = useState("se");
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);
  const activeLabel = secs.find((s) => s.id === active)?.l || "Standard Error";

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        const v = es.filter((e) => e.isIntersecting);
        if (v.length) setA(v[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    secs.filter((s) => !s.group).forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const syncNavState = (event) => {
      if (!event.matches) setNavOpen(false);
    };

    syncNavState(mq);
    mq.addEventListener("change", syncNavState);
    return () => mq.removeEventListener("change", syncNavState);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const scrollToTarget = () => {
      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      const summary = navRef.current?.querySelector(".tutorial-nav-summary");
      const navOffset = isMobile
        ? Math.ceil(summary?.getBoundingClientRect().height || 88) + 16
        : 24;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      el.focus({ preventScroll: true });
    };

    if (window.matchMedia("(max-width: 900px)").matches && navOpen) {
      setNavOpen(false);
      requestAnimationFrame(() => requestAnimationFrame(scrollToTarget));
      return;
    }

    scrollToTarget();
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
      .tutorial-nav-title{padding:0 14px 16px;border-bottom:1px solid ${C.border};margin-bottom:10px;font-family:var(--h);font-size:15px;color:${C.accent}}
      .tutorial-nav-summary{display:none}
      .tutorial-nav-toggle{display:none}
      .tutorial-nav-panel{display:block}
      .tutorial-section{margin-top:52px;scroll-margin-top:32px}
      .tutorial-section:focus-visible{outline:2px solid ${C.accent};outline-offset:6px}
      .responsive-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
      .responsive-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
      .tutorial-disclosure-button:focus-visible,.tutorial-nav-link:focus-visible,.tutorial-nav-toggle:focus-visible{outline:2px solid ${C.accent};outline-offset:2px}
      @media (max-width: 900px){
        .tutorial-nav{position:sticky;width:100%;height:auto;max-height:none;border-right:none;border-bottom:1px solid ${C.border};padding:0;box-shadow:0 10px 30px rgba(26,26,26,0.08)}
        .tutorial-main{margin-left:0;padding:20px 16px 60px;max-width:none}
        .tutorial-nav-title{padding:14px 16px 10px;margin-bottom:0;border-bottom:none}
        .tutorial-nav-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px 14px}
        .tutorial-nav-toggle{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;padding:10px 14px;border-radius:999px;border:1px solid ${C.border};background:${C.accentLt};color:${C.accent};font-family:var(--m);font-size:11px;font-weight:600;letter-spacing:0.04em;cursor:pointer}
        .tutorial-nav-panel{display:none;border-top:1px solid ${C.border};padding:8px 0 14px;max-height:calc(100vh - 130px);overflow-y:auto}
        .tutorial-nav.is-open .tutorial-nav-panel{display:block}
        .tutorial-nav-group{padding:12px 16px 6px !important;font-size:11px !important}
        .tutorial-nav-link{padding:11px 16px 11px 22px !important;font-size:13px !important;min-height:44px}
        .tutorial-section{margin-top:40px !important;scroll-margin-top:104px}
        .responsive-grid-2,.responsive-grid-3{grid-template-columns:1fr !important}
        .responsive-table{min-width:560px}
      }`}</style>

      <nav
        ref={navRef}
        className={`tutorial-nav${navOpen ? " is-open" : ""}`}
        aria-label="Tutorial sections"
      >
        <div className="tutorial-nav-title">
          Hypothesis Testing
        </div>

        <div className="tutorial-nav-summary">
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--m)",
                fontSize: 11,
                color: C.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Current Section
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {activeLabel}
            </div>
          </div>

          <button
            type="button"
            className="tutorial-nav-toggle"
            onClick={() => setNavOpen((open) => !open)}
            aria-expanded={navOpen}
            aria-controls="tutorial-nav-panel"
          >
            {navOpen ? "Hide Sections" : "Browse Sections"}
          </button>
        </div>

        <div id="tutorial-nav-panel" className="tutorial-nav-panel">
          {secs.map((s) =>
            s.group ? (
              <div
                key={s.id}
                className="tutorial-nav-group"
                style={{
                  padding: "12px 14px 4px",
                  fontFamily: "var(--m)",
                  fontSize: 11,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  borderTop: s.id !== "basics" ? `1px solid ${C.border}` : "none",
                  marginTop: s.id !== "basics" ? 8 : 0,
                }}
              >
                {s.l}
              </div>
            ) : (
              <button
                key={s.id}
                type="button"
                className="tutorial-nav-link"
                onClick={() => go(s.id)}
                aria-current={active === s.id ? "location" : undefined}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "5px 14px 5px 20px",
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
            )
          )}
        </div>
      </nav>

      <main className="tutorial-main">
        <div style={{ marginBottom: 44 }}>
          <Pill c={C.greenLt}>Interactive Tutorial</Pill>

          <h1 style={{ fontFamily: "var(--h)", fontSize: 34, fontWeight: 400, lineHeight: 1.15, margin: "12px 0 8px" }}>Hypothesis Testing</h1>

          <p style={{ fontSize: 16, color: C.sub, margin: 0 }}>From Z-Tests to A/B Testing — an interactive reference</p>

          <Card a={C.teal} bg={C.tealLt} style={{ marginTop: 16 }}>
            <div
              style={{
                fontFamily: "var(--m)",
                fontSize: 11,
                color: C.teal,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              Quick Reference
            </div>
            <h2 style={{ fontFamily: "var(--h)", fontSize: 22, fontWeight: 400, margin: "0 0 10px" }}>Key Terms</h2>
            <div className="responsive-grid-2" style={{ gap: 10 }}>
              <div>
                <strong>H0:</strong> the null hypothesis, or the default claim you test against.
              </div>
              <div>
                <strong>H1:</strong> the alternative hypothesis, or what you would conclude if H0 is not convincing.
              </div>
              <div>
                <strong>alpha:</strong> the cutoff for calling a result statistically significant, usually 0.05.
              </div>
              <div>
                <strong>p-value:</strong> how surprising your data would be if H0 were true.
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 14, padding: "10px 14px", background: C.codeBg, borderRadius: 8, fontSize: 13, color: C.sub }}>
            <strong style={{ color: C.text }}>Prerequisite:</strong> You know the Central Limit Theorem - sample means are roughly normally distributed for large n.
          </div>

          <h2 style={{ fontFamily: "var(--h)", fontSize: 24, fontWeight: 400, margin: "18px 0 8px", color: C.text }}>The Big Picture</h2>

          <p>
            Every test asks: <strong>"Is this real, or just noise?"</strong>
          </p>

          <FB parts={[{ t: "Test Stat", c: C.accent, b: true }, { t: "=" }, { t: "(What I saw", c: C.blue }, { t: "-" }, { t: "Expected)", c: C.purple }, { t: "/" }, { t: "Noise", c: C.green }]} notes={[{ c: C.blue, l: "Your sample result" }, { c: C.purple, l: "What H0 predicts" }, { c: C.green, l: "Standard error" }]} />

          <p style={{ marginBottom: 0 }}>
            Big ratio → surprising → probably real.
            <br />
            Small ratio → ordinary → probably noise.
          </p>
        </div>

        <section id="se" className="tutorial-section" tabIndex={-1}>
          <SH n="1" t="Standard Error" s="The spread of the sampling distribution" />

          <CoreCard title="What is standard error?" a={C.blue} bg={C.blueLt}>
            <p>
              The <strong>standard error (SE)</strong> is the standard deviation of the <em>sampling distribution</em>.
              It measures how much the sample mean would vary if you repeated the experiment many times.
            </p>
            <p style={{ marginBottom: 0 }}>
              SE is <strong>not</strong> the standard deviation of your data.
              It is the standard deviation of <em>the estimator itself</em>.
            </p>
          </CoreCard>

          <K d>{"SE(\\bar{x}) = \\frac{\\sigma}{\\sqrt{n}}"}</K>

          <div className="responsive-grid-3" style={{ gap: 10, margin: "14px 0" }}>
            <Card a={C.blue} bg={C.blueLt}>
              <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.blue, marginBottom: 4 }}>σ</div>
              <div style={{ fontSize: 13 }}>Spread of individuals in the population</div>
            </Card>
            <Card a={C.green} bg={C.greenLt}>
              <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.green, marginBottom: 4 }}>√n</div>
              <div style={{ fontSize: 13 }}>More data → more cancellation of errors</div>
            </Card>
            <Card a={C.accent} bg={C.accentLt}>
              <div style={{ fontFamily: "var(--m)", fontSize: 11, color: C.accent, marginBottom: 4 }}>SE</div>
              <div style={{ fontSize: 13 }}>Spread of sample means — how much your estimate wiggles</div>
            </Card>
          </div>

          <p>More data → smaller SE → easier to spot real effects.</p>

          <DD title="Why √n? (Diminishing returns)">
            <p>Errors partly cancel when you average. The cancellation follows a square-root law.</p>
            <p>To cut noise in half, you need 4× the data. To halve again, 16×. Diminishing returns.</p>
          </DD>

          <CW
            title="Annotated Figure: Why SE Falls Slowly"
            cap="The drop is steep at first, then flattens. Bigger samples still help, but each extra batch buys less precision."
          >
            <StandardErrorFigure />
          </CW>

          <Remember>SE = σ/√n. More data → smaller SE, but 4× data only halves SE.</Remember>
        </section>

        <section id="df" className="tutorial-section" tabIndex={-1}>
          <SH n="2" t="Degrees of Freedom" s="How many independent pieces of information you have" />

          <p>Degrees of freedom count how many pieces of information can still vary after you estimate something from the data.</p>

          <K d>{"df = n - 1"}</K>

          <DD title="Why df = n − 1">
            <p>4 friends, 4 chairs. First 3 pick freely. The 4th has no choice. df = 3.</p>

            <p style={{ marginBottom: 0 }}>
              Compute a mean from n values. Once you know the mean and n−1 values, the last is locked. <strong>df = n − 1</strong>.
            </p>
          </DD>

          <CoreCard title="Why degrees of freedom matter" a={C.purple} bg={C.purpleLt}>
            <p>Low df means fatter tails, so stronger evidence is needed to reject H0.</p>
            <p>High df means the t-distribution gets closer to the normal distribution.</p>
            <p style={{ marginBottom: 0 }}>
              So the same test statistic can lead to a different p-value depending on df.
            </p>
          </CoreCard>

          <CW
            title="Annotated Figure: Low df Makes Tails Heavier"
            cap="The blue t curve starts lower in the center and leaves more probability in the tails than the orange z curve."
          >
            <TvsZFigure />
          </CW>

          <Remember>df = n−1. Low df → fat tails → need stronger evidence.</Remember>

        </section>

        <section id="clt" className="tutorial-section" tabIndex={-1}>
          <SH n="3" t="Central Limit Theorem" s="Why hypothesis testing works at all" />

          <CoreCard title="The CLT in one sentence" a={C.accent} bg={C.accentLt}>
            <p style={{ marginBottom: 0 }}>
              For large enough <em>n</em>, the sampling distribution of the sample mean is approximately
              <strong> Normal</strong> — regardless of the shape of the original population.
            </p>
          </CoreCard>

          <K d>{"\\bar{x} \\;\\approx\\; \\mathcal{N}\\!\\left(\\mu,\\; \\frac{\\sigma^2}{n}\\right)"}</K>

          <p>
            ⚠️ This does <strong>not</strong> mean the data are Normal. It means the <em>average</em> behaves approximately like
            a Normal variable when <em>n</em> is large — even if the individual data points are wildly skewed.
          </p>

          <DD title="Review the CLT refresher">
            <div className="responsive-grid-2" style={{ gap: 10, margin: "0 0 14px" }}>
              <Card a={C.red} bg={C.redLt} style={{ marginBottom: 0 }}>
                <strong>Without the CLT</strong>
                <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                  We would not know the shape of the sampling distribution, so we could not judge how rare a result is.
                </p>
              </Card>
              <Card a={C.green} bg={C.greenLt} style={{ marginBottom: 0 }}>
                <strong>With the CLT</strong>
                <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                  We get an approximately Normal reference curve for sample means, so hypothesis tests become possible.
                </p>
              </Card>
            </div>

            <CoreCard title="What type of data do you have?" a={C.gold} bg={C.goldLt} label="Quick Reference">
              <div className="responsive-grid-2" style={{ gap: 10 }}>
                <div>
                  <strong>Continuous data</strong>
                  <p style={{ fontSize: 13, margin: "4px 0 0" }}>
                    Each observation is a number. Heights, test scores, revenue. You usually do not know σ, so you estimate it with <em>s</em> and use t-based methods.
                  </p>
                </div>
                <div>
                  <strong>Binary data (Bernoulli)</strong>
                  <p style={{ fontSize: 13, margin: "4px 0 0" }}>
                    Each observation is yes/no. Clicked or did not, bought or did not. Variance is p(1−p), which leads to z-based proportion tests.
                  </p>
                </div>
              </div>
            </CoreCard>
          </DD>

          <Confusion title="Confusion: 'Don't all tests assume normal data?'">
            <p>
              <strong>No.</strong> The tests assume the <em>test statistic</em> is approximately normal (or t). That's different from the raw data being normal.
            </p>
            <p>The CLT is the bridge. It says: no matter what the individual data looks like, the <em>average</em> of enough observations is approximately normal.</p>
            <p>So your data can be skewed, bimodal, or Bernoulli. As long as n is large enough, the sample mean (or proportion) is approximately normal, and the test works.</p>
            <p>
              <strong>Exception:</strong> Small samples (n &lt; 15) with very skewed data. Here the CLT may not have kicked in yet. Consider non-parametric tests or bootstrap methods unless you have a strong reason to treat the population as roughly Normal.
            </p>
          </Confusion>

          <Remember>Large n → sample mean is approximately Normal, regardless of population shape.</Remember>
        </section>

        <section id="z-test" className="tutorial-section" tabIndex={-1}>
          <SH n="4" t="Z-Test" s="The normal-distribution version of hypothesis testing (when σ is known)" />

          <p>
            Use a <strong>z-test</strong> when the population standard deviation <strong>σ</strong> is known.
            In practice this is uncommon for means, but common for large-sample proportion tests.
          </p>

          <K d>{"z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}}"}</K>

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

          <CW
            title="Annotated Figure: Statistic vs Tail Area"
            cap="Critical values mark cutoffs on the x-axis. The p-value comes from the shaded probability in the tails."
          >
            <StandardNormalFigure />
          </CW>

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

          <DistanceVsAreaCard statLabel="z-score" statExample="2.65" />

          <DD title="Manual z-table walkthrough">
            <Card style={{ background: C.codeBg, marginBottom: 0 }}>
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
          </DD>

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

          <Remember>z = (observed − expected) / SE. Compare p to α. Know your tail direction.</Remember>
        </section>

        <section id="t-test" className="tutorial-section" tabIndex={-1}>
          <SH n="5" t="t-Tests" s="When σ is unknown — three versions for different data structures" />

          <p>
            You rarely know <strong>σ</strong>. Instead, you estimate the spread with the sample standard deviation
            <strong> s</strong>. That extra uncertainty gives the t-distribution its fatter tails.
          </p>

          <K d>{"t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}"}</K>

          <p>Fatter tails = stronger evidence needed to reject H0. Protects you with small samples.</p>

          <CoreCard title="Why t is different from z" a={C.purple} bg={C.purpleLt}>
            <p>
              In a <strong>z-test</strong>, σ is known. In a <strong>t-test</strong>, you estimate spread with <strong>s</strong>.
            </p>
            <p style={{ marginBottom: 0 }}>
              That extra uncertainty depends on <strong>degrees of freedom</strong>: low df → fatter tails, high df → looks like z.
            </p>
          </CoreCard>

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

          <Worked title="Class Scores vs National Average">
            <p>A class of 25 students averages 78 on a standardized test. The national average is 75 and the class SD is 8.</p>
            <St n="1">
              Use a <strong>one-sample t-test</strong> because there is one group and σ is unknown.
            </St>
            <St n="2">
              SE = 8 / √25 = <strong>1.6</strong>, so the class mean is <strong>1.875 SEs</strong> above the benchmark.
            </St>
            <St n="3">
              Compare the t statistic with the t distribution using <strong>df = 24</strong>, not the normal curve.
            </St>
          </Worked>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>One-Sample t-Test</h3>

          <p>Is this group's mean different from a target number?</p>
          <p>
            Under <strong>H0</strong>, the population mean equals the benchmark <strong>μ0</strong>.
          </p>
          <p>Typical use case: compare a class, clinic, or product average to a known benchmark.</p>

          <K d>{"t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}, \\quad df = n - 1"}</K>

          <p>Same as Z-test but with <em>s</em> instead of sigma. Compare against t-distribution, df = n-1.</p>
          <CW title="Live: One-Sample t-Test">
            <OneTCalc />
          </CW>

          <Worked title="Teaching Method A vs B">
            <p>Two independent classes use different teaching methods. Method A has 30 students with mean 82, Method B has 30 students with mean 78.</p>
            <St n="1">
              Use a <strong>two-sample t-test</strong> because the groups are separate and each group has its own spread.
            </St>
            <St n="2">
              Welch&apos;s version is the safe default when standard deviations can differ.
            </St>
            <St n="3">
              The question is whether the observed mean gap is large relative to the combined standard error.
            </St>
          </Worked>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "24px 0 8px" }}>Two-Sample t-Test</h3>

          <p>Do two unrelated groups have different means?</p>
          <p>
            Under <strong>H0</strong>, the two population means are equal, so the expected difference
            <strong> μ1 - μ2</strong> is <strong>0</strong>.
          </p>

          <K d>{"t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}"}</K>

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

          <Worked title="Blood Pressure Before vs After Treatment">
            <p>Ten patients are measured before treatment and again four weeks later. Each patient acts as their own control.</p>
            <St n="1">
              Use a <strong>paired t-test</strong> because the measurements come in matched before/after pairs.
            </St>
            <St n="2">
              First convert each patient into one difference score, then test whether the mean difference is far from zero.
            </St>
            <St n="3">
              Pairing removes between-person noise, so it is usually more powerful than pretending the samples are independent.
            </St>
          </Worked>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "24px 0 8px" }}>Paired t-Test</h3>

          <p>Before/after or matched data. Same subject in both conditions.</p>
          <p>
            Under <strong>H0</strong>, the mean of the within-pair differences is <strong>0</strong>.
          </p>

          <K d>{"t = \\frac{\\bar{d}}{s_d / \\sqrt{n}}, \\quad df = n - 1"}</K>

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

          <Remember>Same as z-test but with s instead of σ. Fatter tails protect you with small samples.</Remember>
        </section>

        <section id="ab-test" className="tutorial-section" tabIndex={-1}>
          <SH n="6" t="A/B Testing" s="Comparing two conversion rates" />

          <p>
            Each visitor converts or doesn't. That's a <strong>Bernoulli trial</strong>.
          </p>

          <p>For large samples, proportions are approximately normal with variance p(1-p), so z-based tests are used.</p>
          <p>Because proportion variance is determined by p(1-p), the large-sample test statistic is naturally z-based.</p>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>The Pooled Proportion</h3>

          <p>H0 says both groups have the same rate. We estimate that shared rate by pooling:</p>
          <K d>{"\\hat{p}_{\\text{pool}} = \\frac{x_A + x_B}{n_A + n_B}"}</K>

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

          <DD title="Why pooling works">
            <ComparisonCard
              observedLabel="Observed difference"
              observedValue="p̂B - p̂A"
              nullLabel="Null difference"
              nullValue="0"
              noiseLabel="Pooled standard error"
              noiseValue="√[ p(1-p)(1/n1 + 1/n2) ]"
              statLine="z = (p̂B - p̂A) / pooled SE"
            />
          </DD>

          <h3 style={{ fontFamily: "var(--h)", fontSize: 20, margin: "20px 0 8px" }}>The Full Formula</h3>
          <K d>{"z = \\frac{\\hat{p}_B - \\hat{p}_A}{\\sqrt{\\hat{p}(1-\\hat{p})\\left(\\frac{1}{n_A}+\\frac{1}{n_B}\\right)}}"}</K>

          <DD title="Deriving the A/B test standard error">
            <St n="1">
              <strong>A proportion is a mean.</strong> Each user outcome is 0 or 1, so <K>{"\\hat{p} = \\bar{X}"}</K>. We can use the SE formula for a mean.
            </St>
            <St n="2">
              <strong>Bernoulli variance.</strong> For a 0/1 variable with probability <K>{"p"}</K>:
              <K d>{"\\text{Var}(X) = p(1-p)"}</K>
              Largest at <K>{"p=0.5"}</K>, zero at 0 or 1.
            </St>
            <St n="3">
              <strong>SE of one proportion.</strong> Plug Bernoulli variance into <K>{"SE = \\sigma/\\sqrt{n}"}</K>:
              <K d>{"SE(\\hat{p}) = \\sqrt{\\frac{p(1-p)}{n}}"}</K>
            </St>
            <St n="4">
              <strong>SE of the difference.</strong> If A and B are independent:
              <K d>{"\\text{Var}(\\hat{p}_B - \\hat{p}_A) = \\frac{p(1-p)}{n_A} + \\frac{p(1-p)}{n_B} = p(1-p)\\left(\\frac{1}{n_A}+\\frac{1}{n_B}\\right)"}</K>
            </St>
            <St n="5">
              <strong>Why use the pooled estimate?</strong> Under <K>{"H_0: p_A = p_B = p"}</K>, there is one shared probability. We don't know it, so we estimate it with <K>{"\\hat{p}_{\\text{pool}}"}</K> from all the data.
            </St>
          </DD>

          <Worked title="Checkout Button: Blue vs. Green">
            <p>Blue: 1000 visitors, 120 converts (12%). Green: 1000, 148 converts (14.8%).</p>
            <St n="1">
              Pooled p = 268/2000 = <strong>0.134</strong>
            </St>
            <St n="2">
              SE = sqrt(0.134 x 0.866 x 0.002) = <strong>0.01523</strong>
            </St>
            <St n="3">
              Z = 0.028/0.01523 = <strong>1.838</strong>. p = 0.066. <strong>Not significant.</strong>
            </St>
          </Worked>

          <Confusion title="Confusion: 'My A/B test proved the button caused more sales'">
            <p>A/B tests with proper randomization <em>can</em> support causal claims - that's their strength.</p>

            <p>But only if done right. Watch for: unequal traffic splits, peeking at results early, external events affecting one group, or the test running during an unusual period.</p>

            <p>
              <strong>Observational data</strong> (not randomized) can NEVER prove causation, no matter how significant the p-value. Correlation ≠ causation. Ice cream sales and drownings are both correlated with summer, not with each other.
            </p>

            <p>If you can't randomize, you can only say "associated with," not "caused by."</p>
          </Confusion>

          <DD title="Common A/B testing mistakes">
            <p>
              <strong>Peeking:</strong> Checking daily and stopping when p&lt;0.05. Use fixed sample size or sequential testing.
            </p>

            <p>
              <strong>Too small:</strong> Required sample size depends on baseline rate, effect size, alpha, power, and traffic split. Some tests need thousands per group, but not all of them do.
            </p>

            <p>
              <strong>Winner's curse:</strong> The estimated effect of a "winner" is usually inflated.
            </p>
          </DD>

          <CW title="Live: A/B Test Calculator">
            <ABCalc />
          </CW>

          <Remember>Two-proportion z-test. Pool under H₀. Watch for peeking and winner's curse.</Remember>
        </section>

        <section id="wrong-test" className="tutorial-section" tabIndex={-1}>
          <SH n="7" t="Wrong Test, Wrong Answer" s="What happens when you pick incorrectly" />

          <Danger title="Z-test when sigma is unknown (n=12)">
            <p>You use Z critical ±1.96. Correct: t critical ±2.201.</p>

            <p>
              <strong>Impact:</strong> ~50% more false positives than expected.
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

          <Remember>Wrong test → wrong answer. Check: do you know σ? Are groups paired? How many comparisons?</Remember>
        </section>



        <section id="assumptions" className="tutorial-section" tabIndex={-1}>
          <SH n="8" t="Assumptions" s="What to check and what to do when they fail" />

          <div style={{ overflowX: "auto", margin: "14px 0" }}>
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.accent}` }}>
                  {["Assumption", "If violated...", "Fix"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--m)", fontSize: 11, color: C.muted, textTransform: "uppercase" }}>
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
                  ["Unbalanced design", "Main effects can be harder to interpret", "Use planned contrasts or a model that matches the design"],
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

        <section id="beyond-p" className="tutorial-section" tabIndex={-1}>
          <SH n="9" t="Beyond p-Values" s="What else you need to report" />

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
              <strong>Statistical significance ≠ practical importance.</strong> Always check effect size.
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

          <Remember>Always report effect size and CI alongside the p-value.</Remember>
        </section>

        <section id="decision" className="tutorial-section" tabIndex={-1}>
          <SH n="10" t="Decision Guide" s="Which test should you use?" />
          <div style={{ overflowX: "auto", margin: "14px 0" }}>
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.accent}` }}>
                  {["Situation", "Data", "Groups", "Test"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--m)", fontSize: 11, color: C.muted, textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  ["Mean vs. benchmark", "Continuous, σ known", "1", "Z-test"],
                  ["Mean vs. benchmark", "Continuous, σ unknown", "1", "One-sample t"],
                  ["Two conversion rates", "Binary (Bernoulli)", "2", "A/B test (Z)"],
                  ["Two independent means", "Continuous", "2", "Two-sample t"],
                  ["Before/after", "Continuous (paired)", "2", "Paired t"],
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

          <DD title="Practical workflow">
            <CoreCard title="Practical workflow" a={C.green} bg={C.greenLt} style={{ marginBottom: 0 }}>
              <St n="1">Identify the variable type and study design.</St>
              <St n="2">Choose the matching test.</St>
              <St n="3">Compute the test statistic.</St>
              <St n="4">Get the p-value or compare with a critical value.</St>
              <St n="5">State the decision: reject H0 or fail to reject H0.</St>
              <St n="6">Report effect size, confidence interval, and key assumptions.</St>
            </CoreCard>
          </DD>

          <DD title="Decision tree reference">
            <Card style={{ background: C.codeBg, marginBottom: 0 }}>
              <div style={{ fontFamily: "var(--m)", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre", overflowX: "auto" }}>{`Central Limit Theorem

|

|- Binary data (Bernoulli)

|  |- Z-test for proportions (A/B test)

|       |- Uses pooled proportion under H0

|

|- Continuous data, σ known

|  |- Z-test

|

|- Continuous data, σ unknown

   |- One-sample t-test

   |- Two-sample t-test (Welch's)

   |- Paired t-test`}</div>
            </Card>
          </DD>

          <div style={{ marginTop: 28, padding: "22px 18px", background: `linear-gradient(135deg,${C.accentLt} 0%,${C.blueLt} 100%)`, borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--h)", fontSize: 20, marginBottom: 8 }}>The Unifying Idea</div>
            <p style={{ maxWidth: 500, margin: "0 auto", fontSize: 15, lineHeight: 1.75 }}>
              Every test computes: <em>(signal - expected) / noise.</em>
              <br />
              More data → less noise → easier to spot real effects.
              <br />
              Z and t are just different rulers for "how surprising is this?"
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
