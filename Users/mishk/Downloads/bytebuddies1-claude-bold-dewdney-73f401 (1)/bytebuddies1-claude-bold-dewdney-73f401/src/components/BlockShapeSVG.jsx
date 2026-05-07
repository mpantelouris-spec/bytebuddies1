import React from 'react';
import { getCategoryColor } from '../utils/blocks';

// Puzzle notch path for top/bottom connectors (Scratch-like)
function puzzleNotch(x, y, width = 32, height = 8) {
  // Returns a path string for a puzzle notch at (x, y)
  // Notch shape:  _/‾‾\_
  return `M${x},${y} c4,0 4,-${height} 8,-${height} s4,${height} 8,${height}`;
}

export default function BlockShapeSVG({
  width = 180,
  height = 44,
  category = 'motion',
  label = '',
  icon = '',
  children,
  style = {},
}) {
  const color = getCategoryColor(category);
  const notchW = 32, notchH = 8, radius = 10;
  // Main block path with top and bottom puzzle notches
  const path = `M${radius},0
    h${width - 2 * radius - notchW} ${puzzleNotch(width - radius - notchW, 0, notchW, notchH)} h${radius}
    a${radius},${radius} 0 0 1 ${radius},${radius}
    v${height - 2 * radius - notchH} 
    a${radius},${radius} 0 0 1 -${radius},${radius}
    h-${width - 2 * radius - notchW} ${puzzleNotch(radius, height - notchH, notchW, notchH)} h-${radius}
    a${radius},${radius} 0 0 1 -${radius},-${radius}
    v-${height - 2 * radius - notchH}
    a${radius},${radius} 0 0 1 ${radius},-${radius}
    z`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))', ...style }}
      className={`block-svg block-svg-${category}`}
    >
      <path d={path} fill={color} />
      <text x={icon ? 38 : 16} y={height / 2 + 6} fontSize={18} fontWeight="bold" fill="#fff">
        {icon && <tspan fontSize={20}>{icon}</tspan>} {label}
      </text>
      {children}
    </svg>
  );
}
