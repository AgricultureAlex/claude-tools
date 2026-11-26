declare module 'claude-code' {
  interface PluginState {
    'usage-status': {
      contextPercent: number | null
      fiveHourPercent: number | null
      sevenDayPercent: number | null
      costUsd: number | null
    }
  }
}
