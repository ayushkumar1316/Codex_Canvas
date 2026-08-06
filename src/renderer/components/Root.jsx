const PAGE_DEFAULTS = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export default function Root({ node, children }) {
  const props = node.props ?? {};

  const mergedStyles = {
    ...PAGE_DEFAULTS,
    ...(node.styles ?? {}),
  };

  if (!mergedStyles.backgroundColor || mergedStyles.backgroundColor === "transparent") {
    mergedStyles.backgroundColor = PAGE_DEFAULTS.backgroundColor;
  }

  if (!mergedStyles.minHeight) {
    mergedStyles.minHeight = PAGE_DEFAULTS.minHeight;
  }

  if (!mergedStyles.display) {
    mergedStyles.display = PAGE_DEFAULTS.display;
  }

  if (!mergedStyles.flexDirection) {
    mergedStyles.flexDirection = PAGE_DEFAULTS.flexDirection;
  }

  if (!mergedStyles.color) {
    mergedStyles.color = PAGE_DEFAULTS.color;
  }

  if (!mergedStyles.fontFamily) {
    mergedStyles.fontFamily = PAGE_DEFAULTS.fontFamily;
  }

  return (
    <div {...props} style={mergedStyles}>
      {children}
    </div>
  );
}
