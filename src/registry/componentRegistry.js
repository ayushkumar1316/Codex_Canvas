import Root from "@/renderer/components/Root";
import Container from "@/renderer/components/Container";
import Heading from "@/renderer/components/Heading";
import Text from "@/renderer/components/Text";
import Button from "@/renderer/components/Button";
import Input from "@/renderer/components/Input";
import Textarea from "@/renderer/components/Textarea";
import Image from "@/renderer/components/Image";
import Card from "@/renderer/components/Card";
export const componentRegistry = {
  root: Root,
  container: Container,
  heading: Heading,
  text: Text,
  button: Button,
  input: Input,
  textarea: Textarea,
  image: Image,
  card: Card,
};
export function getComponentByType(type) {
  return componentRegistry[type];
}
export function hasComponent(type) {
  return Object.prototype.hasOwnProperty.call(componentRegistry, type);
}