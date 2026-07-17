import type { BlogPost } from '#/content/blog/types'

export const claudeCodeHooksTutorialPost: BlogPost = {
  slug: 'claude-code-hooks-tutorial',
  title: 'Claude Code hooks tutorial: event automation',
  description:
    'Master Claude Code hooks with practical examples. PreToolUse security checks, PostToolUse formatting, notifications, and lifecycle automation for your workflow.',
  publishedAt: '2026-07-17',
  readingMinutes: 12,
  primaryKeyword: 'claude code hooks tutorial',
  keywordCluster: [
    'claude code hooks tutorial',
    'claude code hooks guide',
    'pretooluse hook',
    'posttooluse hook',
    'claude code automation',
    'claude code lifecycle events',
  ],
  author: {
    name: 'Sam Porter',
    role: 'Developer · Claude Code builder',
    bio: 'Writes deterministic workflows using Claude Code hooks and MCP servers. Focuses on practical automation that enforces project standards without bloat.',
  },
  tldr:
    'Claude Code hooks are shell commands that execute automatically when lifecycle events fire — before a tool runs (PreToolUse), after it completes (PostToolUse), or at session start (SessionStart). Use hooks to enforce security rules, auto-format code, send notifications, and inject context. Configure via JSON in `.claude/settings.json` (project-level) or `~/.claude/settings.json` (user-level).',
  relatedSlugs: [
    'how-to-write-claude-code-skills',
    'claude-code-skills-vs-rules',
    'install-claude-code',
  ],
  body: `
## What are Claude Code hooks?

Claude Code hooks are user-defined shell commands that execute automatically at specific points in the Claude Code lifecycle. Unlike prompts, which rely on the model's interpretation, hooks run deterministic code outside the LLM. This means they cannot hallucinate and can enforce rules at the system level.

The key insight: without hooks, every safeguard depends on the model understanding your instructions. With hooks, you enforce rules at the platform level. Block a dangerous command before it runs. Inject project context automatically. Log every action for audit.

## The lifecycle events

Claude Code fires hooks at eight distinct points during a session:

| Event | When it fires | Common use |
|-------|---------------|-----------|
| **SessionStart** | Session begins | Inject project context, load environment |
| **PreToolUse** | Before any tool executes | Security checks, block dangerous commands (exit 2) |
| **PostToolUse** | After a tool completes successfully | Auto-format code, run tests, update logs |
| **PostToolUseFailure** | After a tool fails | Capture error logs, trigger alerts |
| **UserPromptSubmit** | Before Claude sees your message | Block or modify prompts, inject guidance |
| **PermissionRequest** | When Claude asks for permission | Auto-approve or deny (DANGEROUS — use rarely) |
| **Stop** | When Claude finishes | Final verification, run linters |
| **Notification** | When Claude sends a notification | Route to Slack, SMS, desktop alerts |

The most commonly used hooks are **PreToolUse** (security) and **PostToolUse** (formatting/testing).

## Setting up your first hook

Hooks are configured via JSON in settings files. The configuration has two scopes:

- **User-level:** \`~/.claude/settings.json\` — applied globally to all sessions
- **Project-level:** \`.claude/settings.json\` — shared with your team via Git

Project-level settings override user-level settings.

### Create a notification hook

Here is a simple hook that sends a desktop notification whenever Claude Code needs input:

\`\`\`json
{
  "hooks": [
    {
      "event": "Notification",
      "handlers": [
        {
          "command": "osascript -e 'display notification \\\"Claude Code needs input\\\" with title \\\"Claude Code\\\"'"
        }
      ]
    }
  ]
}
\`\`\`

Save this to \`.claude/settings.json\` in your project root. Now whenever Claude Code waits for your response, you get a notification on macOS.

On Linux, use \`notify-send\`:

\`\`\`json
{
  "hooks": [
    {
      "event": "Notification",
      "handlers": [
        {
          "command": "notify-send 'Claude Code needs input'"
        }
      ]
    }
  ]
}
\`\`\`

On Windows, use PowerShell:

\`\`\`json
{
  "hooks": [
    {
      "event": "Notification",
      "handlers": [
        {
          "command": "powershell -Command \\\"[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null; [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null; $APP_ID = 'Claude Code'; $template = '<toast><visual><binding template=\\\"ToastText02\\\"><text id=\\\"1\\\">Claude Code</text><text id=\\\"2\\\">needs input</text></binding></visual></toast>'; $xml = New-Object Windows.Data.Xml.Dom.XmlDocument; $xml.LoadXml($template); $toast = New-Object Windows.UI.Notifications.ToastNotification $xml; [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($toast);\\\"\""
        }
      ]
    }
  ]
}
\`\`\`

## Practical example: security hooks

The PreToolUse event fires before Claude executes a command. This is your security checkpoint. Return exit code 2 to block the action; Claude will see your stderr message as feedback.

### Block dangerous commands

Here is a hook that prevents running \`rm -rf\` or similar destructive commands:

\`\`\`json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matchers": ["shell"],
      "handlers": [
        {
          "command": "bash -c 'read input; if echo \"$input\" | grep -qE \"rm -rf|mkfs|dd if=/dev/zero\"; then echo \"Blocked: destructive command detected\" >&2; exit 2; fi'"
        }
      ]
    }
  ]
}
\`\`\`

When Claude tries to run \`rm -rf /var/lib\`, the hook:
1. Catches the command
2. Checks against the blocklist
3. Returns exit code 2
4. Claude sees the message and asks you first

### Require approval for database changes

For production database operations, you can gate approval:

\`\`\`json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matchers": ["shell"],
      "handlers": [
        {
          "command": "bash -c 'read input; if echo \"$input\" | grep -qE \"DROP TABLE|DELETE FROM|ALTER TABLE\"; then read -p \"Approve database change? (y/n) \" -n 1 -r; echo; if [[ ! $REPLY =~ ^[Yy]$ ]]; then echo \"Blocked: user denied database change\" >&2; exit 2; fi; fi'"
        }
      ]
    }
  ]
}
\`\`\`

## Auto-format code after edits

The PostToolUse event fires after Claude finishes editing. Use it to enforce formatting automatically.

### Run prettier on changed files

Create a shell script at \`.claude/hooks/format.sh\`:

\`\`\`bash
#!/bin/bash

# Read hook input
input=$(cat)

# Extract file path from the event
file=$(echo "$input" | jq -r '.filePath // empty')

if [[ ! -z "$file" && "$file" == *.{js,ts,jsx,tsx} ]]; then
  npx prettier --write "$file" 2>&1
fi
\`\`\`

Then reference it in your settings:

\`\`\`json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "matchers": ["file_edit"],
      "handlers": [
        {
          "command": ".claude/hooks/format.sh"
        }
      ]
    }
  ]
}
\`\`\`

Now every time Claude edits a JavaScript or TypeScript file, prettier runs automatically.

### Run tests after edits

Similarly, you can run tests to catch regressions:

\`\`\`json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "matchers": ["file_edit"],
      "handlers": [
        {
          "command": "pnpm test -- --testPathPattern=\"$(basename $file .ts)\" 2>&1"
        }
      ]
    }
  ]
}
\`\`\`

## Matcher patterns

Matchers filter which tools trigger a hook. Without a matcher, the hook runs on all matching events.

Common matchers:

| Matcher | Matches |
|---------|---------|
| \`shell\` | Shell command execution |
| \`file_edit\` | File creation or edit |
| \`file_read\` | File reads |
| \`web_search\` | Web search |
| Pattern regex | Tools matching a regex (e.g., \`^shell$\`) |

### Example: only format Python files

\`\`\`json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "matchers": ["file_edit"],
      "handlers": [
        {
          "command": "bash -c 'read input; file=$(echo \"$input\" | jq -r \".filePath\"); if [[ \"$file\" == *.py ]]; then black \"$file\"; fi'"
        }
      ]
    }
  ]
}
\`\`\`

## Reading hook input

Hooks receive JSON data via stdin. The structure depends on the event. Here is a hook that reads and logs the event:

\`\`\`bash
#!/bin/bash

# Read JSON from stdin
input=$(cat)

# Parse fields
event=$(echo "$input" | jq -r '.event')
tool=$(echo "$input" | jq -r '.tool')
file=$(echo "$input" | jq -r '.filePath // empty')
command=$(echo "$input" | jq -r '.command // empty')

# Log to audit file
echo "$(date): Event=$event Tool=$tool File=$file Command=$command" >> ~/.claude/audit.log
\`\`\`

Save as \`.claude/hooks/audit.sh\`, then add to settings:

\`\`\`json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "handlers": [
        {
          "command": "bash .claude/hooks/audit.sh"
        }
      ]
    }
  ]
}
\`\`\`

## Exit codes and control

Hooks communicate decisions via exit codes:

| Exit code | Meaning | Effect |
|-----------|---------|--------|
| 0 | Success, proceed | Action continues normally |
| 1 | Non-blocking error | Logs a warning, action proceeds |
| 2 | Block action | Action is blocked, stderr sent to Claude as feedback |

Return exit 2 to block. Return exit 0 to approve. Return exit 1 to warn but continue.

### Example: prompt validation

Block prompts that ask Claude to bypass security:

\`\`\`json
{
  "hooks": [
    {
      "event": "UserPromptSubmit",
      "handlers": [
        {
          "command": "bash -c 'read input; if echo \"$input\" | grep -qiE \"disable.*security|ignore.*rules|bypass\"; then echo \"Blocked: prompt violates security policy\" >&2; exit 2; fi'"
        }
      ]
    }
  ]
}
\`\`\`

## Using the /hooks command

Claude Code provides an interactive menu to browse and manage hooks:

\`\`\`bash
/hooks
\`\`\`

This opens a browser interface where you can:
- List all configured hooks
- Edit hook commands
- Test hooks with mock events
- View hook execution history

## Advanced patterns

### Conditional hooks for feature branches

Load different hooks per branch:

\`\`\`json
{
  "hooks": [
    {
      "event": "SessionStart",
      "handlers": [
        {
          "command": "bash -c 'branch=$(git rev-parse --abbrev-ref HEAD); if [[ $branch == feature/* ]]; then echo \\\"Feature branch detected: relaxed rules\\\"; fi'"
        }
      ]
    }
  ]
}
\`\`\`

### Multi-step hooks

Chain multiple tools in a hook:

\`\`\`bash
#!/bin/bash

# Run linter
pnpm lint --fix

# Run tests
pnpm test

# Update coverage badge
pnpm update-coverage-badge
\`\`\`

### Disable hooks per-session

Run Claude Code without loading hooks:

\`\`\`bash
# Skip user-level and project-level hooks
claude --no-hooks
\`\`\`

## Team workflows

Store hooks in version control for consistency across your team:

\`\`\`
project-root/
  .claude/
    settings.json         # Shared hook config
    hooks/
      format.sh           # Team formatting
      security.sh         # Team security checks
      audit.sh            # Audit logging
\`\`\`

When a teammate clones the repo, hooks load automatically. This ensures everyone enforces the same standards.

## Debugging hooks

If a hook is not firing or behaves unexpectedly:

1. **Check syntax:** Validate JSON in \`.claude/settings.json\` using a linter
2. **Test the command manually:** Run \`bash .claude/hooks/format.sh\` directly to isolate errors
3. **Check matchers:** Ensure matchers match the tool being tested
4. **Read logs:** Check \`~/.claude/audit.log\` or \`stdout\` for error messages
5. **Use /hooks:** The interactive menu shows execution history and test results

## Key takeaways

- Hooks are shell commands that run at lifecycle events — deterministic automation without LLM interpretation
- **PreToolUse** blocks dangerous actions at the system level; **PostToolUse** enforces formatting and testing
- Configure via \`.claude/settings.json\` (project-level) to share with teams
- Use matchers to filter which tools trigger a hook
- Exit code 2 blocks; exit 0 approves; exit 1 warns
- Store hooks in version control alongside your code for consistency

Hooks transform Claude Code from a conversational tool into a programmable AI engineering platform. Start with security checks, add formatting, then build more sophisticated automations as your workflow evolves.

## Next steps

- Explore the `/hooks` interactive menu in Claude Code
- Share your security and formatting hooks with your team via your project repo
- Document your team's hook policies in a README or project wiki
- Check the [Claude Code hooks reference](https://code.claude.com/docs/en/hooks.md) for the complete event schema
- Read the [Onie workflow examples post](/blog/claude-code-workflow-examples) to combine hooks with skills and workflows
`.trim(),
  faqs: [
    {
      question: 'What is the difference between hooks and rules?',
      answer:
        'Claude Code rules (in CLAUDE.md or .claude/rules/) are always-on instructions loaded into context at session start, costing tokens on every turn. Hooks are shell commands that execute at specific lifecycle events, operating outside the LLM. Rules guide the model's behavior; hooks enforce deterministic system-level actions. Rules are policy; hooks are automation.',
    },
    {
      question: 'Can hooks modify the prompt before Claude sees it?',
      answer:
        'Yes, the UserPromptSubmit event fires before Claude processes your message. A hook can read stdin, validate the prompt, and return exit code 2 to block it with feedback. However, hooks cannot directly modify the prompt text—they can only approve or reject it. To modify prompts, use inline rules or skills instead.',
    },
    {
      question: 'How do I share hooks with my team?',
      answer:
        'Store hook configurations in .claude/settings.json and hook scripts in .claude/hooks/ in your project repository. When teammates clone the repo, hooks load automatically from the project-level config. Document your team\'s hook policies in a README or wiki so contributors know which hooks are active and why.',
    },
    {
      question: 'What happens if a hook fails or times out?',
      answer:
        'If a hook exits with code 1 (non-blocking error), Claude logs a warning and continues. If it times out or crashes, Claude logs the error and proceeds. Return exit 2 to explicitly block an action. If a critical hook fails silently, use logging (e.g., write to ~/.claude/hooks.log) to debug later.',
    },
    {
      question: 'Can I use hooks to auto-approve dangerous actions?',
      answer:
        'Technically yes, but it\'s a security anti-pattern. Avoid using hooks to auto-approve database deletions, secret writes, or production deploys. Hooks are best for enforcement (blocking) and safety (notifications), not for automation that bypasses human review. For approval workflows, combine hooks with interactive prompts that require explicit user input.',
    },
    {
      question: 'How do I test a hook before deploying it to the team?',
      answer:
        'Use the /hooks interactive menu in Claude Code to test hooks with mock events. Alternatively, save your hook script standalone and run it manually with test JSON input. For example: echo \'{"event": "PreToolUse", "tool": "shell", "command": "rm test"}\' | bash .claude/hooks/security.sh. Once confident, add it to .claude/settings.json and commit to version control.',
    },
    {
      question: 'Can hooks integrate with MCP servers or external APIs?',
      answer:
        'Yes. A hook script can call curl to POST to an HTTP endpoint, invoke MCP tools via the Claude Code CLI, or run any command available in your environment. For example, a PostToolUse hook could send a Slack message via curl, or call an MCP server to log the action to a centralized audit service.',
    },
    {
      question: 'What is the performance impact of running hooks on every action?',
      answer:
        'Hooks run quickly (shell scripts typically <100ms). However, heavy hooks (like running the full test suite on every edit) can slow down your workflow. Optimize by using matchers to filter when hooks run, deferring slow checks to explicit commands, or running hooks only for high-risk events like PreToolUse rather than every PostToolUse.',
    },
  ],
}
