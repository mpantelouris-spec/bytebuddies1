import React, { useState, useRef, useEffect } from 'react';

/**
 * Scratch-Style Block-Based Coding UI
 * Replicates Scratch Motion blocks with proper puzzle-piece shapes
 */

// Generate SVG path for Scratch-style block shape
const generateBlockPath = (width, height, hasTopNotch = true) => {
  const notchWidth = 16;
  const notchHeight = 4;
  const notchDepth = 3;
  const radius = 4;
  
  let path = '';
  
  if (hasTopNotch) {
    // Start with top-left, including notch
    path += `M ${radius},${notchHeight} `;
    path += `L ${15},${notchHeight} `;
    // Top notch (female connector)
    path += `c 2,0 3,${notchDepth} 8,${notchDepth} `;
    path += `l ${notchWidth},0 `;
    path += `c 5,0 6,-${notchDepth} 8,-${notchDepth} `;
    path += `L ${width - radius},${notchHeight} `;
  } else {
    // Rounded top without notch
    path += `M ${radius},0 `;
    path += `L ${width - radius},0 `;
  }
  
  // Top-right corner
  path += `Q ${width},${hasTopNotch ? notchHeight : 0} ${width},${(hasTopNotch ? notchHeight : 0) + radius} `;
  
  // Right side down to bottom
  path += `L ${width},${height - radius} `;
  
  // Bottom-right corner
  path += `Q ${width},${height} ${width - radius},${height} `;
  
  // Bottom tab (male connector)
  path += `L ${39 + notchWidth + 8},${height} `;
  path += `c -2,0 -3,${notchDepth} -8,${notchDepth} `;
  path += `l -${notchWidth},0 `;
  path += `c -5,0 -6,-${notchDepth} -8,-${notchDepth} `;
  path += `L ${radius},${height} `;
  
  // Bottom-left corner
  path += `Q 0,${height} 0,${height - radius} `;
  
  // Left side up to top
  path += `L 0,${(hasTopNotch ? notchHeight : 0) + radius} `;
  
  // Top-left corner
  path += `Q 0,${hasTopNotch ? notchHeight : 0} ${radius},${hasTopNotch ? notchHeight : 0} `;
  path += 'Z';
  
  return path;
};

// Individual input field component
const BlockInput = ({ type, value, options, onChange, placeholder = '' }) => {
  if (type === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block-input-number"
        style={{
          background: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '3px 8px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#575E75',
          minWidth: '30px',
          maxWidth: '50px',
          textAlign: 'center',
          outline: 'none',
        }}
      />
    );
  }
  
  if (type === 'dropdown') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block-input-dropdown"
        style={{
          background: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '3px 8px 3px 8px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#575E75',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23575E75' d='M6 9L2 5h8z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 4px center',
          paddingRight: '20px',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }
  
  return null;
};

// Individual Scratch block component
const ScratchBlock = ({ 
  id,
  label, 
  inputs = [], 
  color = '#4C97FF',
  hasTopNotch = true,
  isDragging = false,
  onMouseDown,
  style = {}
}) => {
  const [blockWidth, setBlockWidth] = useState(200);
  const blockRef = useRef(null);
  const blockHeight = 32;
  
  useEffect(() => {
    if (blockRef.current) {
      // Measure content width and add padding
      const contentWidth = blockRef.current.scrollWidth;
      setBlockWidth(Math.max(200, contentWidth + 40));
    }
  }, [label, inputs]);
  
  // Parse label and insert inputs
  const renderBlockContent = () => {
    const parts = label.split(/(\([^)]+\))/g);
    let inputIndex = 0;
    
    return parts.map((part, i) => {
      if (part.match(/\([^)]+\)/)) {
        // This is an input placeholder
        const input = inputs[inputIndex];
        inputIndex++;
        
        if (!input) return null;
        
        return (
          <BlockInput
            key={i}
            type={input.type}
            value={input.value}
            options={input.options}
            onChange={input.onChange}
            placeholder={part.slice(1, -1)}
          />
        );
      } else {
        // Regular text
        return <span key={i}>{part}</span>;
      }
    });
  };
  
  return (
    <div
      ref={blockRef}
      onMouseDown={onMouseDown}
      style={{
        position: 'relative',
        width: `${blockWidth}px`,
        height: `${blockHeight + (hasTopNotch ? 4 : 0)}px`,
        cursor: 'grab',
        userSelect: 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.1s ease',
        filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
        ...style
      }}
    >
      <svg
        width={blockWidth}
        height={blockHeight + (hasTopNotch ? 4 : 0)}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={`blockGradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.95 }} />
          </linearGradient>
        </defs>
        <path
          d={generateBlockPath(blockWidth, blockHeight, hasTopNotch)}
          fill={`url(#blockGradient-${id})`}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
        {/* Inner shadow effect */}
        <path
          d={generateBlockPath(blockWidth, blockHeight, hasTopNotch)}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
          style={{ transform: 'translate(0.5px, 0.5px)' }}
        />
      </svg>
      
      <div
        style={{
          position: 'absolute',
          top: hasTopNotch ? '7px' : '3px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '12px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
          fontWeight: '500',
          color: 'white',
          lineHeight: '24px',
          pointerEvents: 'none',
        }}
      >
        {renderBlockContent()}
      </div>
    </div>
  );
};

// Main Scratch Blocks Container
const ScratchBlocks = () => {
  const [blocks, setBlocks] = useState([
    {
      id: 'move',
      label: 'move () steps',
      inputs: [
        { type: 'number', value: 10, onChange: (v) => updateBlockInput('move', 0, v) }
      ],
      x: 20,
      y: 20,
      hasTopNotch: false
    },
    {
      id: 'turn-cw',
      label: 'turn ↻ () degrees',
      inputs: [
        { type: 'number', value: 15, onChange: (v) => updateBlockInput('turn-cw', 0, v) }
      ],
      x: 20,
      y: 70,
      hasTopNotch: true
    },
    {
      id: 'turn-ccw',
      label: 'turn ↺ () degrees',
      inputs: [
        { type: 'number', value: 15, onChange: (v) => updateBlockInput('turn-ccw', 0, v) }
      ],
      x: 20,
      y: 120,
      hasTopNotch: true
    },
    {
      id: 'goto-random',
      label: 'go to ()',
      inputs: [
        { 
          type: 'dropdown', 
          value: 'random', 
          onChange: (v) => updateBlockInput('goto-random', 0, v),
          options: [
            { value: 'random', label: 'random position' },
            { value: 'mouse', label: 'mouse-pointer' }
          ]
        }
      ],
      x: 20,
      y: 170,
      hasTopNotch: true
    },
    {
      id: 'goto-xy',
      label: 'go to x: () y: ()',
      inputs: [
        { type: 'number', value: 0, onChange: (v) => updateBlockInput('goto-xy', 0, v) },
        { type: 'number', value: 0, onChange: (v) => updateBlockInput('goto-xy', 1, v) }
      ],
      x: 20,
      y: 220,
      hasTopNotch: true
    },
    {
      id: 'glide-random',
      label: 'glide () secs to ()',
      inputs: [
        { type: 'number', value: 1, onChange: (v) => updateBlockInput('glide-random', 0, v) },
        { 
          type: 'dropdown', 
          value: 'random', 
          onChange: (v) => updateBlockInput('glide-random', 1, v),
          options: [
            { value: 'random', label: 'random position' },
            { value: 'mouse', label: 'mouse-pointer' }
          ]
        }
      ],
      x: 20,
      y: 270,
      hasTopNotch: true
    },
    {
      id: 'glide-xy',
      label: 'glide () secs to x: () y: ()',
      inputs: [
        { type: 'number', value: 1, onChange: (v) => updateBlockInput('glide-xy', 0, v) },
        { type: 'number', value: 0, onChange: (v) => updateBlockInput('glide-xy', 1, v) },
        { type: 'number', value: 0, onChange: (v) => updateBlockInput('glide-xy', 2, v) }
      ],
      x: 20,
      y: 320,
      hasTopNotch: true
    },
    {
      id: 'point-dir',
      label: 'point in direction ()',
      inputs: [
        { type: 'number', value: 90, onChange: (v) => updateBlockInput('point-dir', 0, v) }
      ],
      x: 20,
      y: 370,
      hasTopNotch: true
    },
    {
      id: 'point-towards',
      label: 'point towards ()',
      inputs: [
        { 
          type: 'dropdown', 
          value: 'mouse', 
          onChange: (v) => updateBlockInput('point-towards', 0, v),
          options: [
            { value: 'mouse', label: 'mouse-pointer' },
            { value: 'random', label: 'random position' }
          ]
        }
      ],
      x: 20,
      y: 420,
      hasTopNotch: true
    },
    {
      id: 'change-x',
      label: 'change x by ()',
      inputs: [
        { type: 'number', value: 10, onChange: (v) => updateBlockInput('change-x', 0, v) }
      ],
      x: 20,
      y: 470,
      hasTopNotch: true
    },
    {
      id: 'set-x',
      label: 'set x to ()',
      inputs: [
        { type: 'number', value: 0, onChange: (v) => updateBlockInput('set-x', 0, v) }
      ],
      x: 20,
      y: 520,
      hasTopNotch: true
    },
  ]);
  
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapTarget, setSnapTarget] = useState(null);
  const containerRef = useRef(null);
  
  const updateBlockInput = (blockId, inputIndex, value) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        const newInputs = [...block.inputs];
        newInputs[inputIndex] = { ...newInputs[inputIndex], value };
        return { ...block, inputs: newInputs };
      }
      return block;
    }));
  };
  
  const handleBlockMouseDown = (e, block) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
      return; // Don't start drag if clicking on input
    }
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setDraggingBlock(block.id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const handleMouseMove = (e) => {
    if (!draggingBlock || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    setBlocks(prev => prev.map(block => {
      if (block.id === draggingBlock) {
        return { ...block, x: newX, y: newY };
      }
      return block;
    }));
    
    // Check for snap targets
    const currentBlock = blocks.find(b => b.id === draggingBlock);
    const snapDistance = 20;
    let foundSnap = null;
    
    blocks.forEach(block => {
      if (block.id === draggingBlock) return;
      
      // Check if current block's top is near other block's bottom
      const blockBottom = block.y + 32;
      const currentTop = newY;
      
      if (Math.abs(blockBottom - currentTop) < snapDistance && 
          Math.abs(block.x - newX) < snapDistance) {
        foundSnap = block.id;
      }
    });
    
    setSnapTarget(foundSnap);
  };
  
  const handleMouseUp = () => {
    if (snapTarget && draggingBlock) {
      // Snap blocks together
      const targetBlock = blocks.find(b => b.id === snapTarget);
      if (targetBlock) {
        setBlocks(prev => prev.map(block => {
          if (block.id === draggingBlock) {
            return { 
              ...block, 
              x: targetBlock.x, 
              y: targetBlock.y + 29  // Stack with slight overlap
            };
          }
          return block;
        }));
      }
    }
    
    setDraggingBlock(null);
    setSnapTarget(null);
  };
  
  useEffect(() => {
    if (draggingBlock) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingBlock, dragOffset, blocks, snapTarget]);
  
  return (
    <div style={{ 
      padding: '40px',
      background: '#F9F9F9',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#575E75',
          marginBottom: '8px'
        }}>
          Scratch Motion Blocks
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#575E75',
          marginBottom: '32px'
        }}>
          Drag blocks to move them. Bring blocks close together to snap them into a stack.
        </p>
        
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '800px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          {blocks.map(block => (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: `${block.x}px`,
                top: `${block.y}px`,
                zIndex: draggingBlock === block.id ? 1000 : 1,
              }}
            >
              <ScratchBlock
                {...block}
                isDragging={draggingBlock === block.id}
                onMouseDown={(e) => handleBlockMouseDown(e, block)}
                style={{
                  outline: snapTarget === block.id ? '2px solid #4C97FF' : 'none',
                  outlineOffset: '2px'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScratchBlocks;
