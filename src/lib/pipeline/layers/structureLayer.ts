import type { PipelineLayer } from "../types";

export const structureLayer: PipelineLayer = {
  id: "structure",
  name: "Structure Filter",
  async run(input, previousOutputs) {
    const output = `STRUCTURE: ${input}\n- Organize the response with sections, steps, or a clear format.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Improved structure and readability.",
      output,
      score: 87,
      compatibility: 84,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
