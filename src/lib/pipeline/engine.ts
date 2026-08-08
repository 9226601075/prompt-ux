import type { PipelineLayer, PipelineRunResult } from "./types";

export class PromptPipelineEngine {
  constructor(private readonly layers: PipelineLayer[]) {}

  async run(initialInput: string): Promise<PipelineRunResult> {
    const layers: PipelineRunResult["layers"] = [];
    let currentInput = initialInput;
    const previousOutputs: string[] = [];

    for (const layer of this.layers) {
      const result = await layer.run(currentInput, previousOutputs);
      layers.push(result);
      previousOutputs.push(result.output);
      currentInput = result.output;
    }

    const qualityScore = Math.round(
      layers.reduce((total, layer) => total + layer.score, 0) / Math.max(layers.length, 1),
    );

    const compatibilityScore = Math.round(
      layers.reduce((total, layer) => total + layer.compatibility, 0) / Math.max(layers.length, 1),
    );

    const summary = layers
      .map((layer) => `${layer.name}: ${layer.summary}`)
      .join(" \n");

    return {
      finalPrompt: currentInput,
      qualityScore,
      compatibilityScore,
      summary,
      layers,
    };
  }
}
