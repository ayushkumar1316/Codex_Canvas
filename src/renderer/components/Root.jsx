export default function Root({ node, children }) {
  const props = node.props ?? {};
  return (
    <div {...props} style={node.styles}>
      {children}
    </div>
  );
}
