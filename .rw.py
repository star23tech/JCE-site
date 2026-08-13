"""Replace element inner text by matching on whitespace-collapsed content."""
import re, io, sys

def rewrite(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    done = 0
    for old, new in pairs:
        key = re.sub(r'\s+', ' ', old).strip()
        pat = re.compile(r'>(\s*)' + r'\s+'.join(map(re.escape, key.split())) + r'(\s*)<')
        m = pat.search(s)
        if m:
            s = s[:m.start()] + '>' + m.group(1) + new + m.group(2) + '<' + s[m.end():]
            done += 1
        else:
            print('  NOT FOUND:', key[:64])
    io.open(path, 'w', encoding='utf-8', newline='').write(s)
    print(f'  {done}/{len(pairs)} replaced in {path}')
