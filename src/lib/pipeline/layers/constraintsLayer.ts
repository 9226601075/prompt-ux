import type { PipelineLayer } from "../types";

export const constraintsLayer: PipelineLayer = {
  id: "constraints",
  name: "Constraints Filter",
  run: async function (input, previousOutputs) {
    const output = `CONSTRAINTS: ${input}\n- Add explicit limitations, success criteria, and boundaries.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Inserted explicit constraints and boundaries.",
      output,
      score: 83,
      compatibility: 82,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
