import type { PipelineLayer, PipelineLayerResult } from "../types";

export const clarityLayer: PipelineLayer = {
  id: "clarity",
  name: "Clarity Filter",
  async run(input, previousOutputs) {
    const output = `CLARITY: ${input}\n- Remove ambiguity and state the core objective clearly.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Clarified the objective and removed ambiguity.",
      output,
      score: 88,
      compatibility: 85,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
