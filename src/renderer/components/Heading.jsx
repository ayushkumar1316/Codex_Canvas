const HEADING_SIZES = { 1: "2.25rem", 2: "1.875rem", 3: "1.5rem", 4: "1.25rem", 5: "1.125rem", 6: "1rem" };

export default function Heading({ node, children }) {
  const { level = 1, text, ...props } = node.props ?? {};
  const headingLevel = Number(level);
  const Tag = [1, 2, 3, 4, 5, 6].includes(headingLevel)
    ? `h${headingLevel}`
    : "h1";
  const mergedStyles = {
    fontSize: HEADING_SIZES[headingLevel] || HEADING_SIZES[1],
    ...node.styles,
  };
  return (
    <Tag {...props} style={mergedStyles}>
      {text ?? children}
    </Tag>
  );
}
