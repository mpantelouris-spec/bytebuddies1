import React, { useRef, useEffect, useState } from 'react';
import { resolveBlockCategoryColor } from '../utils/blockTheme';

/**
 * Scratch-Style SVG Block Component
 * Renders blocks with proper puzzle-piece shapes just like Scratch/Blockly
 */

// Map category to Scratch colors
export const getCategoryColor = (category) => resolveBlockCategoryColor(category);

/**
 * Generate Scratch-like puzzle-piece path with standard notch/tab proportions.
 */
const generateScratchPath = (width, height, hasTopNotch = true) => {
  const notchWidth = 14;
  const notchDepth = 4;
  const notchX = 16;
  const radius = 4;
  const join = 3;
  const hatRise = 8;
  const topY = hasTopNotch ? notchDepth : hatRise;

  let d = '';

  if (hasTopNotch) {
    d += `M ${radius},${topY} `;
    d += `L ${notchX},${topY} `;
    d += `L ${notchX + join},0 `;
    d += `L ${notchX + notchWidth - join},0 `;
    d += `L ${notchX + notchWidth},${topY} `;
    d += `L ${width - radius},${topY} `;
    d += `Q ${width},${topY} ${width},${topY + radius} `;
  } else {
    // Event "hat" top: smooth cap, then normal block body.
    d += `M ${radius},${topY} `;
    d += `Q ${width * 0.18},0 ${width * 0.38},0 `;
    d += `Q ${width * 0.5},0 ${width * 0.62},0 `;
    d += `Q ${width * 0.82},0 ${width - radius},${topY} `;
    d += `Q ${width},${topY} ${width},${topY + radius} `;
  }

  d += `L ${width},${height - radius} `;
  d += `Q ${width},${height} ${width - radius},${height} `;
  d += `L ${notchX + notchWidth},${height} `;
  d += `L ${notchX + notchWidth - join},${height + notchDepth} `;
  d += `L ${notchX + join},${height + notchDepth} `;
  d += `L ${notchX},${height} `;
  d += `L ${radius},${height} `;
  d += `Q 0,${height} 0,${height - radius} `;
  d += `L 0,${topY + radius} `;
  d += `Q 0,${topY} ${radius},${topY} `;
  d += 'Z';

  return d;
};

/**
 * ScratchStyleBlock - Main component
 */
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
  const [dimensions, setDimensions] = useState({ width: 170, height: 34 });
  const measureSignatureRef = useRef('');
  
  // Determine if this is a "hat" block (events have smooth tops)
  const isHatBlock = block?.type?.startsWith('event-') || block?.category === 'event' || block?.category === 'events';
  const hasTopNotch = !isHatBlock;
  
  // Get color from category
  const blockColor = getCategoryColor(block?.category);
  
  // Measure content and adjust block size.
  // IMPORTANT: only re-measure when block content actually changes,
  // not on hover/selection re-renders.
  useEffect(() => {
    const measureSignature = JSON.stringify({
      id: block?.id ?? null,
      type: block?.type ?? null,
      label: block?.label ?? null,
      params: block?.params ?? null,
    });
    if (measureSignatureRef.current === measureSignature) return;
    measureSignatureRef.current = measureSignature;

    if (contentRef.current) {
      const tempWidth = contentRef.current.scrollWidth + 34;
      const tempHeight = 34;
      const nextWidth = Math.max(145, Math.min(420, tempWidth));
      setDimensions((prev) => {
        // Ignore tiny subpixel/text antialiasing jitter that can look like stretching.
        if (Math.abs(prev.width - nextWidth) < 2 && prev.height === tempHeight) {
          return prev;
        }
        return { width: nextWidth, height: tempHeight };
      });
    }
  }, [block]);
  
  const blockId = `scratch-block-${block?.id || Math.random()}`;
  const topPadding = hasTopNotch ? 4 : 8;
  const totalHeight = dimensions.height + topPadding + 4;
  
  return (
    <div
      className={`scratch-svg-block ${className}`}
      style={{
        position: 'relative',
        width: `${dimensions.width}px`,
        height: `${totalHeight}px`,
        cursor: 'grab',
        userSelect: 'none',
        ...style
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {/* SVG Block Shape */}
      <svg
        width={dimensions.width}
        height={totalHeight}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id={`gradient-${blockId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: blockColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: blockColor, stopOpacity: 0.92 }} />
          </linearGradient>
          
          <linearGradient id={`highlight-${blockId}`} x1="0%" y1="0%" x2="0%" y2="30%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        
        <path
          d={generateScratchPath(dimensions.width, dimensions.height, hasTopNotch)}
          fill="#000000"
          opacity="0.1"
          transform="translate(0, 1.5)"
        />
        
        <path
          d={generateScratchPath(dimensions.width, dimensions.height, hasTopNotch)}
          fill={`url(#gradient-${blockId})`}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1"
        />
        
        <path
          d={generateScratchPath(dimensions.width, dimensions.height, hasTopNotch)}
          fill={`url(#highlight-${blockId})`}
          pointerEvents="none"
        />
      </svg>
      
      {/* Content Overlay */}
      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          top: hasTopNotch ? '9px' : '7px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '12px',
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          fontWeight: '500',
          color: 'white',
          lineHeight: '22px',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
          textShadow: '0 1px 0 rgba(0,0,0,0.18)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScratchStyleBlock;
