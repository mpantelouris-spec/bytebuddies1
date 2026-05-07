import React, { useRef, useEffect, useState, useMemo } from 'react';
import { resolveBlockCategoryColor } from '../utils/blockTheme';

/**
 * Scratch-Style SVG Block Component — Blockly / PictoBlox puzzle geometry (SVG paths only).
 */

export const getCategoryColor = (category) => resolveBlockCategoryColor(category);

const NW = 12;
const ND = 6;
const R = 9;
const HAT_TOP = 10;
const INNER_SLOT_DEFAULT = 28;
const C_INDENT = 26;

const C_BLOCK_TYPES = new Set(['loop-repeat', 'loop-forever', 'loop-while', 'loop-foreach', 'logic-if']);
const BOOLEAN_BLOCK_TYPES = new Set(['logic-bool', 'sense-touching', 'sense-touching-sprite', 'sense-key']);
const REPORTER_BLOCK_TYPES = new Set(['sense-mouse-x', 'sense-mouse-y', 'sense-distance', 'sense-timer']);

export function inferBlockShapeKind(type) {
  const t = String(type || '');
  if (t.startsWith('event-')) return 'hat';
  if (C_BLOCK_TYPES.has(t)) return 'c';
  if (BOOLEAN_BLOCK_TYPES.has(t)) return 'boolean';
  if (REPORTER_BLOCK_TYPES.has(t)) return 'reporter';
  return 'stack';
}

/** Stack / hat: top puzzle notch (inward) + bottom tab (outward); smooth corner arcs R≈9 */
function pathStack(width, bodyH, hasTopNotch) {
  const topY = hasTopNotch ? ND : HAT_TOP;
  const nx = 18;
  const j = 2.5;
  const bottomY = topY + bodyH;
  const tabY = bottomY + ND;

  let d = '';
  if (hasTopNotch) {
    d += `M ${R},${topY}`;
    d += ` L ${nx},${topY}`;
    d += ` L ${nx + j},0`;
    d += ` L ${nx + NW - j},0`;
    d += ` L ${nx + NW},${topY}`;
    d += ` L ${width - R},${topY}`;
    d += ` Q ${width},${topY} ${width},${topY + R}`;
  } else {
    d += `M ${R},${topY}`;
    d += ` Q ${width * 0.2},0 ${width * 0.42},0`;
    d += ` Q ${width * 0.5},0 ${width * 0.58},0`;
    d += ` Q ${width * 0.8},0 ${width - R},${topY}`;
    d += ` Q ${width},${topY} ${width},${topY + R}`;
  }

  d += ` L ${width},${bottomY - R}`;
  d += ` Q ${width},${bottomY} ${width - R},${bottomY}`;
  d += ` L ${nx + NW},${bottomY}`;
  d += ` L ${nx + NW - j},${tabY}`;
  d += ` L ${nx + j},${tabY}`;
  d += ` L ${nx},${bottomY}`;
  d += ` L ${R},${bottomY}`;
  d += ` Q 0,${bottomY} 0,${bottomY - R}`;
  d += ` L 0,${topY + R}`;
  d += ` Q 0,${topY} ${R},${topY}`;
  d += ' Z';
  return d;
}

/** C-block: header + inner cavity + bottom continuation with stack tab */
function pathCBlock(width, bodyTop, hHeader, hInner, hFooterBar) {
  const y0 = bodyTop;
  const y1 = y0 + hHeader;
  const y2 = y1 + hInner;
  const y3 = y2 + hFooterBar;
  const nx = 18;
  const j = 2.5;
  const I = Math.min(C_INDENT, Math.max(18, width * 0.22));

  let d = `M ${R},${y0}`;
  d += ` L ${nx},${y0}`;
  d += ` L ${nx + j},${y0 - ND}`;
  d += ` L ${nx + NW - j},${y0 - ND}`;
  d += ` L ${nx + NW},${y0}`;
  d += ` L ${width - R},${y0}`;
  d += ` Q ${width},${y0} ${width},${y0 + R}`;
  d += ` L ${width},${y1}`;
  d += ` L ${I},${y1}`;
  d += ` L ${I},${y2 - R}`;
  d += ` Q ${I},${y2} ${I + R},${y2}`;
  d += ` L ${width - R},${y2}`;
  d += ` Q ${width},${y2} ${width},${y2 + R}`;
  d += ` L ${width},${y3 - R}`;
  d += ` Q ${width},${y3} ${width - R},${y3}`;
  d += ` L ${nx + NW},${y3}`;
  d += ` L ${nx + NW - j},${y3 + ND}`;
  d += ` L ${nx + j},${y3 + ND}`;
  d += ` L ${nx},${y3}`;
  d += ` L ${R},${y3}`;
  d += ` Q 0,${y3} 0,${y3 - R}`;
  d += ` L 0,${y1}`;
  d += ` L 0,${y0 + R}`;
  d += ` Q 0,${y0} ${R},${y0}`;
  d += ' Z';
  return d;
}

/** Horizontal reporter pill (rounded ends), SVG path */
function pathReporterPill(w, h) {
  const r = Math.min(h / 2, 11);
  const d = `M ${r},0
    H ${w - r}
    A ${r},${r} 0 0 1 ${w},${r}
    V ${h - r}
    A ${r},${r} 0 0 1 ${w - r},${h}
    H ${r}
    A ${r},${r} 0 0 1 0,${h - r}
    V ${r}
    A ${r},${r} 0 0 1 ${r},0 Z`;
  return d;
}

/** Boolean hex (flat top/bottom, angled sides) */
function pathBooleanHex(w, h) {
  const inset = h * 0.28;
  const d = `M ${inset},0
    L ${w - inset},0
    L ${w},${h / 2}
    L ${w - inset},${h}
    L ${inset},${h}
    L 0,${h / 2} Z`;
  return d;
}

const ScratchStyleBlock = ({
  block,
  children,
  style = {},
  className = '',
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const contentRef = useRef(null);
  const rowRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 170, rowH: 24 });
  const measureSignatureRef = useRef('');

  const shapeKind = useMemo(() => inferBlockShapeKind(block?.type), [block?.type]);
  const isHatBlock = shapeKind === 'hat';
  const isCBlock = shapeKind === 'c';
  const isReporter = shapeKind === 'reporter';
  const isBoolean = shapeKind === 'boolean';
  const hasTopNotch = shapeKind === 'stack' || shapeKind === 'c';

  const blockColor = getCategoryColor(block?.category);

  useEffect(() => {
    const measureSignature = JSON.stringify({
      id: block?.id ?? null,
      type: block?.type ?? null,
      label: block?.label ?? null,
      params: block?.params ?? null,
    });
    if (measureSignatureRef.current === measureSignature) return;
    measureSignatureRef.current = measureSignature;

    const rowEl = rowRef.current;
    const wrapEl = contentRef.current;
    if (!wrapEl) return;

    const rowH = Math.max(22, rowEl ? rowEl.offsetHeight : wrapEl.scrollHeight);
    let nextW = Math.max(120, (rowEl ? rowEl.scrollWidth : wrapEl.scrollWidth) + 28);
    if (isReporter || isBoolean) {
      nextW = Math.max(100, Math.min(360, (rowEl ? rowEl.scrollWidth : wrapEl.scrollWidth) + 36));
    } else {
      nextW = Math.max(160, Math.min(480, nextW));
    }
    if (isCBlock) {
      nextW = Math.max(200, nextW);
    }

    setDimensions((prev) => {
      if (Math.abs(prev.width - nextW) < 2 && Math.abs(prev.rowH - rowH) < 1) return prev;
      return { width: nextW, rowH };
    });
  }, [block, isBoolean, isCBlock, isReporter]);

  const w = dimensions.width;
  const rowH = dimensions.rowH;

  const bodyTop = hasTopNotch ? ND : HAT_TOP;
  const innerSlot = isCBlock ? INNER_SLOT_DEFAULT : 0;
  const bodyHStack = rowH + 8;

  const svgPaths = useMemo(() => {
    if (isBoolean) {
      const h = Math.max(24, rowH + 6);
      return { main: pathBooleanHex(w, h), svgH: h + 2, padT: 5, padL: 10 };
    }
    if (isReporter) {
      const h = Math.max(24, rowH + 6);
      return { main: pathReporterPill(w, h), svgH: h + 2, padT: 5, padL: 10 };
    }
    if (isCBlock) {
      const hHeader = rowH + 6;
      const hFooterBar = 12;
      const svgH = bodyTop + hHeader + innerSlot + hFooterBar + ND + 2;
      return {
        main: pathCBlock(w, bodyTop, hHeader, innerSlot, hFooterBar),
        svgH,
        padT: bodyTop + 5,
        padL: 12,
      };
    }
    const svgH = bodyTop + bodyHStack + ND + 3;
    return {
      main: pathStack(w, bodyHStack, hasTopNotch),
      svgH,
      padT: hasTopNotch ? bodyTop + 5 : 8,
      padL: 12,
    };
  }, [w, rowH, bodyTop, hasTopNotch, innerSlot, isBoolean, isCBlock, isReporter, bodyHStack]);

  const blockId = `scratch-block-${block?.id || Math.random()}`;

  return (
    <div
      className={`scratch-svg-block ${className}`}
      style={{
        position: 'relative',
        width: `${w}px`,
        height: `${svgPaths.svgH}px`,
        cursor: 'grab',
        userSelect: 'none',
        ...style,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      <svg
        width={w}
        height={svgPaths.svgH}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={`gradient-${blockId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: blockColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: blockColor, stopOpacity: 0.9 }} />
          </linearGradient>
          <linearGradient id={`highlight-${blockId}`} x1="0%" y1="0%" x2="0%" y2="35%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        <path
          d={svgPaths.main}
          fill="#000000"
          opacity="0.12"
          transform="translate(0, 1.25)"
        />
        <path
          d={svgPaths.main}
          fill={`url(#gradient-${blockId})`}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />
        <path
          d={svgPaths.main}
          fill={`url(#highlight-${blockId})`}
        />
      </svg>

      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          top: svgPaths.padT,
          left: svgPaths.padL,
          right: 12,
          display: 'flex',
          flexDirection: isCBlock ? 'column' : 'row',
          alignItems: isCBlock ? 'stretch' : 'center',
          gap: isCBlock ? 4 : 5,
          pointerEvents: 'auto',
        }}
      >
        <div
          ref={rowRef}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            flexWrap: 'nowrap',
            fontSize: '12px',
            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            fontWeight: 600,
            color: 'white',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 0 rgba(0,0,0,0.2)',
          }}
        >
          {children}
        </div>
        {isCBlock && (
          <div
            aria-hidden
            style={{
              minHeight: INNER_SLOT_DEFAULT,
              marginLeft: C_INDENT - 4,
              marginRight: 4,
              borderRadius: 6,
              background: 'rgba(0,0,0,0.12)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ScratchStyleBlock;
