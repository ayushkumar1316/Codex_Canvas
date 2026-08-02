export default function Text({ node, children }) {
  const { text, ...props } = node.props ?? {};
  return (
    <p {...props} style={node.styles}>
      {text ?? children}
    </p>
  );
}
