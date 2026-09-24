/**
 * Guards against Blockly toolbox crashes when selection is null
 * (e.g. clearSelection / refreshSelection calling isSelectable on null).
 * Lives outside virtual-robot-designer so the main app bundle does not pull the 3D studio chunk.
 */
import * as Blockly from 'blockly';

let _toolboxClickPatched = false;
function patchToolboxClickOnce() {
  if (_toolboxClickPatched) return;
  const proto = Blockly.Toolbox?.prototype;
  if (!proto || typeof proto.onClick_ !== 'function') return;
  _toolboxClickPatched = true;
  const origOnClick = proto.onClick_;
  proto.onClick_ = function safeOnClick_(e) {
    try {
      return origOnClick.call(this, e);
    } catch (err) {
      console.warn('[Blockly] toolbox onClick_ failed safely', err);
      try {
        const id = e?.target?.getAttribute?.('id');
        const item = id ? this.getToolboxItemById?.(id) : null;
        if (item && typeof item.isSelectable === 'function' && item.isSelectable()) {
          if (typeof this.setSelectedItem === 'function') this.setSelectedItem(item);
          item.onClick?.(e);
        }
      } catch { /* ignore */ }
    }
  };
}
patchToolboxClickOnce();

export function pickSelectableToolboxItem(items = []) {
  return items.find((it) => {
    if (!it) return false;
    if (typeof it.isSelectable !== 'function') return true;
    try { return it.isSelectable(); } catch { return false; }
  });
}

export function safeCloseToolboxFlyout(ws) {
  if (!ws || ws.isDisposed) return;
  try {
    ws.getToolbox?.()?.getFlyout?.()?.hide?.();
  } catch { /* ignore */ }
}

export function safeSelectToolboxItem(ws, item) {
  if (!ws || ws.isDisposed || !item) return false;
  try {
    if (typeof item.isSelectable === 'function') {
      try { if (!item.isSelectable()) return false; } catch { return false; }
    }
    const tb = ws.getToolbox?.();
    if (!tb) return false;
    if (typeof tb.setSelectedItem === 'function') tb.setSelectedItem(item);
    else if (typeof tb.selectItem === 'function') tb.selectItem(item);
    return true;
  } catch {
    return false;
  }
}

export function patchBlocklyToolbox(ws) {
  if (!ws || ws.isDisposed) return;
  const tb = ws.getToolbox?.();
  if (!tb || tb.__bbSafePatched) return;
  tb.__bbSafePatched = true;

  const wrap = (name, handler) => {
    const orig = tb[name]?.bind(tb);
    if (!orig || tb[`__bbOrig_${name}`]) return;
    tb[`__bbOrig_${name}`] = orig;
    tb[name] = (...args) => {
      try { return handler(orig, ...args); }
      catch (e) { console.warn(`[Blockly] ${name} failed safely`, e); }
    };
  };

  wrap('setSelectedItem', (orig, item) => {
    if (item != null) {
      if (typeof item.isSelectable === 'function') {
        try { if (!item.isSelectable()) return; } catch { return; }
      }
    } else if (!tb.getSelectedItem?.()) {
      safeCloseToolboxFlyout(ws);
      return;
    }
    return orig(item ?? null);
  });

  wrap('clearSelection', (orig) => {
    if (!tb.getSelectedItem?.()) {
      safeCloseToolboxFlyout(ws);
      return;
    }
    return orig();
  });

  wrap('refreshSelection', (orig) => {
    const sel = tb.getSelectedItem?.();
    if (!sel) return;
    if (typeof sel.isSelectable === 'function') {
      try { if (!sel.isSelectable()) return; } catch { return; }
    }
    return orig();
  });

  if (typeof tb.selectItem === 'function' && !tb.__bbOrig_selectItem) {
    tb.__bbOrig_selectItem = tb.selectItem.bind(tb);
    tb.selectItem = (item) => safeSelectToolboxItem(ws, item);
  }
}

export function safeOpenFirstToolboxCategory(ws) {
  if (!ws || ws.isDisposed) return;
  try {
    const tb = ws.getToolbox?.();
    const items = tb?.getToolboxItems?.() || [];
    const first = pickSelectableToolboxItem(items);
    if (first) safeSelectToolboxItem(ws, first);
  } catch { /* ignore */ }
}
