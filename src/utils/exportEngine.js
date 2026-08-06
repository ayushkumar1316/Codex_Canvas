import JSZip from "jszip";
import { saveAs } from "file-saver";

function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}

function flattenComponents(node, components = []) {
  if (!node) return components;
  if (node.id !== "root") {
    components.push(node);
  }
  for (const child of node.children ?? []) {
    flattenComponents(child, components);
  }
  return components;
}

function stylesToCSS(styles) {
  if (!styles || typeof styles !== "object") return "";
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join("\n    ");
}

function generateComponentName(type, index) {
  const base = type.charAt(0).toUpperCase() + type.slice(1);
  return `${base}${index}`;
}

export function exportToJSON(canvas) {
  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    canvas: {
      id: canvas.id,
      name: canvas.name,
      createdAt: canvas.createdAt,
      updatedAt: canvas.updatedAt,
    },
    componentTree: cloneTree(canvas.componentTree),
  };

  return JSON.stringify(exportData, null, 2);
}

export function importFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data.version || !data.componentTree) {
      throw new Error("Invalid project format: missing version or componentTree");
    }

    if (!data.canvas || !data.canvas.id) {
      throw new Error("Invalid project format: missing canvas metadata");
    }

    return {
      success: true,
      data: {
        canvas: data.canvas,
        componentTree: data.componentTree,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to parse JSON",
    };
  }
}

export function generateHTML(tree, canvasName) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${canvasName || "Exported Project"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  ${generateHTMLNode(tree)}
</body>
</html>`;

  return html;
}

function generateHTMLNode(node) {
  if (!node) return "";

  const tag = getTagForType(node.type);
  const attrs = generateHTMLAttributes(node);
  const children = (node.children ?? [])
    .map((child) => generateHTMLNode(child))
    .join("\n      ");

  const content = getNodeContent(node);

  if (children || content) {
    return `<${tag}${attrs}>
      ${content}${children ? "\n      " + children : ""}
    </${tag}>`;
  }

  return `<${tag}${attrs} />`;
}

function getTagForType(type) {
  const tagMap = {
    root: "div",
    container: "div",
    heading: "h2",
    text: "p",
    button: "button",
    input: "input",
    textarea: "textarea",
    image: "img",
    card: "div",
  };
  return tagMap[type] || "div";
}

function generateHTMLAttributes(node) {
  const attrs = [];

  if (node.type === "image") {
    attrs.push(`src="${node.props?.src || ""}"`);
    attrs.push(`alt="${node.props?.alt || ""}"`);
  } else if (node.type === "input") {
    attrs.push(`type="text"`);
    attrs.push(`placeholder="${node.props?.placeholder || ""}"`);
  } else if (node.type === "textarea") {
    attrs.push(`placeholder="${node.props?.placeholder || ""}"`);
  }

  const css = stylesToCSS(node.styles);
  if (css) {
    attrs.push(`style="${css.replace(/\n/g, " ")}"`);
  }

  return attrs.length > 0 ? " " + attrs.join(" ") : "";
}

function getNodeContent(node) {
  if (node.type === "image") return "";
  if (node.type === "input" || node.type === "textarea") return "";
  return node.props?.text || "";
}

export function generateReactProject(tree, canvasName) {
  const components = flattenComponents(tree);
  const componentMap = new Map();

  components.forEach((comp, index) => {
    const name = generateComponentName(comp.type, index);
    componentMap.set(comp.id, name);
  });

  const files = {};

  files["package.json"] = JSON.stringify(
    {
      name: (canvasName || "exported-project")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
      },
      devDependencies: {
        "@vitejs/plugin-react": "^4.0.0",
        vite: "^5.0.0",
      },
    },
    null,
    2
  );

  files["vite.config.js"] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;

  files["index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${canvasName || "Exported Project"}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

  files["src/main.jsx"] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

  files["src/styles/global.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`;

  files["src/App.jsx"] = generateReactComponent(
    tree,
    componentMap,
    "App",
    true
  );

  components.forEach((comp) => {
    const name = componentMap.get(comp.id);
    if (name) {
      files[`src/components/${name}.jsx`] = generateReactComponent(
        comp,
        componentMap,
        name,
        false
      );
    }
  });

  files["README.md"] = `# ${canvasName || "Exported Project"}

This project was exported from Codex Canvas.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Structure

- \`src/components/\` - Reusable React components
- \`src/App.jsx\` - Main application component
- \`src/main.jsx\` - Entry point
- \`src/styles/\` - Global styles
`;

  return files;
}

function generateReactComponent(node, componentMap, name, isRoot) {
  const children = (node.children ?? [])
    .map((child) => {
      const childName = componentMap.get(child.id);
      if (childName) {
        return `<${childName} />`;
      }
      return generateInlineJSX(child);
    })
    .join("\n      ");

  const styleObj = stylesToObject(node.styles);
  const styleStr = styleObj
    ? `const styles = ${JSON.stringify(styleObj, null, 2)};`
    : "";

  return `import React from 'react';

${styleStr}

export default function ${name}(${isRoot ? "" : "{ ...props }"}) {
  return (
    ${generateJSXWithChildren(node, children, styleStr ? "styles" : null)}
  );
}`;
}

function generateInlineJSX(node) {
  const styleObj = stylesToObject(node.styles);
  const styleAttr = styleObj
    ? ` style={${JSON.stringify(styleObj)}}`
    : "";

  if (node.type === "image") {
    return `<img src="${node.props?.src || ""}" alt="${node.props?.alt || ""}"${styleAttr} />`;
  }

  if (node.type === "input") {
    return `<input type="text" placeholder="${node.props?.placeholder || ""}"${styleAttr} />`;
  }

  if (node.type === "textarea") {
    return `<textarea placeholder="${node.props?.placeholder || ""}"${styleAttr} />`;
  }

  const content = node.props?.text || "";
  const tag = getTagForType(node.type);

  return `<${tag}${styleAttr}>${content}</${tag}>`;
}

function generateJSXWithChildren(node, children, styleVar) {
  const styleAttr = styleVar ? ` style={${styleVar}}` : "";
  const tag = getTagForType(node.type);

  if (node.type === "image") {
    return `<img src="${node.props?.src || ""}" alt="${node.props?.alt || ""}"${styleAttr} />`;
  }

  if (node.type === "input") {
    return `<input type="text" placeholder="${node.props?.placeholder || ""}"${styleAttr} />`;
  }

  if (node.type === "textarea") {
    return `<textarea placeholder="${node.props?.placeholder || ""}"${styleAttr} />`;
  }

  const content = node.props?.text || "";

  if (children) {
    return `<${tag}${styleAttr}>\n        ${content}\n        ${children}\n      </${tag}>`;
  }

  return `<${tag}${styleAttr}>${content}</${tag}>`;
}

function stylesToObject(styles) {
  if (!styles || typeof styles !== "object") return null;
  const result = { ...styles };
  return Object.keys(result).length > 0 ? result : null;
}

export async function downloadAsZIP(files, filename) {
  const zip = new JSZip();

  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${filename || "export"}.zip`);
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content, filename, type = "text/plain") {
  const blob = new Blob([content], { type });
  saveAs(blob, filename);
}
