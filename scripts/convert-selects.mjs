import fs from 'fs';
import path from 'path';

const root = path.resolve('C:/ramajn/omolaraeniolaos/omolaraeniolaos-frontend');

function ensureImport(src) {
  if (
    src.includes("from '@/components/common/CommonSelect'") ||
    src.includes('from "@/components/common/CommonSelect"')
  ) {
    return src;
  }
  const client = src.match(/^(['"]use client['"];?\r?\n\r?\n)/);
  if (client) {
    return src.replace(client[0], `${client[0]}import CommonSelect from '@/components/common/CommonSelect';\n`);
  }
  const firstImport = src.indexOf('import ');
  if (firstImport >= 0) {
    return `${src.slice(0, firstImport)}import CommonSelect from '@/components/common/CommonSelect';\n${src.slice(firstImport)}`;
  }
  return `import CommonSelect from '@/components/common/CommonSelect';\n${src}`;
}

function parseOptions(inner) {
  if (/\{[^}]*\.map\(/.test(inner)) return null;
  const opts = [];
  const re = /<option\b([^>]*)>([\s\S]*?)<\/option>/g;
  let match;
  while ((match = re.exec(inner))) {
    const attrs = match[1];
    let label = match[2]
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    const quoted = attrs.match(/value=["']([^"']*)["']/);
    const braced = attrs.match(/value=\{([^}]+)\}/);
    let value;
    if (quoted) value = quoted[1];
    else if (braced) {
      const expr = braced[1].trim();
      if (/^['"].*['"]$/.test(expr)) value = expr.slice(1, -1);
      else return null;
    } else value = label;
    if (value === '') value = '__empty__';
    opts.push({ label, value });
  }
  return opts.length ? opts : null;
}

function convertFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('<select')) return 0;
  let count = 0;
  const next = src.replace(/<select\b([\s\S]*?)(?<![=])>([\s\S]*?)<\/select>/g, (full, attrs, inner) => {
    const opts = parseOptions(inner);
    if (!opts) return full;
    const valueMatch = attrs.match(/value=\{([^}]+)\}/);
    if (!valueMatch) return full;
    const valueExpr = valueMatch[1].trim();
    const ocBlock = attrs.match(/onChange=\{\(event\)\s*=>\s*\{([\s\S]*?)\}\s*\}/);
    const ocExpr =
      attrs.match(/onChange=\{\(event\)\s*=>\s*([^]+?)\}/) ||
      attrs.match(/onChange=\{\(e\)\s*=>\s*([^]+?)\}/);
    let body;
    if (ocBlock) body = ocBlock[1].trim().replace(/;\s*$/, '');
    else if (ocExpr) {
      body = ocExpr[1].split(/\n/)[0].trim().replace(/;\s*$/, '');
      const cut = body.search(/\s+(className|aria-|disabled|id)=/);
      if (cut > 0) body = body.slice(0, cut).trim();
    } else return full;

    const classMatch = attrs.match(/className="([^"]*)"/);
    let className = classMatch ? classMatch[1] : '';
    className = className.replace(/\bappearance-none\b/g, '').replace(/\s+/g, ' ').trim();
    const aria = attrs.match(/aria-label="([^"]*)"/);
    const id = attrs.match(/\bid="([^"]*)"/);
    const hasEmpty = opts.some((o) => o.value === '__empty__');
    const valueProp = hasEmpty && !valueExpr.includes('||') ? `(${valueExpr} || '__empty__')` : valueExpr;
    const items = opts
      .map((o) => `{ label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} }`)
      .join(', ');

    let onValueChange;
    if (hasEmpty) {
      const h = body.replace(/event\.target\.value/g, 'next').replace(/e\.target\.value/g, 'next');
      onValueChange = `(value) => { const next = value === '__empty__' ? '' : value; ${h}; }`;
    } else {
      const h = body.replace(/event\.target\.value/g, 'value').replace(/e\.target\.value/g, 'value');
      onValueChange = `(value) => { ${h}; }`;
    }

    count += 1;
    return `<CommonSelect
                  ${aria ? `aria-label="${aria[1]}"\n                  ` : ''}${id ? `id="${id[1]}"\n                  ` : ''}value={${valueProp}}
                  item={[${items}]}
                  w="100%"
                  onValueChange={${onValueChange}}
                  className="${className}"
                />`;
  });

  if (count > 0) {
    fs.writeFileSync(file, ensureImport(next));
  }
  return count;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'scripts'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

let total = 0;
for (const file of walk(root)) {
  const n = convertFile(file);
  if (n) {
    total += n;
    console.log(`updated ${path.relative(root, file)} (+${n})`);
  }
}
console.log(`converted ${total}`);
const left = walk(root).filter((f) => fs.readFileSync(f, 'utf8').includes('<select'));
console.log(`remaining ${left.length}`);
for (const f of left) console.log(` - ${path.relative(root, f)}`);
