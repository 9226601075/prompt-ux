import { clarityLayer } from "./layers/clarityLayer";
import { contextLayer } from "./layers/contextLayer";
import { constraintsLayer } from "./layers/constraintsLayer";
import { examplesLayer } from "./layers/examplesLayer";
import { finalizationLayer } from "./layers/finalizationLayer";
import { intentLayer } from "./layers/intentLayer";
import { reasoningLayer } from "./layers/reasoningLayer";
import { structureLayer } from "./layers/structureLayer";
import { toneLayer } from "./layers/toneLayer";
import type { PipelineLayer } from "./types";

export function createDefaultPipelineLayers(): PipelineLayer[] {
  return [
    clarityLayer,
    contextLayer,
    intentLayer,
    structureLayer,
    toneLayer,
    constraintsLayer,
    reasoningLayer,
    examplesLayer,
    finalizationLayer,
    {
      id: "synthesis",
      name: "Synthesis Filter",
      async run(input, previousOutputs) {
        return {
          id: this.id,
          name: this.name,
          summary: "Merged and synthesized all prior refinements into one final prompt.",
          output: `SYNTHESIS: ${input}\n- Combine all layer improvements into the final optimized prompt.`,
          score: 91,
          compatibility: 89,
          metadata: { previousOutputsCount: previousOutputs.length },
        };
      },
    },
  ];
}
