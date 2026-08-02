export default function Image({ node }) {
  const { src, alt, ...props } = node.props ?? {};
  return <img {...props} src={src} alt={alt} style={node.styles} />;
}
