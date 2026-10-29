"""Wrap JSX child expressions that produce emoji-led text, e.g.
   >{t === 'new' ? '🆕' : '🔥'} New   or   >{loading ? 'Loading…' : '🔄 Remix'}
in <IconText>…</IconText>, which turns a leading emoji into an interface icon at
runtime and leaves anything else untouched. Only expressions that sit directly
inside a JSX element (previous character '>') are touched."""
import json, os, re, sys
MAP = json.load(open(os.path.join(os.path.dirname(__file__), 'emoji-map.json'), encoding='utf-8'))
KEYS = {k.replace('️', '') for k in MAP}
LIT = re.compile(r"""(['"`])((?:[\U0001F300-\U0001FAFF☀-➿⬅-⬇⏩-⏺▶](?:️)?(?:‍[\U0001F300-\U0001FAFF☀-➿](?:️)?)*))""")
SKIP_PARENTS = ('<IconText', '<option', '<text', '<tspan', '<title', '<textarea')

def matching(s, i):
    depth = 0; q = None; j = i
    while j < len(s):
        c = s[j]
        if q:
            if c == '\\': j += 2; continue
            if c == q: q = None
        elif c in '\'"`': q = c
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return j
        j += 1
    return -1

total = 0
for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    out = []; i = 0; n = 0
    while True:
        k = s.find('{', i)
        if k < 0: out.append(s[i:]); break
        # previous non-space char must be '>' (JSX child)
        p = k - 1
        while p >= 0 and s[p] in ' \t\n': p -= 1
        end = matching(s, k)
        if p >= 0 and s[p] == '>' and end > 0 and s[p-1:p+1] != '=>':
            expr = s[k+1:end]
            tag_start = s.rfind('<', 0, p)
            parent = s[tag_start:p+1]
            ok = ('<' not in expr and 'IconText' not in expr and 'EmojiIcon' not in expr
                  and not parent.startswith(SKIP_PARENTS) and not parent.startswith('</')
                  and any(m.group(2).replace('️', '') in KEYS for m in LIT.finditer(expr)))
            if ok:
                out.append(s[i:k]); out.append('<IconText>{' + expr + '}</IconText>')
                i = end + 1; n += 1; continue
        out.append(s[i:k+1]); i = k + 1
    if n:
        s2 = ''.join(out)
        m = re.search(r"import \{([^}]*)\} from '([^']*ui/Icon(?:\.jsx)?)';", s2)
        if m and 'IconText' not in m.group(1):
            s2 = s2.replace(m.group(0), f"import {{{m.group(1).rstrip()}, IconText }} from '{m.group(2)}';", 1)
        elif not m:
            rel = os.path.relpath('src/components/ui/Icon.jsx', os.path.dirname(path)).replace(os.sep, '/')
            if not rel.startswith('.'): rel = './' + rel
            lines = s2.split('\n'); last = max(x for x, l in enumerate(lines) if l.startswith('import '))
            while not lines[last].rstrip().endswith((';', "'", '"')): last += 1
            lines.insert(last + 1, f"import {{ IconText }} from '{rel}';"); s2 = '\n'.join(lines)
        open(path, 'w', encoding='utf-8').write(s2)
    print(f'{n:4d}  {path}'); total += n
print(total, 'wrapped')
