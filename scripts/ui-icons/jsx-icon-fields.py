"""Render data-driven icons ({item.icon}) through <EmojiIcon>, so emoji in menu/tab/tile
data show as interface icons. Values that aren't mapped emoji render unchanged.
Only `.icon` fields — lesson pictures (`.emoji`) are left alone."""
import os, re, sys
EXPR = r'([A-Za-z_$][\w$]*(?:\??\.[\w$]+|\[[^\]]+\])*\??\.icon)'
ALONE = re.compile(r'(>\s*)\{' + EXPR + r'\}(\s*</)')
LEAD = re.compile(r'(>\s*)\{' + EXPR + r'\}(\s+)(?=[A-Za-z{])')
total = 0
for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    n = 0
    def a(m):
        global n
        return f'{m.group(1)}<EmojiIcon e={{{m.group(2)}}} />{m.group(3)}'
    s2, k1 = ALONE.subn(lambda m: f'{m.group(1)}<EmojiIcon e={{{m.group(2)}}} />{m.group(3)}', s)
    s2, k2 = LEAD.subn(lambda m: f'{m.group(1)}<EmojiIcon e={{{m.group(2)}}} style={{{{ marginRight: \'0.35em\' }}}} />', s2)
    n = k1 + k2
    if n:
        if 'EmojiIcon' not in s:
            rel = os.path.relpath('src/components/ui/Icon.jsx', os.path.dirname(path)).replace(os.sep, '/')
            if not rel.startswith('.'): rel = './' + rel
            lines = s2.split('\n')
            last = max(i for i, l in enumerate(lines) if l.startswith('import '))
            while not lines[last].rstrip().endswith((';', "'", '"')): last += 1
            lines.insert(last + 1, f"import {{ EmojiIcon }} from '{rel}';")
            s2 = '\n'.join(lines)
        elif not re.search(r'import\s*\{[^}]*\bEmojiIcon\b', s2):
            print('  !! uses EmojiIcon without import:', path)
        open(path, 'w', encoding='utf-8').write(s2)
        print(f'{n:4d}  {path}')
    total += n
print(total, 'icon fields')
