export interface PipelineLayerResult {
  id: string;
  name: string;
  summary: string;
  output: string;
  score: number;
  compatibility: number;
  metadata?: Record<string, unknown>;
}

export interface PipelineRunResult {
  finalPrompt: string;
  qualityScore: number;
  compatibilityScore: number;
  summary: string;
  layers: PipelineLayerResult[];
}

export interface PipelineLayer {
  id: string;
  name: string;
  run(input: string, previousOutputs: string[]): Promise<PipelineLayerResult>;
}
