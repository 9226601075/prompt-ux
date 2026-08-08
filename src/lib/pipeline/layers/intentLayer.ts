import type { PipelineLayer, PipelineLayerResult } from "../types";

export const intentLayer: PipelineLayer = {
  id: "intent",
  name: "Intent Filter",
  async run(input, previousOutputs) {
    const output = `INTENT: ${input}\n- Align the prompt with the desired outcome and success criteria.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Aligned the prompt with the intended outcome.",
      output,
      score: 84,
      compatibility: 86,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
