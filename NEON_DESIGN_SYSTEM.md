# 🌟 Neon Glow Game Builder Design System

A modern, vibrant design system for block-based visual programming with neon aesthetics.

## Color Palette

### Core Theme
```css
--bg-primary: #0a0e27;      /* Deep navy/almost black */
--bg-secondary: #141829;    /* Slightly lighter */
--bg-tertiary: #1a1f3a;     /* For cards/panels */
--text-primary: #ffffff;    /* Pure white */
--text-secondary: #e0e0ff;  /* Light lavender */
--text-muted: #8899bb;      /* Muted blue-grey */
--border-color: #2a3f5f;    /* Subtle borders */
```

### Block Category Colors (Neon Palette)

```css
/* EVENT - Vibrant Yellow/Orange Glow */
--color-event: #FFD700;           /* Main */
--color-event-dark: #FFA500;      /* Dark variant */
--color-event-light: #FFED4E;     /* Light variant */
--color-event-glow: rgba(255, 215, 0, 0.4);

/* MOTION - Electric Blue */
--color-motion: #00D9FF;          /* Cyan-Blue */
--color-motion-dark: #0099CC;     /* Dark */
--color-motion-light: #33E9FF;    /* Light */
--color-motion-glow: rgba(0, 217, 255, 0.4);

/* LOOKS - Vivid Purple/Magenta */
--color-looks: #FF00FF;           /* Hot Magenta */
--color-looks-dark: #CC00CC;      /* Dark */
--color-looks-light: #FF33FF;     /* Light */
--color-looks-glow: rgba(255, 0, 255, 0.4);

/* CONTROL - Neon Orange */
--color-control: #FF6B35;         /* Vibrant Orange */
--color-control-dark: #E63B00;    /* Dark */
--color-control-light: #FF8C42;   /* Light */
--color-control-glow: rgba(255, 107, 53, 0.4);

/* SENSING - Cyan/Aqua */
--color-sensing: #00FFAA;         /* Electric Cyan */
--color-sensing-dark: #00CC88;    /* Dark */
--color-sensing-light: #33FFBB;   /* Light */
--color-sensing-glow: rgba(0, 255, 170, 0.4);

/* SOUND - Hot Pink/Neon Pink */
--color-sound: #FF10F0;           /* Neon Pink */
--color-sound-dark: #DD00DD;      /* Dark */
--color-sound-light: #FF33FF;     /* Light */
--color-sound-glow: rgba(255, 16, 240, 0.4);

/* VARIABLES - Amber/Gold */
--color-variables: #FFB700;       /* Warm Gold */
--color-variables-dark: #DD9500;  /* Dark */
--color-variables-light: #FFCC33; /* Light */
--color-variables-glow: rgba(255, 183, 0, 0.4);

/* MATH - Sky Blue */
--color-math: #00B4FF;            /* Bright Blue */
--color-math-dark: #0088CC;       /* Dark */
--color-math-light: #33C9FF;      /* Light */
--color-math-glow: rgba(0, 180, 255, 0.4);

/* GAME - Neon Green */
--color-game: #00FF41;            /* Electric Green */
--color-game-dark: #00CC33;       /* Dark */
--color-game-light: #33FF66;      /* Light */
--color-game-glow: rgba(0, 255, 65, 0.4);

/* PHYSICS - Teal */
--color-physics: #00FFDD;         /* Electric Teal */
--color-physics-dark: #00CCAA;    /* Dark */
--color-physics-light: #33FFEE;   /* Light */
--color-physics-glow: rgba(0, 255, 221, 0.4);

/* ACTION/OUTPUT - Coral */
--color-action: #FF3366;          /* Neon Red-Pink */
--color-action-dark: #DD0044;     /* Dark */
--color-action-light: #FF6699;    /* Light */
--color-action-glow: rgba(255, 51, 102, 0.4);
```

## Spacing System

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

## Border Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-full: 999px;
```

## Shadow & Glow Effects

```css
/* Soft shadows (blocks) */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);

/* Neon glow effects (no blur, sharp glow) */
--glow-event: 0 0 8px var(--color-event-glow), 0 0 16px var(--color-event-glow);
--glow-motion: 0 0 8px var(--color-motion-glow), 0 0 16px var(--color-motion-glow);
--glow-looks: 0 0 8px var(--color-looks-glow), 0 0 16px var(--color-looks-glow);
--glow-control: 0 0 8px var(--color-control-glow), 0 0 16px var(--color-control-glow);
--glow-sensing: 0 0 8px var(--color-sensing-glow), 0 0 16px var(--color-sensing-glow);
--glow-sound: 0 0 8px var(--color-sound-glow), 0 0 16px var(--color-sound-glow);
--glow-variables: 0 0 8px var(--color-variables-glow), 0 0 16px var(--color-variables-glow);
--glow-math: 0 0 8px var(--color-math-glow), 0 0 16px var(--color-math-glow);
--glow-game: 0 0 8px var(--color-game-glow), 0 0 16px var(--color-game-glow);
--glow-physics: 0 0 8px var(--color-physics-glow), 0 0 16px var(--color-physics-glow);
--glow-action: 0 0 8px var(--color-action-glow), 0 0 16px var(--color-action-glow);

/* Active hover glow (stronger) */
--glow-active: 0 0 12px rgba(255, 255, 255, 0.3), 0 0 24px var(--color-primary-glow);
```

## Typography

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-weight-normal: 500;
--font-weight-bold: 700;

/* Block label */
--font-block: 13px;

/* Sidebar category */
--font-category: 12px;

/* Heading */
--font-heading: 14px;
```

## Transitions

```css
--transition-fast: 120ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

---

## Component Styles

### 1. Sidebar Container

```css
.sidebar {
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  padding: var(--space-lg);
  width: 80px;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
```

### 2. Category Button (Sidebar Item)

```css
.category-btn {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  border: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.category-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--category-color);
}

/* Active state - glowing */
.category-btn.active {
  background: var(--bg-tertiary);
  border-color: var(--category-color);
  box-shadow: 
    inset 0 0 8px var(--category-glow),
    0 0 16px var(--category-glow);
  color: var(--category-color);
}
```

**Example Usage:**
```html
<button class="category-btn active" style="--category-color: var(--color-event); --category-glow: var(--glow-event);">
  🚩
</button>
```

### 3. Block Element

```css
.block {
  background: linear-gradient(135deg, var(--block-color) 0%, var(--block-dark) 100%);
  border: 2px solid var(--block-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  color: var(--text-primary);
  font-size: var(--font-block);
  font-weight: var(--font-weight-bold);
  cursor: grab;
  user-select: none;
  position: relative;
  box-shadow: 
    var(--shadow-md),
    0 0 12px var(--block-glow);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.block:hover {
  box-shadow: 
    var(--shadow-lg),
    0 0 20px var(--block-glow),
    inset 0 0 8px rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.block:active {
  cursor: grabbing;
  transform: translateY(0);
}

.block.dragging {
  opacity: 0.8;
  transform: scale(1.05);
  box-shadow: 
    var(--shadow-lg),
    0 0 24px var(--block-glow),
    0 0 40px var(--block-glow);
}

.block.selected {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 
    var(--shadow-lg),
    0 0 24px var(--block-glow),
    inset 0 0 12px rgba(255, 255, 255, 0.2);
}
```

**Example Usage:**
```html
<div class="block" style="--block-color: var(--color-event); --block-dark: var(--color-event-dark); --block-glow: var(--glow-event);">
  <span>⬆️</span>
  <span>Move forward</span>
</div>
```

### 4. Block Parameter Input

```css
.block-param {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--block-color);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  font-family: 'Monaco', 'Courier New', monospace;
  transition: all var(--transition-fast);
}

.block-param:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 8px var(--block-glow);
  border-color: var(--block-light);
}
```

### 5. Delete Button (Block Corner)

```css
.block-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.block:hover .block-delete {
  opacity: 1;
}

.block-delete:hover {
  background: rgba(255, 51, 102, 0.3);
  color: var(--color-action);
  box-shadow: 0 0 8px var(--glow-action);
}
```

### 6. Workspace/Canvas

```css
.workspace {
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.02) 0%, transparent 50%),
    var(--bg-primary);
  position: relative;
  overflow: hidden;
  flex: 1;
}

/* Subtle grid pattern (optional) */
.workspace::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, var(--border-color) 1px, transparent 1px),
    linear-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0;
  opacity: 0.1;
  pointer-events: none;
}
```

### 7. Control Buttons (Run / Stop)

```css
.button {
  padding: var(--space-md) var(--space-lg);
  border: 2px solid;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0);
  transition: all var(--transition-fast);
}

.button:hover::before {
  background: rgba(255, 255, 255, 0.1);
}

/* Run Button - Neon Green */
.button-run {
  background: linear-gradient(135deg, var(--color-game) 0%, var(--color-game-dark) 100%);
  color: #000;
  border-color: var(--color-game-light);
  box-shadow: 
    var(--shadow-md),
    0 0 12px var(--glow-game);
}

.button-run:hover {
  box-shadow: 
    var(--shadow-lg),
    0 0 20px var(--glow-game),
    inset 0 0 8px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.button-run:active {
  transform: translateY(1px);
}

/* Stop Button - Dark/Grey */
.button-stop {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-color);
  box-shadow: var(--shadow-md);
}

.button-stop:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-secondary);
  box-shadow: 
    var(--shadow-lg),
    0 0 12px rgba(224, 224, 255, 0.2);
}

/* Reset Button */
.button-reset {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.button-reset:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}
```

### 8. Block Header Bar

```css
.block-header {
  background: linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.block-header-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}

.block-header-controls {
  display: flex;
  gap: var(--space-md);
}
```

---

## Implementation Guide

### React CSS Variables Hook

```javascript
function useBlockCategory(category) {
  const categoryColors = {
    event: {
      color: 'var(--color-event)',
      dark: 'var(--color-event-dark)',
      light: 'var(--color-event-light)',
      glow: 'var(--glow-event)',
    },
    motion: {
      color: 'var(--color-motion)',
      dark: 'var(--color-motion-dark)',
      light: 'var(--color-motion-light)',
      glow: 'var(--glow-motion)',
    },
    // ... more categories
  };
  
  return categoryColors[category] || categoryColors.event;
}
```

### Example Block Component

```jsx
function Block({ category, label, icon, isSelected, isDragging }) {
  const colors = useBlockCategory(category);
  
  return (
    <div
      className={`block ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        '--block-color': colors.color,
        '--block-dark': colors.dark,
        '--block-glow': colors.glow,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <button className="block-delete">✕</button>
    </div>
  );
}
```

### Example Category Button

```jsx
function CategoryButton({ category, icon, isActive, onClick }) {
  const colors = useBlockCategory(category);
  
  return (
    <button
      className={`category-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        '--category-color': colors.color,
        '--category-glow': colors.glow,
      }}
    >
      {icon}
    </button>
  );
}
```

---

## CSS File Structure

```
src/
├── styles/
│   ├── variables.css          (All CSS variables)
│   ├── globals.css            (Global theme & resets)
│   ├── components/
│   │   ├── sidebar.css        (Sidebar styling)
│   │   ├── blocks.css         (Block styling)
│   │   ├── buttons.css        (Button styling)
│   │   └── workspace.css      (Canvas styling)
│   └── index.css              (Main import file)
```

---

## Notes

- **Neon Glow**: Use `box-shadow` with RGBA colors for the glowing effect. Avoid blur for sharp neon look.
- **Dark Theme**: Use `--bg-primary` (#0a0e27) as base. Keeps contrast high for neon colors.
- **High Contrast**: White text (#ffffff) ensures readability on all neon backgrounds.
- **Hover States**: Always add scale/glow changes for interaction feedback.
- **Gradients**: Subtle top-to-bottom gradients add depth without looking flat.
- **Performance**: Use `will-change: transform` on animated elements if needed.

---

## Color Palette Reference

| Category   | Main Color | Hex       | Brightness | Vibe          |
|------------|-----------|-----------|-----------|---------------|
| Event      | Yellow    | #FFD700   | Very High | Energetic     |
| Motion     | Cyan      | #00D9FF   | Very High | Cool, Quick   |
| Looks      | Magenta   | #FF00FF   | Very High | Creative      |
| Control    | Orange    | #FF6B35   | Very High | Warm, Action  |
| Sensing    | Aqua      | #00FFAA   | Very High | Fresh         |
| Sound      | Pink      | #FF10F0   | Very High | Fun, Dynamic  |
| Variables  | Gold      | #FFB700   | Very High | Solid, Warm   |
| Math       | Blue      | #00B4FF   | Very High | Smart         |
| Game       | Green     | #00FF41   | Very High | Success       |
| Physics    | Teal      | #00FFDD   | Very High | Technical     |

