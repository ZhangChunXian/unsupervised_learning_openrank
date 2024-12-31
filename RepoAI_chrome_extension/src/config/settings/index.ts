import { defaultPrompts } from '../prompts/default'

export enum ThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Mode {
  HIGHLY_PRECISE = 0,
  PRECISE = 0.5,
  BALANCED = 1,
  CREATIVE = 1.5,
}

export type Settings = {
  quickMenu: {
    enabled: boolean
    items: typeof defaultPrompts
    excludedSites: string[]
  }
  chat: {
    openAIKey: string | null
    model: string | null
    mode: Mode
    openAiBaseUrl: string | null
  }
  general: {
    theme: ThemeOptions
    webpageContext: boolean
  }
}

export const defaultSettings: Settings = {
  quickMenu: {
    enabled: true,
    items: defaultPrompts,
    excludedSites: [],
  },
  chat: {
    openAIKey: "sk-kimDNLus4PpfufGKy23OTq2njyTQIaAtBsH3winVYZGgYQQ6",
    model: "gpt-4-gizmo-g-JtV1tF7gf",
    mode: Mode.BALANCED,
    openAiBaseUrl: "https://api.gptgod.online/v1/",
  },
  general: {
    theme: ThemeOptions.SYSTEM,
    webpageContext: false,
  },
}
