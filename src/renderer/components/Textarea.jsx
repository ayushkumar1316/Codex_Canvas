export default function Textarea({ node, children }) {
  const { placeholder, ...props } = node.props ?? {};
  return (
    <textarea {...props} placeholder={placeholder} style={node.styles}>
      {children}
    </textarea>
  );
}
