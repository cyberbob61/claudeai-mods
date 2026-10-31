# claudeai-mods

Two mods for the Claude desktop app (Code tab sidebar).

| Mod | What it does |
| --- | --- |
| `wait-indicator` | Puts `🔴 WAIT · ` in front of the session title while the chat waits for your input, and removes it when you send a message. |
| `sidebar-age-sections` | Files unpinned sessions into `last day`, `last 3 days`, `last week` and `more than a week` sections by the time of their last message, and re-sorts after every Claude answer. |

## Install

At the prompt of a terminal session:

```
/plugin install wait-indicator --marketplace cyberbob61/claudeai-mods
/plugin install sidebar-age-sections --marketplace cyberbob61/claudeai-mods
```

From a shell:

```bash
claude plugin install wait-indicator --marketplace cyberbob61/claudeai-mods
```

```bash
claude plugin install sidebar-age-sections --marketplace cyberbob61/claudeai-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `cyberbob61/claudeai-mods`, then Add plugin.

## Limits

- Cloud sessions are not visible to mods, so they are not sorted into the sections.
- A session started from another one (a fork) moves with its parent.
- Sections are re-sorted only when Claude answers somewhere, so after a long break they catch up on the first answer.
