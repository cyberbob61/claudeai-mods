import type { EngineInterface, Register } from 'claude-code'

const SERVER = 'ccd_session_mgmt'
// shortcut: sidebar titles are plain text, so the red comes from the emoji, not a text color
const PREFIX = '🔴 WAIT · '

async function setWaiting($: EngineInterface, isWaiting: boolean) {
  const res = await $.mcp.call(SERVER, 'get_session', { session_id: 'self' })
  const block = res.content?.[0]
  if (res.isError || block?.type !== 'text') return

  const current: string = JSON.parse(block.text ?? '{}').title ?? ''
  const base = current.startsWith(PREFIX) ? current.slice(PREFIX.length) : current
  const title = isWaiting ? PREFIX + base : base
  if (base && title !== current) {
    await $.mcp.call(SERVER, 'set_session_title', { session_id: 'self', title })
  }
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      setWaiting($, true).catch(() => {})
    }
    return result
  })

  on('prompt.submit', ($, e, next) => {
    setWaiting($, false).catch(() => {})
    return next(e)
  })
}
