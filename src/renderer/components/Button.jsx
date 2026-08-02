export default function Button({ node, children }) {
  const { text, ...props } = node.props ?? {};
  return (
    <button {...props} style={node.styles}>
      {text ?? children}
    </button>
  );
}
