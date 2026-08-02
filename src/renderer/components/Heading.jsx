export default function Heading({ node, children }) {
  const { level = 1, text, ...props } = node.props ?? {};
  const headingLevel = Number(level);
  const Tag = [1, 2, 3, 4, 5, 6].includes(headingLevel)
    ? `h${headingLevel}`
    : "h1";
  return (
    <Tag {...props} style={node.styles}>
      {text ?? children}
    </Tag>
  );
}
