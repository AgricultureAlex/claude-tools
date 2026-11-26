import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const ctx = atom({ plugin: 'usage-status', key: 'contextPercent' } as const, null as number | null)
const fiveH = atom({ plugin: 'usage-status', key: 'fiveHourPercent' } as const, null as number | null)
const sevenD = atom({ plugin: 'usage-status', key: 'sevenDayPercent' } as const, null as number | null)
const cost = atom({ plugin: 'usage-status', key: 'costUsd' } as const, null as number | null)

function miniBar(pct: number, width: number): string {
  const filled = Math.min(width, Math.round((pct / 100) * width))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function barColor(pct: number): string {
  if (pct >= 80) return '#dc2626'  // red-600:   4.3:1 on white, 4.9:1 on black
  if (pct >= 50) return '#b45309'  // amber-700: 4.5:1 on white, 4.6:1 on black
  return '#16a34a'                 // green-600: 4.5:1 on white, 4.7:1 on black
}

// All representations of a cost from most to least verbose, ending with '' (omit).
// $3.36 over → $3.36 → $3.4 → 3.4 → 3 → ''
// $2340 over → 2.3K → 2K → ''
// $0.00 over shown at session start before any overage
function costVariants(usd: number): string[] {
  const $ = (n: number, d: number) => `$${n.toFixed(d)}`
  const ov = (s: string) => `${s} over`
  const vs: string[] = []
  if (usd >= 1000) {
    vs.push(ov($(usd, 0)))                    // $2340 over
    vs.push($(usd, 0))                        // $2340
    vs.push(`${(usd / 1000).toFixed(1)}K`)   // 2.3K
    vs.push(`${Math.round(usd / 1000)}K`)    // 2K
  } else if (usd >= 100) {
    vs.push(ov($(usd, 0)))                    // $234 over
    vs.push($(usd, 0))                        // $234
    vs.push(`${Math.round(usd)}`)             // 234
  } else if (usd >= 1) {
    vs.push(ov($(usd, 2)))                    // $3.36 over
    vs.push($(usd, 2))                        // $3.36
    vs.push($(usd, 1))                        // $3.4
    vs.push(usd.toFixed(1))                   // 3.4
    vs.push(`${Math.round(usd)}`)             // 3
  } else if (usd >= 0.01) {
    vs.push(ov($(usd, 2)))                    // $0.34 over
    vs.push($(usd, 2))                        // $0.34
    vs.push(usd.toFixed(2))                   // 0.34
    vs.push(usd.toFixed(1))                   // 0.3
  } else {
    vs.push(ov($(usd, 2)))                    // $0.00 over (session start / sub-cent)
    vs.push($(usd, 2))                        // $0.00
    vs.push('$0')                             // $0
  }
  vs.push('')  // omit entirely
  return [...new Set(vs)]
}

export const register: Register = on => {
  on('session.measure', async ($, e, next) => {
    await update($, ctx, () => e.context.percent ?? 0)
    for (const rl of e.rateLimits) {
      if (rl.kind === 'five_hour') await update($, fiveH, () => rl.percentUsed)
      if (rl.kind === 'seven_day') await update($, sevenD, () => rl.percentUsed)
    }
    if (e.cost !== undefined) await update($, cost, () => e.cost!.usd)
    return next(e)
  })

  on('ui.render', { component: 'StatusLine' }, async ($, e, next) => {
    const ctxPct = await read($, ctx)
    const fivePct = await read($, fiveH)
    const weekPct = await read($, sevenD)
    const costUsd = await read($, cost)

    if (ctxPct === null && fivePct === null && weekPct === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const cols = e.props.columns

    type Seg = { label: string; pct: number }
    const segs: Seg[] = []
    if (ctxPct !== null) segs.push({ label: 'ctx', pct: ctxPct })
    if (fivePct !== null) segs.push({ label: '5h', pct: fivePct })
    if (weekPct !== null) segs.push({ label: '7d', pct: weekPct })
    const count = segs.length

    const costs = costVariants(costUsd ?? 0)

    // --- BAR MODE ---
    // Overhead per seg: label + "[ ]"(3) + " X%"(2–5) ≈ 11; plus 2-char sep between segs.
    const barOverhead = 11 * count + 2 * (count - (ctxPct !== null ? 1 : 0))
    const MIN_BAR = 3  // minimum useful bar width before switching to compact/two-row
    // Try each cost variant (most to least verbose); pick the first that allows bars ≥ MIN_BAR.
    // This shrinks the cost text before abandoning bar mode, minimising the dead-zone gap.
    let barWidth = 0
    let barCost = ''
    for (const c of costs) {
      const costLen = c ? 2 + c.length : 0
      const bw = Math.floor((cols - barOverhead - costLen) / count)
      if (bw >= MIN_BAR) { barWidth = Math.min(15, bw); barCost = c; break }
    }
    const useBar = barWidth >= MIN_BAR

    if (useBar) {
      const seg = (s: Seg) => [
        <Text key={`${s.label}-l`} dimColor>{s.label} </Text>,
        <Text key={`${s.label}-b`} color={barColor(s.pct)} weight="bold">[{miniBar(s.pct, barWidth)}]</Text>,
        <Text key={`${s.label}-p`} color={barColor(s.pct)} weight="bold"> {Math.round(s.pct)}%</Text>,
      ]
      return (
        <Box>
          {segs.flatMap((s, i) => [
            ...(i > 0 ? [<Text key={`sp${i}`} dimColor>  </Text>] : []),
            ...seg(s),
          ])}
          {barCost && [<Text key="csp" dimColor>  </Text>, <Text key="cv" dimColor>{barCost}</Text>]}
        </Box>
      )
    }

    // --- COMPACT / TWO-ROW MODES ---
    // Width of a single compact row.
    const compactW = (withPct: boolean, c: string) =>
      segs.reduce((acc, s, i) => {
        const v = withPct ? `${Math.round(s.pct)}%` : `${Math.round(s.pct)}`
        return acc + (i > 0 ? 2 : 0) + s.label.length + 1 + v.length
      }, 0) + (c ? 2 + c.length : 0)

    // Max row width in two-row layout.
    const twoRowW = (withPct: boolean, c: string) =>
      segs.reduce((acc, s, i) => {
        const v = withPct ? `${Math.round(s.pct)}%` : `${Math.round(s.pct)}`
        return acc + (i > 0 ? 2 : 0) + Math.max(s.label.length, v.length)
      }, 0) + (c ? 2 + c.length : 0)

    // Returns the most verbose cost from `costs` whose total width fits, or null if none fit.
    const bestCost = (w: (c: string) => number): string | null =>
      costs.find(c => w(c) <= cols) ?? null

    // Priority order: prefer keeping % and cost; try two-row before dropping cost.
    // 1. compact + %      2. two-row + %      3. compact no %      4. two-row no %
    const compactPct   = bestCost(c => compactW(true,  c))
    const tworowPct    = bestCost(c => twoRowW(true,   c))
    const compactNopct = bestCost(c => compactW(false, c))
    const tworowNopct  = bestCost(c => twoRowW(false,  c))  // '' always fits eventually

    const renderCompact = (withPct: boolean, c: string) => (
      <Box>
        {segs.flatMap((s, i) => {
          const v = withPct ? `${Math.round(s.pct)}%` : `${Math.round(s.pct)}`
          return [
            ...(i > 0 ? [<Text key={`sp${i}`} dimColor>  </Text>] : []),
            <Text key={`l${i}`} dimColor>{s.label} </Text>,
            <Text key={`p${i}`} color={barColor(s.pct)} weight="bold">{v}</Text>,
          ]
        })}
        {c && [<Text key="csp" dimColor>  </Text>, <Text key="cv" dimColor>{c}</Text>]}
      </Box>
    )

    const renderTwoRow = (withPct: boolean, c: string) => {
      const colWidths = segs.map(s => {
        const v = withPct ? `${Math.round(s.pct)}%` : `${Math.round(s.pct)}`
        return Math.max(s.label.length, v.length)
      })
      return (
        <Box flexDirection="column">
          <Box>
            {segs.flatMap((s, i) => [
              ...(i > 0 ? [<Text key={`ls${i}`} dimColor>  </Text>] : []),
              <Text key={`l${i}`} dimColor>{s.label.padEnd(colWidths[i])}</Text>,
            ])}
          </Box>
          <Box>
            {segs.flatMap((s, i) => {
              const v = withPct ? `${Math.round(s.pct)}%` : `${Math.round(s.pct)}`
              return [
                ...(i > 0 ? [<Text key={`ps${i}`} dimColor>  </Text>] : []),
                <Text key={`p${i}`} color={barColor(s.pct)} weight="bold">{v.padEnd(colWidths[i])}</Text>,
              ]
            })}
            {c && [<Text key="csp" dimColor>  </Text>, <Text key="cv" dimColor>{c}</Text>]}
          </Box>
        </Box>
      )
    }

    if (compactPct !== null)   return renderCompact(true,  compactPct)
    if (tworowPct !== null)    return renderTwoRow(true,   tworowPct)
    if (compactNopct !== null) return renderCompact(false, compactNopct)
    return renderTwoRow(false, tworowNopct ?? '')
  })
}
