import type { EngineInterface, Register } from 'claude-code'

const DAY = 24 * 60 * 60 * 1000
// 'today' is decided by local midnight in bucketOf; the rest by age, oldest bound last
const SECTIONS: [string, number][] = [
  ['today', 0],
  ['last day', DAY],
  ['last 3 days', 3 * DAY],
  ['last week', 7 * DAY],
  ['more than a week', Infinity],
]

type Session = {
  sessionId: string
  lastActivityAt?: string
  pinned?: boolean
  startedBy?: string
  group?: { id: string; name: string } | null
}

async function callJson($: EngineInterface, server: string, tool: string, args: Record<string, unknown>) {
  const res = await $.mcp.call(server, tool, args)
  const block = res.content?.[0]
  if (res.isError || block?.type !== 'text') throw new Error(`${tool} failed`)
  return JSON.parse(block.text ?? 'null')
}

async function sectionIds($: EngineInterface) {
  const list: { id: string; kind: string; name: string }[] = await callJson($, 'ccd_sidebar', 'list_sections', {})
  return new Map(list.filter(s => s.kind === 'manual').map(s => [s.name, s.id]))
}

export function bucketOf(lastMs: number, nowMs: number) {
  if (lastMs >= new Date(nowMs).setHours(0, 0, 0, 0)) return 'today'
  return SECTIONS.find(([, limit]) => nowMs - lastMs < limit)![0]
}

let isSorting = false

async function sortSidebar($: EngineInterface) {
  if (isSorting) return
  isSorting = true
  try {
    let ids = await sectionIds($)
    const missing = SECTIONS.map(([name]) => name).filter(name => !ids.has(name))
    for (const name of missing) {
      await callJson($, 'ccd_sidebar', 'create_section', { name })
    }
    if (missing.length) ids = await sectionIds($)

    const others: Session[] = await callJson($, 'ccd_session_mgmt', 'list_sessions', { limit: 1000 })
    const self: Session = await callJson($, 'ccd_session_mgmt', 'get_session', { session_id: 'self' })
    const now = await $.clock.now()
    const ours = new Set(SECTIONS.map(([name]) => name))
    const moves = new Map<string, string[]>()
    const all = [self, ...others]
    const active = new Set(all.map(s => s.sessionId))

    for (const s of all) {
      // pinned ones stay under Pinned; a group the person made by hand is theirs, not ours to move
      if (s.pinned || !s.lastActivityAt || (s.group && !ours.has(s.group.name))) continue
      // the app moves a nested session with its parent and refuses the whole batch if it is named alone
      if (s.startedBy && active.has(s.startedBy)) continue
      const target = bucketOf(Date.parse(s.lastActivityAt), now)
      if (s.group?.name === target) continue
      const id = ids.get(target)
      if (id) moves.set(id, [...(moves.get(id) ?? []), s.sessionId])
    }

    for (const [section_id, sessionIds] of moves) {
      for (let i = 0; i < sessionIds.length; i += 100) {
        await callJson($, 'ccd_sidebar', 'move_sessions', { section_id, session_ids: sessionIds.slice(i, i + 100) }).catch(() => {})
      }
    }
  } finally {
    isSorting = false
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    sortSidebar($).catch(() => {})
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      sortSidebar($).catch(() => {})
    }
    return result
  })
}
