"""Swap leading emoji in JSX text (e.g. `>💾 Save Design<`) for <EmojiIcon e="💾" />.
Only touches JSX text — never quoted strings, template literals or HTML strings.
Usage: python3 scripts/ui-icons/jsx-emoji-to-icons.py <file.jsx> [<file.jsx> ...]"""
import json, os, re, sys
MAP = json.load(open(os.path.join(os.path.dirname(__file__), 'emoji-map.json'), encoding='utf-8'))
KEYS = {k.replace('️', '') for k in MAP}
EMO = r'(?:[\U0001F300-\U0001FAFF☀-➿⬅-⬇⏩-⏺▶ℹ](?:️)?(?:‍[\U0001F300-\U0001FAFF☀-➿](?:️)?)*)'
ALONE = re.compile(r'(>\s*)(' + EMO + r')(\s*</)')
PAT = re.compile(r'(>\s*)(' + EMO + r')(\s+)(?=[A-Za-z&{])')

def in_string(line, pos):
    q = None
    i = 0
    while i < pos:
        c = line[i]
        if q:
            if c == '\\': i += 2; continue
            if c == q: q = None
        elif c in '\'"`': q = c
        i += 1
    return q is not None

total = 0
for path in sys.argv[1:]:
    src = open(path, encoding='utf-8').read()
    out_lines = []
    n = 0
    for line in src.split('\n'):
        if 'innerHTML' in line or 'dangerouslySetInnerHTML' in line:
            out_lines.append(line); continue
        def rep(m):
            global_n = 0
            e = m.group(2)
            if e.replace('️', '') not in KEYS or in_string(line, m.start(2)):
                return m.group(0)
            nonlocal_counter.append(1)
            return f'{m.group(1)}<EmojiIcon e="{e}" style={{{{ marginRight: \'0.35em\' }}}} />'
        nonlocal_counter = []
        line = PAT.sub(rep, line)
        # a lone emoji as the whole content of an element: <span ...>⚡</span>
        def rep_alone(m):
            e = m.group(2)
            if e.replace('\ufe0f', '') not in KEYS or in_string(line, m.start(2)):
                return m.group(0)
            nonlocal_counter.append(1)
            return f'{m.group(1)}<EmojiIcon e="{e}" />{m.group(3)}'
        line = ALONE.sub(rep_alone, line)
        # JSX text on its own line, right after a tag that ended on the previous line
        prev = next((l for l in reversed(out_lines) if l.strip()), '')
        if prev.rstrip().endswith('>') and not prev.rstrip().endswith('=>') and not nonlocal_counter:
            m2 = re.match(r'^(\s+)(' + EMO + r')(\s+)(?=[A-Za-z&{])', line)
            if m2 and m2.group(2).replace('\ufe0f', '') in KEYS:
                line = f'{m2.group(1)}<EmojiIcon e="{m2.group(2)}" style={{{{ marginRight: \'0.35em\' }}}} />' + line[m2.end():]
                nonlocal_counter.append(1)
        n += len(nonlocal_counter)
        out_lines.append(line)
    if n:
        out = '\n'.join(out_lines)
        if 'EmojiIcon' not in src:
            # add the import after the last import line
            rel = os.path.relpath('src/components/ui/Icon.jsx', os.path.dirname(path)).replace(os.sep, '/')
            if not rel.startswith('.'): rel = './' + rel
            lines = out.split('\n')
            last = max(i for i, l in enumerate(lines) if l.startswith('import '))
            # find end of a multi-line import
            while not lines[last].rstrip().endswith((';', "'", '"')): last += 1
            lines.insert(last + 1, f"import {{ EmojiIcon }} from '{rel}';")
            out = '\n'.join(lines)
        open(path, 'w', encoding='utf-8').write(out)
    print(f'{n:4d}  {path}')
    total += n
print(total, 'swapped')
