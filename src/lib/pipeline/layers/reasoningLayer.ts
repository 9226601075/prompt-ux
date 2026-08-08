import type { PipelineLayer } from "../types";

export const reasoningLayer: PipelineLayer = {
  id: "reasoning",
  name: "Reasoning Filter",
  run: async function (input, previousOutputs) {
    const output = `REASONING: ${input}\n- Encourage structured reasoning and tradeoff awareness.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Strengthened the reasoning path and decision-making guidance.",
      output,
      score: 86,
      compatibility: 85,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
