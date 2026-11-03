"use client";

import { useId, useState } from "react";

export type MakeoverComparisonProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  locationName?: string;
  conceptLabel?: string;
  className?: string;
};

/**
 * Presentation-only comparison. Both images must be aligned externally.
 * The component never claims a user photo has been calibrated to a Studio render.
 * Callers must verify image rights and label conceptual renderings.
 */
export function MakeoverComparison({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  locationName,
  conceptLabel = "Wizualizacja koncepcyjna — nie projekt wykonawczy",
  className,
}: MakeoverComparisonProps) {
  const [position, setPosition] = useState(50);
  const sliderId = useId();
  const value = Math.max(0, Math.min(100, position));

  return (
    <figure
      className={className}
      style={{
        margin: 0,
        width: "100%",
        background: "#f3f3f0",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #d9dad5",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden", background: "#e5e5e0" }}>
        {/* The reference image remains the full underlying frame. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={beforeAlt}
          draggable={false}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt=""
            draggable={false}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${value}%`,
            width: 2,
            background: "white",
            boxShadow: "0 0 0 1px #0003",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />
        <span style={tagStyle("left")}>PRZED</span>
        <span style={tagStyle("right")}>KONCEPCJA</span>
      </div>
      <div style={{ padding: "16px 18px 18px", display: "grid", gap: 10 }}>
        <label htmlFor={sliderId} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, fontWeight: 700 }}>
          <span>Porównaj stan obecny i koncepcję</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}%</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Pokaż więcej wizualizacji koncepcyjnej"
          aria-valuetext={`${value} procent wizualizacji koncepcyjnej`}
          style={{ width: "100%", accentColor: "#e76e4e", cursor: "pointer" }}
        />
        <p style={{ margin: 0, color: "#666963", fontSize: 12, lineHeight: 1.5 }}>
          {locationName ? `${locationName} · ` : ""}{conceptLabel}
        </p>
        <p className="sr-only">Stan obecny: {beforeAlt}. Koncepcja: {afterAlt}.</p>
      </div>
    </figure>
  );
}

function tagStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: 14,
    [side]: 14,
    background: "rgba(20,22,24,.85)",
    color: "white",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: ".08em",
    pointerEvents: "none",
  };
}
