export const CANVAS_STATE = {
  EMPTY: "EMPTY",
  PARTIAL: "PARTIAL",
  COMPLETE: "COMPLETE",
  UNKNOWN: "UNKNOWN",
};

export const RECOMMENDED_ACTION = {
  GENERATE_NEW: "GENERATE_NEW",
  CONTINUE_BUILDING: "CONTINUE_BUILDING",
  EDIT_EXISTING: "EDIT_EXISTING",
  REPLACE_EXISTING: "REPLACE_EXISTING",
  ASK_USER: "ASK_USER",
};

export const SECTION_SCORES = {
  hero: 20,
  navbar: 15,
  header: 15,
  footer: 15,
  features: 15,
  projects: 15,
  portfolio: 15,
  contact: 10,
  testimonials: 10,
  faq: 10,
  pricing: 10,
  about: 10,
  services: 10,
  team: 10,
  cta: 10,
  stats: 10,
  blog: 10,
  newsletter: 5,
  logo: 5,
  sidebar: 5,
  menu: 5,
  nav: 5,
  navigation: 5,
};

export const SECTION_KEYWORDS = {
  hero: ["hero", "banner", "jumbotron", "masthead", "intro", "landing"],
  navbar: ["navbar", "nav", "navigation", "menu", "header-nav", "top-bar"],
  header: ["header", "page-header", "site-header"],
  footer: ["footer", "page-footer", "site-footer"],
  features: ["features", "feature", "capabilities", "benefits", "highlights"],
  projects: ["projects", "portfolio", "work", "showcase", "gallery"],
  contact: ["contact", "contact-us", "get-in-touch", "reach-out"],
  testimonials: ["testimonials", "testimonial", "reviews", "feedback", "quotes"],
  faq: ["faq", "faqs", "questions", "accordion"],
  pricing: ["pricing", "plans", "packages", "rates"],
  about: ["about", "about-us", "our-story", "company"],
  services: ["services", "service", "what-we-do", "offerings"],
  team: ["team", "our-team", "people", "staff"],
  cta: ["cta", "call-to-action", "action", "subscribe"],
  stats: ["stats", "statistics", "numbers", "metrics", "counters"],
  blog: ["blog", "posts", "articles", "news"],
  newsletter: ["newsletter", "signup", "subscribe-form"],
  logo: ["logo", "brand", "mark"],
  sidebar: ["sidebar", "side-panel", "aside"],
};

export const COMPLETENESS_THRESHOLDS = {
  [CANVAS_STATE.EMPTY]: 0,
  [CANVAS_STATE.PARTIAL]: 30,
  [CANVAS_STATE.COMPLETE]: 70,
};

export const MIN_COMPONENTS_FOR_PARTIAL = 2;
export const MIN_SECTIONS_FOR_COMPLETE = 3;
export const MIN_TREE_DEPTH_FOR_COMPLETE = 2;

export const REQUIRED_SECTIONS_FOR_COMPLETE = ["hero", "footer"];
export const RECOMMENDED_SECTIONS_FOR_COMPLETE = ["hero", "features", "footer"];
