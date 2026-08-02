const componentNodeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
    },
    type: {
      type: "string",
      enum: [
        "root",
        "container",
        "heading",
        "text",
        "button",
        "input",
        "textarea",
        "image",
        "card",
      ],
    },
    props: {
      type: "object",
      additionalProperties: true,
    },
    styles: {
      type: "object",
      additionalProperties: true,
    },
    children: {
      type: "array",
      items: {
        $ref: "#/$defs/componentNode",
      },
    },
  },
  required: ["id", "type", "props", "styles", "children"],
};

export const aiPatchSchema = {
  type: "json_schema",
  name: "component_tree_patch",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      version: {
        type: "string",
        const: "1.0",
      },
      operations: {
        type: "array",
        items: {
          oneOf: [
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: {
                  type: "string",
                  const: "updateProps",
                },
                targetId: {
                  type: "string",
                },
                props: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              required: ["type", "targetId", "props"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: {
                  type: "string",
                  const: "updateStyles",
                },
                targetId: {
                  type: "string",
                },
                styles: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              required: ["type", "targetId", "styles"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: {
                  type: "string",
                  const: "insertNode",
                },
                parentId: {
                  type: "string",
                },
                position: {
                  type: "string",
                  enum: ["start", "end"],
                },
                node: {
                  $ref: "#/$defs/componentNode",
                },
              },
              required: ["type", "parentId", "position", "node"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: {
                  type: "string",
                  const: "deleteNode",
                },
                targetId: {
                  type: "string",
                },
              },
              required: ["type", "targetId"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: {
                  type: "string",
                  const: "replaceNode",
                },
                targetId: {
                  type: "string",
                },
                node: {
                  $ref: "#/$defs/componentNode",
                },
              },
              required: ["type", "targetId", "node"],
            },
          ],
        },
      },
    },
    required: ["version", "operations"],
    $defs: {
      componentNode: componentNodeSchema,
    },
  },
};

export default aiPatchSchema;
