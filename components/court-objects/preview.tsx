"use client";
import { useId } from "react";
import { Design, palettes } from "./data";

export function CourtPreview({
  design: d,
  small = false,
}: {
  design: Design;
  small?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [base, accent, line] = palettes[d.palette].colors;
  const offsets = [
    [0, 0],
    [-210, -100],
    [110, 170],
    [-130, 120],
    [150, -180],
    [-40, 90],
  ][d.layout];
  return (
    <svg
      className="co-svg"
      viewBox="0 0 700 1000"
      role="img"
      aria-label={`${d.sport} court artwork, ${palettes[d.palette].name}, ${d.name}`}
    >
      <defs>
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".72"
            numOctaves="3"
            seed="12"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".13" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <rect width="700" height="1000" fill={base} />
      <g
        transform={`translate(${350 + d.x + offsets[0]} ${500 + d.y + offsets[1]}) rotate(${d.rotation + (d.layout === 5 ? 12 : 0)}) scale(${d.scale / 100}) translate(-350 -500)`}
      >
        <path d="M-50 1000V850H85V1000Z" fill={accent} />
        <g fill="none" stroke={line} strokeWidth="22">
          {d.sport === "Football" || d.sport === "Multi" ? (
            <>
              <circle cx="80" cy="85" r="315" />
              <path d="M625-100V1150M625 790H350V1100" />
              <path d="M625 865a180 180 0 0 0-170 200" />
            </>
          ) : null}
          {d.sport === "Basketball" || d.sport === "Multi" ? (
            <>
              <path d="M-150 60H575V1100M575 720H350V1100" />
              <circle cx="-30" cy="150" r="300" />
              <path d="M575 280C60 280 80 860 170 1150" />
              <circle cx="465" cy="980" r="70" />
            </>
          ) : null}
          {d.sport === "Tennis" ? (
            <>
              <path d="M-150 80H580V1150M480 80V1100M-100 560H580M-100 790H480M190 560V1100" />
              <path d="M-100 560H700" strokeWidth="9" strokeDasharray="8 9" />
            </>
          ) : null}
        </g>
      </g>
      {d.texture && !small ? (
        <rect
          width="700"
          height="1000"
          fill="transparent"
          filter={`url(#${id})`}
          pointerEvents="none"
        />
      ) : null}
      {d.label ? (
        <g fill={line} fontFamily="Arial,sans-serif">
          <text x="42" y="880" fontSize="25" fontWeight="700">
            {d.name}
          </text>
          <text x="42" y="914" fontSize="15">
            {d.city}
          </text>
          <text x="42" y="941" fontSize="12">
            {d.coordinates}
          </text>
          <text x="42" y="970" fontSize="12">
            {d.year} / {d.number}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
export function RoomPreview({ design }: { design: Design }) {
  return (
    <div className="co-room">
      <div className="co-wall-seam" />
      <div
        className={`co-room-art co-material-${design.material}`}
        style={{ width: [23, 30, 39][design.format] + "%" }}
      >
        <CourtPreview design={design} />
      </div>
      <div className="co-floor" />
      <div className="co-bench">
        <i />
        <i />
      </div>
      <div className="co-room-caption">A little street. A little gallery.</div>
    </div>
  );
}
