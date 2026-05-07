export function generateCodeFromBlocks(blockType, params = {}) {
  const generators = {
    python: generatePython,
    javascript: generateJavaScript,
    html: generateHTML,
  };
  return generators[params.language || 'python']?.(blockType, params) || '';
}

function generatePython(blockType, params) {
  const templates = {
    'print': `print("${params.text || 'Hello, World!'}")`,
    'variable': `${params.name || 'x'} = ${params.value || '0'}`,
    'if': `if ${params.condition || 'x > 0'}:\n    ${params.body || 'print("Yes!")'}`,
    'for': `for ${params.var || 'i'} in range(${params.count || '10'}):\n    ${params.body || 'print(i)'}`,
    'while': `while ${params.condition || 'True'}:\n    ${params.body || 'pass'}`,
    'function': `def ${params.name || 'my_function'}(${params.args || ''}):\n    ${params.body || 'pass'}`,
    'list': `${params.name || 'my_list'} = [${params.items || '1, 2, 3'}]`,
    'class': `class ${params.name || 'MyClass'}:\n    def __init__(self):\n        ${params.body || 'pass'}`,
    'input': `${params.name || 'answer'} = input("${params.prompt || 'Enter value: '}")`,
    'random': `import random\n${params.name || 'num'} = random.randint(${params.min || '1'}, ${params.max || '100'})`,
  };
  return templates[blockType] || `# ${blockType}`;
}

function generateJavaScript(blockType, params) {
  const templates = {
    'print': `console.log("${params.text || 'Hello, World!'}");`,
    'variable': `let ${params.name || 'x'} = ${params.value || '0'};`,
    'if': `if (${params.condition || 'x > 0'}) {\n  ${params.body || 'console.log("Yes!");'}\n}`,
    'for': `for (let ${params.var || 'i'} = 0; ${params.var || 'i'} < ${params.count || '10'}; ${params.var || 'i'}++) {\n  ${params.body || 'console.log(i);'}\n}`,
    'while': `while (${params.condition || 'true'}) {\n  ${params.body || 'break;'}\n}`,
    'function': `function ${params.name || 'myFunction'}(${params.args || ''}) {\n  ${params.body || 'return;'}\n}`,
    'array': `const ${params.name || 'myArray'} = [${params.items || '1, 2, 3'}];`,
    'class': `class ${params.name || 'MyClass'} {\n  constructor() {\n    ${params.body || ''}\n  }\n}`,
    'event': `document.addEventListener("${params.event || 'click'}", (e) => {\n  ${params.body || 'console.log(e);'}\n});`,
    'fetch': `fetch("${params.url || '/api/data'}")\n  .then(res => res.json())\n  .then(data => console.log(data));`,
  };
  return templates[blockType] || `// ${blockType}`;
}

function generateHTML(blockType, params) {
  const templates = {
    'heading': `<h1>${params.text || 'My Heading'}</h1>`,
    'paragraph': `<p>${params.text || 'Hello, World!'}</p>`,
    'button': `<button onclick="${params.action || "alert('Clicked!')"}">${params.text || 'Click Me'}</button>`,
    'image': `<img src="${params.src || 'https://via.placeholder.com/300'}" alt="${params.alt || 'Image'}" />`,
    'div': `<div class="${params.class || 'container'}">\n  ${params.body || ''}\n</div>`,
    'link': `<a href="${params.url || '#'}">${params.text || 'Link'}</a>`,
    'list': `<ul>\n  <li>${params.items?.split(',').join('</li>\n  <li>') || 'Item 1</li>\n  <li>Item 2'}</li>\n</ul>`,
    'input': `<input type="${params.type || 'text'}" placeholder="${params.placeholder || 'Enter text...'}" />`,
  };
  return templates[blockType] || `<!-- ${blockType} -->`;
}

export function formatCode(code, language) {
  return code;
}

export function detectLanguage(code) {
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
  if (code.includes('<!DOCTYPE') || code.includes('<html')) return 'html';
  if (code.includes('const ') || code.includes('function ') || code.includes('console.log')) return 'javascript';
  return 'python';
}
