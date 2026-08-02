import { z } from "zod";

export const ComponentTypeSchema = z.enum([
  "root",
  "container",
  "heading",
  "text",
  "button",
  "input",
  "textarea",
  "image",
  "card",
]);

export const BaseComponentSchema = z.object({
  id: z.string(),
  type: ComponentTypeSchema,
  props: z.record(z.string(), z.unknown()).optional(),
  styles: z.record(z.string(), z.unknown()).optional(),
});

export const ComponentSchema = BaseComponentSchema.extend({
  children: z.array(z.lazy(() => ComponentSchema)).default([]),
});

export const RootTreeSchema = ComponentSchema.extend({
  type: z.literal("root"),
});
