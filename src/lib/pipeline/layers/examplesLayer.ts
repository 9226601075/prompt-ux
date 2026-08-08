import type { PipelineLayer } from "../types";

export const examplesLayer: PipelineLayer = {
  id: "examples",
  name: "Examples Filter",
  run: async function (input, previousOutputs) {
    const output = `EXAMPLES: ${input}\n- Add concrete examples and reference scenarios.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Added examples that make the prompt more actionable.",
      output,
      score: 84,
      compatibility: 83,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
