import type { PipelineLayer } from "../types";

export const toneLayer: PipelineLayer = {
  id: "tone",
  name: "Tone Filter",
  async run(input, previousOutputs) {
    const output = `TONE: ${input}\n- Adapt the wording to the requested voice and style.`;
    return {
      id: this.id,
      name: this.name,
      summary: "Adjusted the tone for the intended audience.",
      output,
      score: 85,
      compatibility: 83,
      metadata: { previousOutputsCount: previousOutputs.length },
    };
  },
};
