export default function Input({ node }) {
  const { placeholder, ...props } = node.props ?? {};
  return <input {...props} placeholder={placeholder} style={node.styles} />;
}
