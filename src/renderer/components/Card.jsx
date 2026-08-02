export default function Card({ node, children }) {
  const props = node.props ?? {};
  return (
    <div {...props} style={node.styles}>
      {children}
    </div>
  );
}
