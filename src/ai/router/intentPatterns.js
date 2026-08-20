export const INTENT_PATTERNS = {
  generate: {
    keywords: [
      "create", "build", "generate", "make", "design", "develop",
      "construct", "compose", "draft", "start", "setup", "initialize",
      "from scratch", "new page", "new site", "new website",
      "create a", "create an", "build a", "build an",
      "make a", "make an", "design a", "design an",
      "generate a", "generate an",
    ],
    phrases: [
      "create portfolio", "create landing", "create dashboard",
      "create website", "create page", "create app",
      "build portfolio", "build landing", "build dashboard",
      "build website", "build page", "build app",
      "make portfolio", "make landing", "make dashboard",
      "make website", "make page", "make app",
      "design portfolio", "design landing", "design dashboard",
      "design website", "design page", "design app",
      "from scratch", "brand new", "start fresh",
    ],
    weight: 3,
  },

  edit: {
    keywords: [
      "edit", "change", "modify", "update", "replace", "rename",
      "revise", "alter", "adjust", "correct", "fix", "tweak",
      "switch", "turn", "convert", "transform", "customize",
      "recolor", "re-style", "restyle",
    ],
    phrases: [
      "change color", "change text", "change style", "change layout",
      "change button", "change heading", "change background",
      "update hero", "update button", "update text",
      "fix spacing", "fix alignment", "fix layout",
      "make it", "make this", "make them",
      "make the", "make all", "make these",
    ],
    weight: 2,
  },

  insert: {
    keywords: [
      "add", "insert", "append", "include", "attach", "embed",
      "inject", "place", "put", "throw in", "tack on",
    ],
    phrases: [
      "add section", "add component", "add card", "add button",
      "add navbar", "add footer", "add header", "add hero",
      "add pricing", "add testimonial", "add feature", "add image",
      "add text", "add heading", "add form", "add input",
      "add column", "add row", "add grid",
      "insert section", "insert component", "insert card",
      "insert navbar", "insert footer", "insert header",
    ],
    weight: 2,
  },

  delete: {
    keywords: [
      "delete", "remove", "erase", "clear", "drop", "destroy",
      "trash", "discard", "omit", "exclude", "cut", "eliminate",
      "get rid of", "nuke", "purge",
    ],
    phrases: [
      "remove footer", "remove header", "remove section",
      "remove card", "remove button", "remove image", "remove text",
      "delete footer", "delete header", "delete section",
      "delete card", "delete button", "delete image", "delete text",
      "get rid of",
    ],
    weight: 2,
  },

  style: {
    keywords: [
      "modern", "glassmorphism", "glass", "minimal", "minimalist",
      "premium", "elegant", "sleek", "dark mode", "light mode",
      "dark theme", "light theme", "neon", "retro", "vintage",
      "gradient", "shadow", "blur", "frosted", "matte", "glossy",
      "neumorphism", "brutalist", "flat", "material", "neumorphic",
      "color", "colors", "palette", "typography", "font",
      "aesthetic", "look and feel", "visual", "beautify",
    ],
    phrases: [
      "make modern", "make beautiful", "make pretty", "make clean",
      "make professional", "make elegant", "make minimal",
      "dark mode", "light mode", "dark theme", "light theme",
      "glass effect", "gradient background", "rounded corners",
      "more spacing", "better typography", "better colors",
      "visual upgrade", "design refresh",
    ],
    weight: 1,
  },

  layout: {
    keywords: [
      "layout", "align", "alignment", "center", "spacing",
      "margin", "padding", "width", "height", "position",
      "grid", "flex", "column", "row", "arrange", "reorder",
      "move", "resize", "reposition", "stack", "distribute",
      "justify", "horizontal", "vertical", "offset",
    ],
    phrases: [
      "two columns", "three columns", "four columns",
      "two column", "three column", "four column",
      "center content", "center align", "center everything",
      "move up", "move down", "move left", "move right",
      "more space", "less space", "tighten spacing", "increase spacing",
      "responsive", "breakpoint", "mobile", "desktop", "tablet",
      "sidebar", "navbar layout", "header layout", "footer layout",
    ],
    weight: 1,
  },

  content: {
    keywords: [
      "content", "text", "label", "title", "heading", "paragraph",
      "description", "caption", "placeholder", "copy", "wording",
      "word", "sentence", "phrase", "name", "tagline", "subtitle",
      "rewrite", "rephrase", "reword",
    ],
    phrases: [
      "replace heading", "replace text", "replace description",
      "change heading", "change text", "change description",
      "change title", "change label", "change copy",
      "rewrite copy", "rewrite text", "rewrite heading",
      "update content", "update text", "update heading",
      "better copy", "better wording", "better text",
    ],
    weight: 1,
  },

  image: {
    keywords: [
      "image", "photo", "picture", "screenshot", "design",
      "mockup", "wireframe", "sketch", "reference", "upload",
      "uploaded", "attached", "import", "figma", "canvas",
    ],
    phrases: [
      "this image", "this design", "this screenshot",
      "the image", "the design", "the screenshot",
      "from image", "from design", "from screenshot",
      "based on image", "based on design", "based on the",
      "like the image", "like this", "similar to",
      "match the", "make it look like",
    ],
    weight: 1,
  },
};

export const INTENT_PRIORITY = [
  "image",
  "voice",
  "generate",
  "delete",
  "insert",
  "edit",
  "style",
  "layout",
  "content",
];

export const OPERATION_MAP = {
  generate: ["insertNode", "replaceNode"],
  edit: ["updateProps", "updateStyles"],
  insert: ["insertNode"],
  delete: ["deleteNode"],
  style: ["updateStyles"],
  layout: ["updateProps", "updateStyles"],
  content: ["updateProps"],
  image: ["insertNode", "updateProps"],
  voice: ["updateProps", "updateStyles"],
  unknown: ["updateProps"],
};

export const FUTURE_INTENTS = [
  "animation",
  "responsive",
  "accessibility",
  "performance",
  "export",
  "theme",
  "ai_repair",
];
