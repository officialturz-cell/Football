export type PromptOptions = {
  temperature: number
  topP?: number
  maxTokens?: number
}

export const DEFAULT_PROMPT_OPTIONS: PromptOptions = {
  temperature: 0.0,
  topP: 0.9,
  maxTokens: 2048
}
