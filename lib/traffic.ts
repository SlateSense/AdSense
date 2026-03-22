type VisitRecord = {
  path: string
  userAgent: string
  isBot: boolean
  ip: string
  at: string
}

type TrafficState = {
  totalVisits: number
  botVisits: number
  humanVisits: number
  byPath: Record<string, number>
  recent: VisitRecord[]
}

const trafficStateKey = "__spectraTraffic"

type GlobalTraffic = typeof globalThis & {
  [trafficStateKey]?: TrafficState
}

function getState(): TrafficState {
  const globalTraffic = globalThis as GlobalTraffic
  if (!globalTraffic[trafficStateKey]) {
    globalTraffic[trafficStateKey] = {
      totalVisits: 0,
      botVisits: 0,
      humanVisits: 0,
      byPath: {},
      recent: []
    }
  }
  return globalTraffic[trafficStateKey]
}

export function isBotUserAgent(userAgent: string): boolean {
  return /(bot|crawler|spider|slurp|headless|curl|wget|facebookexternalhit|whatsapp|telegrambot|discordbot|linkedinbot)/i.test(userAgent)
}

export function trackVisit(input: { path: string; userAgent: string; ip: string }) {
  const state = getState()
  const isBot = isBotUserAgent(input.userAgent)
  state.totalVisits += 1
  if (isBot) {
    state.botVisits += 1
  } else {
    state.humanVisits += 1
  }
  state.byPath[input.path] = (state.byPath[input.path] || 0) + 1
  state.recent.unshift({
    path: input.path,
    userAgent: input.userAgent,
    isBot,
    ip: input.ip,
    at: new Date().toISOString()
  })
  if (state.recent.length > 200) state.recent = state.recent.slice(0, 200)
}

export function getTrafficSnapshot() {
  const state = getState()
  const topPaths = Object.entries(state.byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([path, visits]) => ({ path, visits }))

  return {
    totalVisits: state.totalVisits,
    botVisits: state.botVisits,
    humanVisits: state.humanVisits,
    botRate: state.totalVisits === 0 ? 0 : Number(((state.botVisits / state.totalVisits) * 100).toFixed(2)),
    topPaths,
    recent: state.recent.slice(0, 50)
  }
}
