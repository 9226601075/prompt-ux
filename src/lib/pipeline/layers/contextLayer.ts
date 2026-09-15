import type { PipelineLayer } from "../types";

export const contextLayer: PipelineLayer = {
  id: "context",
  name: "Context Filter",
  async run(input, previousOutputs) {
    const output = `CONTEXT: ${input}\n- Add audience, constraints, and relevant background.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Added audience context and useful constraints.",
      output,
      score: 86,
      compatibility: 87,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
