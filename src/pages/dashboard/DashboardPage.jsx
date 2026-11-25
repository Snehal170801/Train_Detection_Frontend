// src/pages/dashboard/DashboardPage.jsx
// AMS · Dashboard · v4 — Custom SVG animated charts, premium RED theme
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDashboardStats } from "../../hooks/useDashboardStats";

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  red: "#C8102E",
  red2: "#E8192C",
  redDark: "#8B0015",
  redSoft: "#FFF0F2",
  redMid: "#FFD6DA",
  navy: "#0F172A",
  navyMid: "#1E293B",
  slate: "#64748B",
  muted: "#94A3B8",
  border: "#F1F5F9",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  green: "#10B981",
  amber: "#F59E0B",
};
const PIE_COLORS = [
  "#C8102E",
  "#E8192C",
  "#FF4D6D",
  "#FF7A8A",
  "#FFB3BE",
  "#FFD6DA",
];

// ── Formatting helpers ──────────────────────────────────────────────────────
function money(n) {
  const v = Number(n) || 0;
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
function shortDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const BADGE_CFG = {
  Active: { bg: "#DCFCE7", color: "#15803D" },
  Scheduled: { bg: "#FFF0F2", color: "#C8102E" },
  Due: { bg: "#FEF9C3", color: "#A16207" },
  Scrap: { bg: "#F1F5F9", color: "#64748B" },
  Disposed: { bg: "#F1F5F9", color: "#64748B" },
  "In Repair": { bg: "#EDE9FE", color: "#6D28D9" },
  Open: { bg: "#FEF9C3", color: "#A16207" },
  InProgress: { bg: "#DBEAFE", color: "#1D4ED8" },
  Resolved: { bg: "#DCFCE7", color: "#15803D" },
  Rejected: { bg: "#FEE2E2", color: "#B91C1C" },
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useCountUp(target, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf,
      t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setV(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}
// Measures the real gap between this element and the page's scrollable
// container (`.ams-main`) and cancels it with negative margins — self-corrects
// for however many nested padded wrappers sit between them (sidebar width,
// layout padding, etc.) instead of guessing a hardcoded pixel offset.
function useFullBleed() {
  const ref = useRef(null);
  const [margins, setMargins] = useState({});
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      const main = document.querySelector(".ams-main");
      if (!el || !main) return;
      const elRect = el.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      setMargins({
        marginLeft: mainRect.left - elRect.left,
        marginRight: elRect.right - mainRect.right,
      });
    };
    measure();
    const t = setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return [ref, margins];
}
function useAnimValue(active, duration = 900, delay = 0) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf,
      t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0 - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const prog = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setP(eased);
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, delay]);
  return p;
}
// Like useAnimValue but for a variable-length, staggered array of bars — a
// single hook call regardless of item count (safe for hook-count stability
// when `count` can change between renders, e.g. as API data loads in).
function useStaggeredAnim(count, active, duration = 700, stagger = 70) {
  const [progress, setProgress] = useState(() => new Array(count).fill(0));
  useEffect(() => {
    if (!active || count === 0) return;
    let raf;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const next = [];
      let allDone = true;
      for (let i = 0; i < count; i++) {
        const elapsed = ts - t0 - i * stagger;
        if (elapsed < 0) {
          next.push(0);
          allDone = false;
          continue;
        }
        const prog = Math.min(elapsed / duration, 1);
        next.push(1 - Math.pow(1 - prog, 3));
        if (prog < 1) allDone = false;
      }
      setProgress(next);
      if (!allDone) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, count, duration, stagger]);
  return progress;
}

// ── Small atoms ───────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const c = BADGE_CFG[status] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};
const SH = ({ title, sub, action, to }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    }}
  >
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div
          style={{
            width: 3,
            height: 18,
            borderRadius: 2,
            background: `linear-gradient(180deg,${T.red},${T.red2})`,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: T.navy,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </span>
      </div>
      {sub && (
        <p
          style={{
            margin: "3px 0 0 12px",
            fontSize: 11,
            color: T.muted,
            fontWeight: 500,
          }}
        >
          {sub}
        </p>
      )}
    </div>
    {action && to && (
      <Link
        to={to}
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.red,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        {action} →
      </Link>
    )}
    {action && !to && (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.red,
          cursor: "pointer",
        }}
      >
        {action} →
      </span>
    )}
  </div>
);
const Card = ({ children, style = {}, delay = 0, noPad = false }) => (
  <div
    style={{
      background: T.white,
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      boxShadow:
        "0 1px 3px rgba(15,23,42,0.04), 0 6px 24px rgba(15,23,42,0.05)",
      padding: noPad ? 0 : "22px 24px",
      animation: "ams-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
      animationDelay: `${delay}ms`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);
const EmptyChartState = ({ loading, icon = "◎", label = "No data yet" }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: T.redSoft,
        color: T.red,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        opacity: loading ? 0.6 : 1,
        animation: loading ? "ams-pulse 1.4s ease-in-out infinite" : "none",
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>
      {loading ? "Loading live data…" : label}
    </span>
  </div>
);
// Same visual language for empty table sections (spans full width, sits inside <tbody>)
const EmptyTableRow = ({
  colSpan,
  loading,
  icon = "◎",
  label = "No data yet",
}) => (
  <tr>
    <td colSpan={colSpan} style={{ padding: "40px 16px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: T.redSoft,
            color: T.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            opacity: loading ? 0.6 : 1,
            animation: loading ? "ams-pulse 1.4s ease-in-out infinite" : "none",
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>
          {loading ? "Loading live data…" : label}
        </span>
      </div>
    </td>
  </tr>
);
// Fallback for the ticket-trend card when there's too little monthly
// spread to draw a line — shows the actual tickets instead of empty space.
const RecentTicketsList = ({ tickets }) => (
  <div
    style={{
      width: "100%",
      maxHeight: 290,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      paddingRight: 4,
    }}
  >
    {tickets.map((t) => (
      <div
        key={t.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${T.border}`,
          background: "#FAFAFA",
        }}
      >
        <span className="ams-id">{t.id}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: T.navyMid,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t.name}
          </div>
          <div style={{ fontSize: 11, color: T.muted }}>
            {t.by} · {t.last}
          </div>
        </div>
        <Badge status={t.status} />
      </div>
    ))}
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ k, delay, selected, onSelect }) {
  const count = useCountUp(k.value);
  const [hov, setHov] = useState(false);
  const dark = selected;
  const bg = selected ? `linear-gradient(145deg,#C8102E,#8B0015)` : T.white;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onSelect}
      style={{
        position: "relative",
        background: bg,
        borderRadius: 16,
        padding: "20px 20px 18px",
        border: dark ? "none" : `1px solid ${T.border}`,
        boxShadow: hov
          ? dark
            ? "0 16px 48px rgba(200,16,46,0.45)"
            : "0 10px 36px rgba(15,23,42,0.12)"
          : dark
            ? "0 6px 24px rgba(200,16,46,0.28)"
            : "0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)",
        transform: hov
          ? "translateY(-5px) scale(1.015)"
          : "translateY(0) scale(1)",
        transition:
          "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease, background 0.3s ease",
        animation: `ams-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${delay}ms`,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {dark && (
        <>
          <div
            style={{
              position: "absolute",
              right: -22,
              top: -22,
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 18,
              bottom: -28,
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />
        </>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.7,
            textTransform: "uppercase",
            color: dark ? "rgba(255,255,255,0.6)" : T.muted,
            lineHeight: 1.4,
            maxWidth: "70%",
            transition: "color 0.3s",
          }}
        >
          {k.label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            background: dark ? "rgba(255,255,255,0.15)" : T.redSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: dark ? "#fff" : T.red,
            transition: "background 0.3s, color 0.3s",
          }}
        >
          {k.icon}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1,
            color: dark ? "#fff" : T.navy,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -1,
            transition: "color 0.3s",
          }}
        >
          {k.prefix}
          {count.toLocaleString()}
        </span>
        {k.trend != null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 5,
              color: k.up ? T.green : dark ? "#FFB3BE" : T.red,
            }}
          >
            {k.up ? "▲" : "▼"} {k.trend}%
          </span>
        )}
      </div>
      {k.sub && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: dark ? "rgba(255,255,255,0.5)" : T.muted,
            transition: "color 0.3s",
          }}
        >
          {k.sub}
        </span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RING CHART — Asset Distribution (thick rounded-stroke donut, draws itself)
// ══════════════════════════════════════════════════════════════════════════════
function RingSegment({ r, cx, cy, color, strokeWidth, length, offset, circumference, visible, delay, isHovered, dimmed, onHover, name }) {
  const p = useAnimValue(visible, 900, delay);
  const drawn = length * p;
  const gap = length > 4 ? 3 : 0; // small breathing room between rounded caps
  const w = isHovered ? strokeWidth + 6 : strokeWidth;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeDasharray={`${Math.max(drawn - gap, 0)} ${circumference}`}
      strokeDashoffset={-offset}
      strokeLinecap="round"
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      style={{
        cursor: "pointer",
        opacity: dimmed ? 0.35 : 1,
        filter: `drop-shadow(0 2px ${isHovered ? 10 : 6}px ${color}${isHovered ? "99" : "55"})`,
        transition: "stroke-width 0.2s, opacity 0.2s, filter 0.2s",
      }}
    />
  );
}

function AnimatedRingChart({ data, visible, centerValue, centerLabel, colors, size = 190, hovered, onHover }) {
  const strokeWidth = 26;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const length = (d.pct / 100) * circumference;
    const seg = { name: d.name, pct: d.pct, count: d.count, length, offset: cumulative, color: colors[i] };
    cumulative += length;
    return seg;
  });

  const hoveredSeg = segments.find((s) => s.name === hovered);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segments.map((s, i) => (
          <RingSegment
            key={s.name}
            r={r}
            cx={cx}
            cy={cy}
            color={s.color}
            strokeWidth={strokeWidth}
            length={s.length}
            offset={s.offset}
            circumference={circumference}
            visible={visible}
            delay={i * 150}
            name={s.name}
            isHovered={hovered === s.name}
            dimmed={hovered !== null && hovered !== s.name}
            onHover={onHover}
          />
        ))}
      </g>
      {hoveredSeg ? (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={26} fontWeight={900} fill={hoveredSeg.color} fontFamily="DM Sans,sans-serif">
            {hoveredSeg.pct}%
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fontWeight={700} letterSpacing={0.3} fill={T.muted} fontFamily="DM Sans,sans-serif">
            {hoveredSeg.name.length > 12 ? hoveredSeg.name.slice(0, 11) + "…" : hoveredSeg.name}
          </text>
        </>
      ) : (
        <>
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fontSize={30}
            fontWeight={900}
            fill={T.navy}
            fontFamily="DM Sans,sans-serif"
            style={{ transition: "opacity 0.15s" }}
          >
            {centerValue}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            fontSize={10.5}
            fontWeight={700}
            letterSpacing={0.6}
            fill={T.muted}
            fontFamily="DM Sans,sans-serif"
          >
            {centerLabel}
          </text>
        </>
      )}
    </svg>
  );
}

// ── Legend row shown beside the ring ────────────────────────────────────────
function CategoryLegendCard({ d, color, hovered, onHover }) {
  const dimmed = hovered !== null && hovered !== d.name;
  return (
    <div
      onMouseEnter={() => onHover(d.name)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        background: "#FAFAFA",
        border: `1px solid ${hovered === d.name ? color : "transparent"}`,
        opacity: dimmed ? 0.5 : 1,
        transition: "opacity 0.2s, border-color 0.2s",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.5,
            color: T.navyMid,
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {d.name}
        </div>
        <div style={{ fontSize: 10.5, color: T.muted }}>
          {d.count} asset{d.count === 1 ? "" : "s"} · {d.val}
        </div>
      </div>
      <span style={{ fontSize: 14, color, fontWeight: 800, flexShrink: 0 }}>
        {d.pct}%
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM ANIMATED BAR CHART
// Each bar grows from the bottom with a stagger, shimmer sweep, glow, label pop
// ══════════════════════════════════════════════════════════════════════════════
function AnimatedBarChart({ data, visible }) {
  const W = 100,
    PAD_L = 48,
    PAD_B = 32,
    PAD_T = 40,
    PAD_R = 16;
  const BAR_GAP = 4;
  const maxV = Math.max(...data.map((d) => d.v));
  const n = data.length;

  // One animValue per bar — staggered
  const anim0 = useAnimValue(visible, 800, 0);
  const anim1 = useAnimValue(visible, 800, 80);
  const anim2 = useAnimValue(visible, 800, 160);
  const anim3 = useAnimValue(visible, 800, 240);
  const anim4 = useAnimValue(visible, 800, 320);
  const anim5 = useAnimValue(visible, 800, 400);
  const anims = [anim0, anim1, anim2, anim3, anim4, anim5];

  // Label fade — appears after bar is ~80% grown
  const lbl0 = useAnimValue(visible, 400, 600);
  const lbl1 = useAnimValue(visible, 400, 680);
  const lbl2 = useAnimValue(visible, 400, 760);
  const lbl3 = useAnimValue(visible, 400, 840);
  const lbl4 = useAnimValue(visible, 400, 920);
  const lbl5 = useAnimValue(visible, 400, 1000);
  const lbls = [lbl0, lbl1, lbl2, lbl3, lbl4, lbl5];

  const [hov, setHov] = useState(null);

  // SVG is purely responsive via viewBox
  const vW = 520,
    vH = 240;
  const chartW = vW - PAD_L - PAD_R;
  const chartH = vH - PAD_B - PAD_T;
  const slotW = chartW / n;
  const barW = slotW - BAR_GAP * 2 - 8;

  // Y-axis grid lines
  const yTicks = [0, 0.33, 0.66, 1].map((f) => Math.round(maxV * f));

  return (
    <svg
      viewBox={`0 0 ${vW} ${vH}`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Bar gradient */}
        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8192C" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF8096" stopOpacity="0.85" />
        </linearGradient>
        {/* Hover gradient — brighter */}
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF4D6D" stopOpacity="1" />
        </linearGradient>
        {/* Shimmer mask gradient */}
        <linearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.35" />
          <stop offset="55%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="chartClip">
          <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t) => {
        const y = PAD_T + chartH - (t / maxV) * chartH;
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              y1={y}
              x2={vW - PAD_R}
              y2={y}
              stroke={t === 0 ? "#E2E8F0" : "#F1F5F9"}
              strokeWidth={t === 0 ? 1.5 : 1}
            />
            <text
              x={PAD_L - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#CBD5E1"
              fontFamily="DM Sans,sans-serif"
              fontWeight={600}
            >
              {t >= 1000 ? `${t / 1000}k` : t}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const p = anims[i];
        const barH = (d.v / maxV) * chartH * p;
        const x = PAD_L + i * slotW + BAR_GAP + 4;
        const y = PAD_T + chartH - barH;
        const isHov = hov === i;
        const shimmerX = x + barW * (p * 1.8 - 0.9);

        return (
          <g
            key={d.dept}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Hover background glow zone */}
            {isHov && (
              <rect
                x={x - 4}
                y={PAD_T}
                width={barW + 8}
                height={chartH}
                fill={T.redSoft}
                rx={10}
                opacity={0.7}
              />
            )}

            {/* Bar body */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, 0)}
              fill={isHov ? "url(#bg2)" : "url(#bg1)"}
              rx={isHov ? 10 : 8}
              filter={isHov ? "url(#barGlow)" : undefined}
              style={{ transition: "rx 0.15s, filter 0.15s" }}
            />

            {/* Shimmer sweep on bar surface — moves as bar grows */}
            {p > 0 && p < 0.98 && barH > 10 && (
              <rect
                x={shimmerX - 12}
                y={y}
                width={24}
                height={barH}
                fill="url(#shimmerGrad)"
                rx={8}
                clipPath="url(#chartClip)"
                opacity={0.7}
                style={{ pointerEvents: "none" }}
              />
            )}

            {/* Top cap highlight line */}
            {barH > 4 && (
              <rect
                x={x + 3}
                y={y}
                width={barW - 6}
                height={3}
                fill="rgba(255,255,255,0.5)"
                rx={2}
              />
            )}

            {/* Value label above bar */}
            <text
              x={x + barW / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={isHov ? T.red : "#94A3B8"}
              fontFamily="DM Sans,sans-serif"
              opacity={lbls[i]}
              style={{ transition: "fill 0.15s" }}
            >
              {d.label}
            </text>

            {/* X-axis label */}
            <text
              x={x + barW / 2}
              y={PAD_T + chartH + 18}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill={isHov ? T.red : "#94A3B8"}
              fontFamily="DM Sans,sans-serif"
              style={{ transition: "fill 0.15s" }}
            >
              {d.dept}
            </text>

            {/* Hover tooltip bubble */}
            {isHov && (
              <g>
                <rect
                  x={x + barW / 2 - 32}
                  y={y - 44}
                  width={64}
                  height={26}
                  rx={8}
                  fill={T.navy}
                />
                <polygon
                  points={`${x + barW / 2 - 6},${y - 18} ${x + barW / 2 + 6},${y - 18} ${x + barW / 2},${y - 10}`}
                  fill={T.navy}
                />
                <text
                  x={x + barW / 2}
                  y={y - 26}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#FF8096"
                  fontFamily="DM Sans,sans-serif"
                >
                  {d.v.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMBO CHART — bars (total) + overlaid animated line (active), shared scale
// Used for "Employees by Department": total headcount as bars, active as line
// ══════════════════════════════════════════════════════════════════════════════
function AnimatedComboChart({ data, visible }) {
  const pathRef = useRef(null);
  const assetsPathRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);
  const [assetsPathLen, setAssetsPathLen] = useState(0);
  const [hov, setHov] = useState(null);
  const hasAssets = data.some((d) => d.assets != null);

  const vW = 1000, vH = 260;
  const PAD_L = 56, PAD_R = 20, PAD_T = 24, PAD_B = 42;
  const chartW = vW - PAD_L - PAD_R;
  const chartH = vH - PAD_T - PAD_B;
  const n = data.length;
  const maxV = Math.max(...data.map((d) => Math.max(d.total, d.assets ?? 0)), 1);
  const slotW = chartW / n;
  const barW = Math.min(slotW * 0.55, 90);

  const barAnims = useStaggeredAnim(n, visible, 700, 70);
  const lineAnim = useAnimValue(visible, 1100, 200);
  const assetsLineAnim = useAnimValue(visible, 1100, 350);

  // Lines run edge-to-edge (first point at PAD_L, last at PAD_L+chartW) —
  // bars stay centered in their own slots, same as the other charts' line.
  const xAt = (i) => (n > 1 ? PAD_L + (i / (n - 1)) * chartW : PAD_L + chartW / 2);
  const pts = data.map((d, i) => ({ x: xAt(i), y: PAD_T + chartH - (d.active / maxV) * chartH }));
  const assetsPts = data.map((d, i) => ({ x: xAt(i), y: PAD_T + chartH - ((d.assets ?? 0) / maxV) * chartH }));
  const smooth = (p) =>
    p.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = p[i - 1];
      const cpx = (prev.x + pt.x) / 2;
      return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`;
    }, "");
  const pathD = smooth(pts);
  const assetsPathD = smooth(assetsPts);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
    if (assetsPathRef.current) setAssetsPathLen(assetsPathRef.current.getTotalLength());
  }, [data]);

  const yTicks = [0, 0.5, 1].map((f) => Math.round(maxV * f));

  return (
    <svg viewBox={`0 0 ${vW} ${vH}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="comboBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8192C" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF8096" stopOpacity="0.85" />
        </linearGradient>
        <filter id="comboLineGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="comboAssetsGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {yTicks.map((t) => {
        const y = PAD_T + chartH - (t / maxV) * chartH;
        const label = String(t);
        const boxW = Math.max(label.length * 7 + 12, 26);
        return (
          <g key={t}>
            <line x1={PAD_L} y1={y} x2={vW - PAD_R} y2={y} stroke={t === 0 ? "#E2E8F0" : "#F1F5F9"} strokeWidth={t === 0 ? 1.5 : 1} />
            <rect x={PAD_L - 14 - boxW} y={y - 10} width={boxW} height={20} rx={6} fill="#F8FAFC" stroke="#F1F5F9" strokeWidth={1} />
            <text x={PAD_L - 14 - boxW / 2} y={y + 4} textAnchor="middle" fontSize={10.5} fill={T.slate} fontFamily="DM Sans,sans-serif" fontWeight={700}>{t}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const p = barAnims[i];
        const barH = (d.total / maxV) * chartH * p;
        const x = PAD_L + i * slotW + (slotW - barW) / 2;
        const y = PAD_T + chartH - barH;
        const isHov = hov === i;
        const tagText = `${d.label}  ${d.total}`;
        const tagW = Math.max(tagText.length * 6.2 + 16, 46);
        return (
          <g key={d.label} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 0)} fill="url(#comboBarGrad)" rx={8} opacity={isHov ? 1 : 0.9} />
            <rect
              x={x + barW / 2 - tagW / 2}
              y={PAD_T + chartH + 8}
              width={tagW}
              height={20}
              rx={10}
              fill={isHov ? T.red : "#F8FAFC"}
              stroke={isHov ? T.red : "#F1F5F9"}
              strokeWidth={1}
            />
            <text
              x={x + barW / 2}
              y={PAD_T + chartH + 21.5}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={700}
              fill={isHov ? "#fff" : T.slate}
              fontFamily="DM Sans,sans-serif"
            >
              {d.label} <tspan fontWeight={900}>{d.total}</tspan>
            </text>
            {isHov && (
              <g>
                <rect x={x + barW / 2 - 46} y={y - (hasAssets ? 58 : 46)} width={92} height={hasAssets ? 42 : 30} rx={8} fill={T.navy} />
                <text x={x + barW / 2} y={y - (hasAssets ? 42 : 30)} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#FF8096" fontFamily="DM Sans,sans-serif">
                  {d.total} total
                </text>
                <text x={x + barW / 2} y={y - (hasAssets ? 30 : 18)} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#86EFAC" fontFamily="DM Sans,sans-serif">
                  {d.active} active
                </text>
                {hasAssets && (
                  <text x={x + barW / 2} y={y - 18} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#FCD34D" fontFamily="DM Sans,sans-serif">
                    {d.assets} assets
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}

      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={T.green}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen || 9999}
        strokeDashoffset={pathLen ? pathLen * (1 - lineAnim) : 9999}
        style={{ filter: "drop-shadow(0 2px 5px rgba(16,185,129,0.4))" }}
      />
      {pts.map((pt, i) => (
        lineAnim > (i + 0.5) / n && (
          <circle key={i} cx={pt.x} cy={pt.y} r={hov === i ? 6 : 4.5} fill="#fff" stroke={T.green} strokeWidth={2.5} filter="url(#comboLineGlow)" />
        )
      ))}

      {hasAssets && (
        <>
          <path
            ref={assetsPathRef}
            d={assetsPathD}
            fill="none"
            stroke={T.amber}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={assetsPathLen || 9999}
            strokeDashoffset={assetsPathLen ? assetsPathLen * (1 - assetsLineAnim) : 9999}
            style={{ filter: "drop-shadow(0 2px 5px rgba(245,158,11,0.4))" }}
          />
          {assetsPts.map((pt, i) => (
            assetsLineAnim > (i + 0.5) / n && (
              <circle key={i} cx={pt.x} cy={pt.y} r={hov === i ? 6 : 4.5} fill="#fff" stroke={T.amber} strokeWidth={2.5} filter="url(#comboAssetsGlow)" />
            )
          ))}
        </>
      )}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MULTI-WAVE CHART — Total Assets, one colored wave per category across
// departments. Each series draws itself in with its own stagger delay.
// ══════════════════════════════════════════════════════════════════════════════
function AnimatedMultiWave({ labels, series, visible }) {
  const refs = useRef([]);
  const [lens, setLens] = useState([]);
  const [hovIdx, setHovIdx] = useState(null);

  const vW = 400, vH = 220;
  const PAD_L = 34, PAD_R = 12, PAD_T = 16, PAD_B = 26;
  const chartW = vW - PAD_L - PAD_R;
  const chartH = vH - PAD_T - PAD_B;
  const n = labels.length;
  const maxV = Math.max(...series.flatMap((s) => s.values), 1);
  const xAt = (i) => (n > 1 ? PAD_L + (i / (n - 1)) * chartW : PAD_L + chartW / 2);

  const smooth = (pts) =>
    pts.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + pt.x) / 2;
      return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`;
    }, "");

  const seriesPts = series.map((s) => s.values.map((v, i) => ({ x: xAt(i), y: PAD_T + chartH - (v / maxV) * chartH })));
  const seriesPathD = seriesPts.map(smooth);

  useEffect(() => {
    setLens(refs.current.map((r) => (r ? r.getTotalLength() : 0)));
  }, [series]);

  const anims = useStaggeredAnim(series.length, visible, 1100, 180);

  return (
    <svg viewBox={`0 0 ${vW} ${vH}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
      {[0, 0.5, 1].map((f) => {
        const y = PAD_T + chartH - f * chartH;
        return <line key={f} x1={PAD_L} y1={y} x2={vW - PAD_R} y2={y} stroke="#F1F5F9" strokeWidth={1} />;
      })}
      {seriesPathD.map((d, si) => {
        const len = lens[si] || 0;
        const p = anims[si] || 0;
        const dimmed = hovIdx !== null && hovIdx !== si;
        return (
          <path
            key={series[si].name}
            ref={(el) => (refs.current[si] = el)}
            d={d}
            fill="none"
            stroke={series[si].color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={len || 9999}
            strokeDashoffset={len ? len * (1 - p) : 9999}
            opacity={dimmed ? 0.25 : 1}
            style={{ transition: "opacity 0.2s", cursor: "pointer" }}
            onMouseEnter={() => setHovIdx(si)}
            onMouseLeave={() => setHovIdx(null)}
          />
        );
      })}
      {labels.map((lb, i) => (
        <text key={lb} x={xAt(i)} y={vH - 6} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#94A3B8" fontFamily="DM Sans,sans-serif">
          {lb.length > 6 ? lb.slice(0, 5) + "…" : lb}
        </text>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM ANIMATED LINE / AREA CHART
// Path draws itself left-to-right, dots pop in sequence, gradient area fills up
// ══════════════════════════════════════════════════════════════════════════════
function AnimatedLineChart({ data, visible, currency = true }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const areaRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);
  const [dotPhase, setDotPhase] = useState(0); // 0–data.length

  const vW = 520,
    vH = 200;
  const PAD_L = 50,
    PAD_R = 16,
    PAD_T = 20,
    PAD_B = 32;
  const chartW = vW - PAD_L - PAD_R;
  const chartH = vH - PAD_T - PAD_B;

  const maxV = Math.max(...data.map((d) => d.v)) || 1;
  const minV = 0;
  const xDivisor = Math.max(data.length - 1, 1); // avoid /0 when there's a single point

  const pts = data.map((d, i) => ({
    x: PAD_L + (i / xDivisor) * chartW,
    y: PAD_T + chartH - ((d.v - minV) / (maxV - minV)) * chartH,
  }));

  // Smooth cubic bezier path
  const pathD = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD_T + chartH} L ${pts[0].x} ${PAD_T + chartH} Z`;

  // Measure path length after mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, []);

  // Animate path draw when visible
  const lineAnim = useAnimValue(visible, 1200, 0);
  const areaAnim = useAnimValue(visible, 1000, 300);

  // Stagger dots after line passes through them
  useEffect(() => {
    if (!visible) return;
    const timers = data.map((_, i) =>
      setTimeout(() => setDotPhase((p) => Math.max(p, i + 1)), 200 + i * 160),
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const [hov, setHov] = useState(null);

  // Y-axis ticks — evenly spaced across the actual data range
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(
    (f) => Math.round((maxV * f) / 5) * 5,
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vW} ${vH}`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C8102E" stopOpacity="0.01" />
        </linearGradient>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Clip so area only shows up to lineAnim progress */}
        <clipPath id="areaReveal">
          <rect x={PAD_L} y={0} width={chartW * areaAnim} height={vH} />
        </clipPath>
      </defs>

      {/* Grid */}
      {yTicks.map((t) => {
        const y = PAD_T + chartH - (t / maxV) * chartH;
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              y1={y}
              x2={vW - PAD_R}
              y2={y}
              stroke={t === 0 ? "#E2E8F0" : "#F1F5F9"}
              strokeWidth={t === 0 ? 1.5 : 1}
              strokeDasharray={t === 0 ? "0" : "4 4"}
            />
            <text
              x={PAD_L - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#CBD5E1"
              fontFamily="DM Sans,sans-serif"
              fontWeight={600}
            >
              {t === 0 ? "0" : currency ? `₹${t / 1000}k` : t}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={d.m}
          x={pts[i].x}
          y={PAD_T + chartH + 18}
          textAnchor="middle"
          fontSize={11}
          fill={hov === i ? T.red : "#94A3B8"}
          fontFamily="DM Sans,sans-serif"
          fontWeight={600}
          style={{ transition: "fill 0.15s" }}
        >
          {d.m}
        </text>
      ))}

      {/* Area fill — fades in with clip */}
      <path d={areaD} fill="url(#areaGrad)" clipPath="url(#areaReveal)" />

      {/* Glow duplicate (blurred) */}
      <path
        ref={areaRef}
        d={pathD}
        fill="none"
        stroke="#FF4D6D"
        strokeWidth={4}
        strokeOpacity={0.25}
        filter="url(#lineGlow)"
        style={{ pointerEvents: "none" }}
        strokeDasharray={pathLen || 9999}
        strokeDashoffset={pathLen ? pathLen * (1 - lineAnim) : 9999}
      />

      {/* Main line — draws itself */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={T.red}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen || 9999}
        strokeDashoffset={pathLen ? pathLen * (1 - lineAnim) : 9999}
        style={{
          transition: "stroke-dashoffset 0.05s",
          filter: "drop-shadow(0 2px 6px rgba(200,16,46,0.4))",
        }}
      />

      {/* Hover vertical line */}
      {hov !== null && (
        <line
          x1={pts[hov].x}
          y1={PAD_T}
          x2={pts[hov].x}
          y2={PAD_T + chartH}
          stroke="#FFD6DA"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {/* Dots — pop in staggered */}
      {pts.map((pt, i) => {
        const shown = dotPhase > i;
        const isHov = hov === i;
        return (
          <g
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Invisible hit area */}
            <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />

            {/* Outer glow ring */}
            {shown && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHov ? 14 : 10}
                fill={T.redSoft}
                opacity={isHov ? 0.9 : 0.6}
                style={{ transition: "r 0.2s, opacity 0.2s" }}
              />
            )}

            {/* Dot */}
            {shown && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHov ? 7 : 5}
                fill={isHov ? T.red : T.white}
                stroke={T.red}
                strokeWidth={2.5}
                filter={isHov ? "url(#dotGlow)" : undefined}
                style={{
                  transition: "r 0.2s, fill 0.2s",
                  animation: "ams-dotPop 0.35s cubic-bezier(0.16,1,0.3,1) both",
                }}
              />
            )}

            {/* Value label — shows on hover */}
            {isHov && shown && (
              <g>
                <rect
                  x={pt.x - 38}
                  y={pt.y - 46}
                  width={76}
                  height={26}
                  rx={8}
                  fill={T.navy}
                />
                <polygon
                  points={`${pt.x - 7},${pt.y - 20} ${pt.x + 7},${pt.y - 20} ${pt.x},${pt.y - 12}`}
                  fill={T.navy}
                />
                <text
                  x={pt.x}
                  y={pt.y - 28}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#FF8096"
                  fontFamily="DM Sans,sans-serif"
                >
                  {currency
                    ? `₹${(data[i].v / 1000).toFixed(0)}k`
                    : `${data[i].v} ticket${data[i].v === 1 ? "" : "s"}`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [pieRef, pieVis] = useInView(0.3);
  const [growthRef, growthVis] = useInView(0.3);
  const [bleedRef, bleedMargins] = useFullBleed();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [barRef, barVis] = useInView(0.3);
  const [upcomingRef, upcomingVis] = useInView(0.3);
  const [lineRef, lineVis] = useInView(0.3);
  const [selectedCard, setSelectedCard] = useState(null);
  const handleCardSelect = (id) =>
    setSelectedCard((prev) => (prev === id ? null : id));
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { data, loading, error } = useDashboardStats();

  // ── Derive each section's shape from the live API payload ──────────────────
  const KPI = useMemo(() => {
    const k = data?.kpis;
    const f = data?.finance;
    if (!k) return [];
    return [
      {
        id: "total",
        label: "Total Assets",
        value: k.total,
        icon: "▣",
        trend: null,
        up: false,
        sub: null,
      },
      {
        id: "active",
        label: "Active Assets",
        value: k.active,
        icon: "◉",
        trend: null,
        up: false,
        sub: null,
      },
      {
        id: "maint",
        label: "Under Maintenance",
        value: k.inRepair,
        icon: "⚙",
        trend: null,
        up: false,
        sub: null,
      },
      {
        id: "depts",
        label: "Total Departments",
        value: k.departmentCount,
        icon: "⊞",
        trend: null,
        up: false,
        sub: null,
      },

      {
        id: "emp_total",
        label: "Total Employees",
        value: k.totalEmployees,
        icon: "👤",
        trend: null,
        up: false,
        sub: null,
      },
      {
        id: "emp_active",
        label: "Active Employees",
        value: k.activeEmployees,
        icon: "✓",
        trend: null,
        up: true,
        sub: null,
      },
      {
        id: "emp_inactive",
        label: "Deactivated Employees",
        value: k.inactiveEmployees,
        icon: "✕",
        trend: null,
        up: false,
        sub: null,
      },
      {
        id: "value",
        label: "Total Asset Value",
        value: f?.totalAssetValue ?? 0,
        prefix: "₹",
        icon: "₹",
        trend: null,
        up: false,
        sub: null,
      },
    ];
  }, [data]);

  const categoryTotal = useMemo(
    () => (data?.categoryDistribution ?? []).reduce((s, r) => s + r.total, 0),
    [data],
  );
  const PIE_DATA = useMemo(() => {
    const rows = data?.categoryDistribution ?? [];
    const total = rows.reduce((s, r) => s + r.total, 0) || 1;
    return rows.slice(0, 6).map((r) => ({
      name: r.category_name,
      pct: Math.round((r.total / total) * 100),
      val: money(r.total_cost),
      count: r.total,
    }));
  }, [data]);

  const BAR_DATA = useMemo(() => {
    const rows = data?.departmentBars ?? [];
    return rows.slice(0, 6).map((r) => ({
      dept: r.dept_name,
      v: r.total,
      label: `${r.total}`,
    }));
  }, [data]);

  const LINE_DATA = useMemo(() => {
    const rows = data?.monthlyTicketTrend ?? [];
    return rows.map((r) => {
      const [, mm] = r.ym.split("-");
      return { m: MONTH_LABELS[Number(mm) - 1], v: r.total, dot: true };
    });
  }, [data]);

  const UPCOMING_TREND_DATA = useMemo(() => {
    const rows = data?.upcomingServicesByDept ?? [];
    return rows.slice(0, 8).map((r) => ({ m: r.dept_name, v: r.total, dot: true }));
  }, [data]);

  const EMPLOYEES_DEPT_COMBO = useMemo(() => {
    const rows = data?.employeesByDepartment ?? [];
    const assetsByDept = new Map(
      (data?.departmentBars ?? []).map((r) => [r.dept_name, r.total]),
    );
    // Backend orders largest-first; reverse so the chart reads smallest→largest
    // left to right — an ascending "moving up" trend instead of a decline.
    return rows
      .slice(0, 8)
      .reverse()
      .map((r) => ({
        label: r.dept_name,
        total: r.total,
        active: r.active,
        assets: assetsByDept.get(r.dept_name) ?? 0,
      }));
  }, [data]);

  const TOTAL_ASSETS_WAVE = useMemo(() => {
    const rows = data?.assetsByCategoryDept ?? [];
    const deptLabels = EMPLOYEES_DEPT_COMBO.map((d) => d.label);
    if (deptLabels.length === 0 || rows.length === 0) return { labels: [], series: [] };
    const categories = [...new Set(rows.map((r) => r.category_name))];
    const lookup = new Map(rows.map((r) => [`${r.category_name}::${r.dept_name}`, r.total]));
    const series = categories.slice(0, 6).map((name, i) => ({
      name,
      color: PIE_COLORS[i % PIE_COLORS.length],
      values: deptLabels.map((dept) => lookup.get(`${name}::${dept}`) ?? 0),
    }));
    return { labels: deptLabels, series };
  }, [data, EMPLOYEES_DEPT_COMBO]);


  const RECENT_TICKETS = useMemo(() => {
    const rows = data?.recentTickets ?? [];
    return rows.map((r) => ({
      id: r.ticket_code,
      name: r.asset_name,
      by: r.raised_by_name,
      last: shortDate(r.resolved_at || r.created_at),
      status: r.status,
    }));
  }, [data]);

  const SERVICES = useMemo(() => {
    const rows = data?.upcomingServices ?? [];
    return rows.map((r) => ({
      id: r.ticket_code,
      name: r.asset_name,
      by: r.raised_by_name,
      last: shortDate(r.created_at),
      cost: "—",
      status: r.status,
    }));
  }, [data]);

  const ALLOC = useMemo(() => {
    const rows = data?.assetAllocation ?? [];
    return rows.map((r, i) => ({
      sr: i + 1,
      id: r.asset_code,
      name: r.asset_name,
      emp: r.employee_name,
      dept: r.dept_name || "—",
      purchase: money(r.purchase_cost),
      current: money(r.current_book_value),
      lastSvc: shortDate(r.last_service),
      maint: r.amc_cost ? money(r.amc_cost) : "—",
      st: r.status,
    }));
  }, [data]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        .ams-dash * { box-sizing:border-box; }
        .ams-dash   { font-family:'DM Sans','Segoe UI',system-ui,sans-serif; }
        @keyframes ams-fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes ams-dotPop {
          0%   { r:0;  opacity:0; }
          60%  { r:8;  opacity:1; }
          80%  { r:4;  }
          100% { r:5;  opacity:1; }
        }
        @keyframes ams-pulse {
          0%,100%{ opacity:1; } 50%{ opacity:0.35; }
        }
        .ams-tr td { transition:background 0.12s; padding:11px 16px; font-size:12.5px; border-bottom:1px solid #FAFAFA; vertical-align:middle; }
        .ams-tr td:first-child { padding-left:24px; }
        .ams-tr td:last-child  { padding-right:24px; }
        .ams-tr:hover td { background:#FFF8F9 !important; }
        .ams-th { padding:10px 16px; text-align:left; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.7px; color:#94A3B8; white-space:nowrap; background:#F8FAFC; border-bottom:1px solid #F1F5F9; }
        .ams-th:first-child { padding-left:24px; }
        .ams-th:last-child  { padding-right:24px; }
        .ams-btn-p {
          background:linear-gradient(135deg,#C8102E,#E8192C); color:#fff; border:none;
          border-radius:10px; padding:9px 20px; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit; letter-spacing:0.2px;
          box-shadow:0 4px 16px rgba(200,16,46,0.35);
          transition:all 0.2s ease;
        }
        .ams-btn-p:hover { box-shadow:0 6px 24px rgba(200,16,46,0.5); transform:translateY(-2px); }
        .ams-btn-s {
          background:#fff; color:#64748B; border:1.5px solid #F1F5F9;
          border-radius:10px; padding:9px 18px; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit; transition:all 0.2s ease;
        }
        .ams-btn-s:hover { border-color:#C8102E; color:#C8102E; box-shadow:0 4px 14px rgba(200,16,46,0.1); }
        .ams-id  { display:inline-block; background:#FFF0F2; color:#C8102E; font-size:11px; font-weight:800; padding:3px 10px; border-radius:8px; letter-spacing:0.2px; }
        .ams-dep { display:inline-block; background:#F8FAFC; color:#64748B; font-size:11px; font-weight:700; padding:3px 10px; border-radius:8px; }
        .ams-av  { width:28px; height:28px; border-radius:9px; flex-shrink:0; background:linear-gradient(135deg,#C8102E,#FF8096); display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:900; }
      `}</style>

      <div
        className="ams-dash"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingBottom: 32,
        }}
      >
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
              fontSize: 12,
              fontWeight: 600,
              padding: "10px 16px",
              borderRadius: 10,
            }}
          >
            ⚠ {error} — showing last known data.
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "ams-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 900,
                  color: T.navy,
                  letterSpacing: -0.6,
                  lineHeight: 1,
                }}
              >
                Asset Dashboard
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: T.redSoft,
                  borderRadius: 20,
                  padding: "4px 10px",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: T.red,
                    animation: "ams-pulse 1.8s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: T.red,
                    letterSpacing: 0.8,
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: T.muted,
                fontWeight: 500,
              }}
            >
              {today}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/reports" className="ams-btn-s">
              ⬇ Export Report
            </Link>
            <Link to="/assets" className="ams-btn-p">
              + Register Asset
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {KPI.map((k, i) => (
            <StatCard
              key={k.id}
              k={k}
              delay={i * 60}
              selected={selectedCard === k.id}
              onSelect={() => handleCardSelect(k.id)}
            />
          ))}
        </div>

        {/* Donut + Animated Bar + Upcoming Services trend */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "380px 1fr 1fr",
            gap: 14,
          }}
        >
          {/* Donut */}
          <Card delay={460} style={{ display: "flex", flexDirection: "column" }}>
            <SH
              title="Asset Distribution"
              sub="By category · all active assets"
              action="View Details"
            />
            <div ref={pieRef} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              {PIE_DATA.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      filter: "drop-shadow(0 10px 24px rgba(200,16,46,0.10))",
                    }}
                  >
                    <AnimatedRingChart
                      data={PIE_DATA}
                      visible={pieVis}
                      colors={PIE_COLORS}
                      centerValue={categoryTotal.toLocaleString()}
                      centerLabel="ASSETS"
                      hovered={hoveredCategory}
                      onHover={setHoveredCategory}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {PIE_DATA.map((d, i) => (
                      <CategoryLegendCard
                        key={d.name}
                        d={d}
                        color={PIE_COLORS[i]}
                        hovered={hoveredCategory}
                        onHover={setHoveredCategory}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ minHeight: 210, width: "100%" }}>
                  <EmptyChartState loading={loading} icon="▣" label="No categorized assets yet" />
                </div>
              )}
            </div>
          </Card>

          {/* ★ Animated Bar Chart */}
          <Card delay={520}>
            <SH
              title="Assets by Department"
              sub="Grow-from-bottom · hover to explore"
              action="Full Report"
            />
            <div ref={barRef} style={{ width: "100%", height: 210 }}>
              {BAR_DATA.length > 0 ? (
                <AnimatedBarChart data={BAR_DATA} visible={barVis} />
              ) : (
                <EmptyChartState
                  loading={loading}
                  icon="⊞"
                  label="No department data yet"
                />
              )}
            </div>
          </Card>

          {/* ★ Upcoming Services by department */}
          <Card delay={540}>
            <SH
              title="Service Load by Department"
              sub="Open + in-progress tickets"
              action="View All"
              to="/operations/tickets"
            />
            <div ref={upcomingRef} style={{ width: "100%", height: 210 }}>
              {UPCOMING_TREND_DATA.length >= 2 ? (
                <AnimatedLineChart
                  data={UPCOMING_TREND_DATA}
                  visible={upcomingVis}
                  currency={false}
                />
              ) : UPCOMING_TREND_DATA.length === 1 ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 32, fontWeight: 900, color: T.navy }}>
                    {UPCOMING_TREND_DATA[0].v}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>
                    in {UPCOMING_TREND_DATA[0].m}
                  </span>
                </div>
              ) : (
                <EmptyChartState loading={loading} icon="⚙" label="No departments yet" />
              )}
            </div>
          </Card>
        </div>

        {/* ★ Employees by Department (70%) + Total Assets multi-wave (30%) — full-bleed */}
        <div ref={bleedRef} style={{ ...bleedMargins, display: "grid", gridTemplateColumns: "7fr 3fr", gap: 14 }}>
        <Card delay={550}>
          <SH
            title="Employees by Department"
            sub="Total headcount (bars) vs active employees (line)"
            action="View Users"
            to="/admin/users"
          />
          <div ref={growthRef} style={{ width: "100%", height: 280 }}>
            {EMPLOYEES_DEPT_COMBO.length > 0 ? (
              <AnimatedComboChart data={EMPLOYEES_DEPT_COMBO} visible={growthVis} />
            ) : (
              <EmptyChartState loading={loading} icon="👤" label="No employees yet" />
            )}
          </div>
          {EMPLOYEES_DEPT_COMBO.length > 0 && (
            <div style={{ display: "flex", gap: 20, marginTop: 8, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: T.red }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.slate }}>Total Employees</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 14, height: 3, borderRadius: 2, background: T.green }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.slate }}>Active Employees</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 14, height: 3, borderRadius: 2, background: T.amber }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.slate }}>Assets in Department</span>
              </div>
            </div>
          )}
        </Card>

        <Card delay={560}>
          <SH
            title="Total Assets"
            sub="One wave per category, across departments"
          />
          <div style={{ width: "100%", height: 220 }}>
            {TOTAL_ASSETS_WAVE.series.length > 0 ? (
              <AnimatedMultiWave
                labels={TOTAL_ASSETS_WAVE.labels}
                series={TOTAL_ASSETS_WAVE.series}
                visible={growthVis}
              />
            ) : (
              <EmptyChartState loading={loading} icon="▣" label="No asset data yet" />
            )}
          </div>
          {TOTAL_ASSETS_WAVE.series.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, justifyContent: "center" }}>
              {TOTAL_ASSETS_WAVE.series.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 12, height: 2.5, borderRadius: 2, background: s.color }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: T.slate }}>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        </div>

        {/* ★ Animated Line Chart + Services */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          <Card delay={580}>
            <SH
              title="Maintenance Tickets"
              sub={
                LINE_DATA.length >= 2
                  ? "Line draws itself · dots pop in · hover · last 6 months"
                  : "Most recent tickets"
              }
              action="View All"
              to="/operations/tickets"
            />
            <div
              ref={lineRef}
              style={{
                width: "100%",
                height: LINE_DATA.length >= 2 ? 290 : "auto",
                minHeight: LINE_DATA.length >= 2 ? undefined : 60,
              }}
            >
              {LINE_DATA.length >= 2 ? (
                <AnimatedLineChart
                  data={LINE_DATA}
                  visible={lineVis}
                  currency={false}
                />
              ) : RECENT_TICKETS.length > 0 ? (
                <RecentTicketsList tickets={RECENT_TICKETS} />
              ) : (
                <div style={{ height: 160 }}>
                  <EmptyChartState
                    loading={loading}
                    icon="⚙"
                    label="No tickets yet"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Services */}
          <Card delay={640} noPad>
            <div style={{ padding: "22px 24px 0" }}>
              <SH
                title="Upcoming Services"
                sub="Assets requiring attention soon"
                action="Schedule"
              />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Asset ID",
                    "Asset Name",
                    "Assigned To",
                    "Last Service",
                    "Cost",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="ams-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICES.length > 0 ? (
                  SERVICES.map((s) => (
                    <tr key={s.id} className="ams-tr">
                      <td>
                        <span className="ams-id">{s.id}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: T.navyMid }}>
                        {s.name}
                      </td>
                      <td style={{ color: T.slate }}>{s.by}</td>
                      <td style={{ color: T.muted }}>{s.last}</td>
                      <td style={{ fontWeight: 800, color: T.navy }}>
                        {s.cost}
                      </td>
                      <td>
                        <Badge status={s.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow
                    colSpan={6}
                    loading={loading}
                    icon="✓"
                    label="No open tickets right now — all clear"
                  />
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Asset Allocation */}
        <Card delay={700} noPad>
          <div style={{ padding: "22px 24px 0" }}>
            <SH
              title="Asset Allocation"
              sub="Employee-wise register with current valuations"
              action="View All Assets"
            />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "#",
                  "Asset ID",
                  "Asset Name",
                  "Employee",
                  "Department",
                  "Purchase Cost",
                  "Current Value",
                  "Last Service",
                  "Maint. Cost",
                  "Status",
                ].map((h) => (
                  <th key={h} className="ams-th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALLOC.length > 0 ? (
                ALLOC.map((a) => (
                  <tr key={a.id} className="ams-tr">
                    <td style={{ color: "#CBD5E1", fontWeight: 700 }}>
                      {a.sr}
                    </td>
                    <td>
                      <span className="ams-id">{a.id}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: T.navyMid }}>
                      {a.name}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div className="ams-av">{a.emp?.charAt(0)}</div>
                        <span style={{ color: T.slate, fontWeight: 500 }}>
                          {a.emp}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="ams-dep">{a.dept}</span>
                    </td>
                    <td style={{ color: T.muted }}>{a.purchase}</td>
                    <td style={{ fontWeight: 800, color: T.navy }}>
                      {a.current}
                    </td>
                    <td style={{ color: T.muted }}>{a.lastSvc}</td>
                    <td style={{ color: T.slate }}>{a.maint}</td>
                    <td>
                      <Badge status={a.st} />
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableRow
                  colSpan={10}
                  loading={loading}
                  icon="▣"
                  label="No assets assigned to employees yet"
                />
              )}
            </tbody>
          </table>
          <div style={{ height: 8 }} />
        </Card>
      </div>
    </>
  );
}
