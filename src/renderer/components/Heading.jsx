const HEADING_SIZES = { 1: "2.25rem", 2: "1.875rem", 3: "1.5rem", 4: "1.25rem", 5: "1.125rem", 6: "1rem" };

export default function Heading({ node, children }) {
  const { level = 1, text, ...restProps } = node.props ?? {};
  const headingLevel = Number(level);
  const safeLevel = [1, 2, 3, 4, 5, 6].includes(headingLevel) ? headingLevel : 1;
  const Tag = `h${safeLevel}`;
  const mergedStyles = {
    fontSize: HEADING_SIZES[safeLevel] || HEADING_SIZES[1],
    ...node.styles,
  };
  return (
    <Tag {...restProps} style={mergedStyles}>
      {text ?? children}
    </Tag>
  );
}
