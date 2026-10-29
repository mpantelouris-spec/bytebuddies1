/**
 * Interface icons — solid, one colour (the text colour), like Scratch and
 * PictoBlox menus. Used in menus, tabs and buttons instead of emoji.
 *
 *   <Icon name="robot" />            a named Phosphor icon
 *   <EmojiIcon e={item.icon} />      the icon for an emoji already in the data
 *                                    (falls back to the emoji itself if none)
 */
import { ICONS, ICON_VIEWBOX, EMOJI_TO_ICON } from './icon-data.js';

const BASE_STYLE = { display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 };

export function Icon({ name, size = '1.15em', color, className = '', style, title }) {
  const body = ICONS[name];
  if (!body) return null;
  return (
    <svg
      className={`bb-icon ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      fill="currentColor"
      style={{ ...BASE_STYLE, ...(color ? { color } : null), ...style }}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + body }}
    />
  );
}

/** The icon name for an emoji (with or without the U+FE0F variation selector), or null. */
export function iconForEmoji(e) {
  if (typeof e !== 'string') return null;
  const key = e.trim().replace(/️/g, '');
  return EMOJI_TO_ICON[key] || null;
}

export function EmojiIcon({ e, size, color, className, style }) {
  const name = iconForEmoji(e);
  if (name) return <Icon name={name} size={size} color={color} className={className} style={style} />;
  if (e == null || e === '') return null;
  return <span className={className} style={style} aria-hidden="true">{e}</span>;
}

/**
 * Text that starts with an emoji ("🚀 Simulate") → icon + the rest of the text.
 * Leaves text alone when the emoji has no icon.
 */
const LEADING_EMOJI = /^\s*((?:\p{Extended_Pictographic}|[←-⇿⬅-⬇▶⏩-⏺])(?:️|‍\p{Extended_Pictographic})*)\s*/u;
export function IconText({ children, size, gap = '0.4em' }) {
  if (typeof children !== 'string') return children ?? null;
  const m = children.match(LEADING_EMOJI);
  const name = m && iconForEmoji(m[1]);
  if (!name) return children;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Icon name={name} size={size} />
      {children.slice(m[0].length)}
    </span>
  );
}

export default Icon;
