import type { BlogPost } from '#/content/blog/types'

export const mcpServerCursorSetupPost: BlogPost = {
  slug: 'mcp-server-cursor-setup',
  title: 'Set up MCP servers in Cursor: global, project, and team',
  description:
    'Configure Model Context Protocol servers in Cursor IDE via mcp.json or the UI. Global config, project-scoped setup, environment variables, and team workflows.',
  publishedAt: '2026-06-25',
  readingMinutes: 7,
  primaryKeyword: 'mcp server cursor setup',
  keywordCluster: [
    'mcp server cursor setup',
    'cursor mcp config',
    'mcp.json cursor',
    'cursor mcp servers',
    'cursor mcp project setup',
    'cursor mcp global config',
  ],
  author: {
    name: 'Alex Chen',
    role: 'AI engineer · Cursor practitioner',
    bio: 'Deploys MCP servers across teams and projects. Ships production workflows integrating Cursor with internal APIs and third-party tools.',
  },
  tldr:
    'Cursor reads MCP servers from ~/.cursor/mcp.json (global, all projects) or .cursor/mcp.json (project root, per-workspace). Add server entries under mcpServers with command/args for local servers or url for remote ones. Environment variables load from your shell profile. Reload Cursor (Cmd+Shift+P > "Reload Window") to apply changes. Project-level configs commit to git for team sharing.',
  relatedSlugs: ['claude-code-mcp-add', 'build-mcp-server', 'how-to-write-claude-code-skills'],
  body: `
## Why Cursor's MCP support matters

Cursor is an AI-native IDE with first-class Model Context Protocol (MCP) support. Once you configure an MCP server in Cursor, the Agent can call its tools directly from the editor without any extensions or middleware. This means your AI coding assistant gets access to your database, internal APIs, GitHub, Supabase, or any custom server you write — all from one place.

The setup is a one-time task per server. After you configure it, every AI interaction in that workspace automatically includes the server's capabilities.

## Global vs. project-scoped config

Cursor supports two configuration scopes:

| Scope | File path | When to use |
| --- | --- | --- |
| **Global** | \`~/.cursor/mcp.json\` | Personal tools (GitHub, filesystem, weather) available in every project |
| **Project** | \`.cursor/mcp.json\` in repo root | Project-specific servers (internal APIs, databases) shared with team via git |

**Global config** loads every time Cursor starts. Use it for tools you need across many projects: GitHub access, your personal file system, general utilities.

**Project config** takes priority if both exist. Use it for servers tied to a specific workspace: your team's internal API, a project database, a CI integration.

## Adding your first server (global)

Open Cursor settings:
- **macOS:** Cmd+Shift+J then navigate to **MCP & Integrations**
- **Windows/Linux:** Ctrl+Shift+J then navigate to **MCP & Integrations**

Click **Add new global MCP server**. Cursor opens \`~/.cursor/mcp.json\` in your editor.

Add a server entry under \`mcpServers\`. Here is a complete example with a local command and a remote HTTP server:

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
    },
    "supabase": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer token"
      }
    }
  }
}
\`\`\`

Save the file. Go back to the **MCP & Integrations** tab — your servers should appear with green status dots. If not, click the refresh icon.

## Project-scoped setup for teams

For team projects where everyone needs the same MCP setup, commit the config to your repository:

1. Create a \`.cursor\` folder in your project root
2. Add \`mcp.json\` inside it

\`\`\`bash
mkdir .cursor
cat > .cursor/mcp.json << 'EOF'
{
  "mcpServers": {
    "internal-api": {
      "command": "npx",
      "args": ["-y", "@yourcompany/internal-mcp-server"],
      "env": {
        "API_TOKEN": "\${env:INTERNAL_API_TOKEN}"
      }
    }
  }
}
EOF
\`\`\`

Commit \`.cursor/mcp.json\` to git. Every teammate who clones the repo automatically gets the config. They only need to set environment variables in their shell profile.

## Configuring environment variables

MCP servers often need secrets: API tokens, database URLs, credentials. Cursor reads environment variables from your shell. Never hardcode secrets in \`mcp.json\`.

Use the \`\${env:VARIABLE_NAME}\` syntax in your config:

\`\`\`json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${env:GITHUB_TOKEN}"
      }
    },
    "database": {
      "url": "postgresql://localhost/mydb",
      "headers": {
        "Authorization": "Bearer \${env:DB_SECRET}"
      }
    }
  }
}
\`\`\`

Set environment variables in your shell profile:

\`\`\`bash
# ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="ghp_your_token_here"
export DB_SECRET="your_secret"
\`\`\`

Reload your shell: \`exec zsh\` or \`exec bash\`. Cursor reads them on startup.

## Configuring local servers (command + args)

For servers running on your machine (e.g., a Node.js script, a Python subprocess), use the \`command\` and \`args\` fields:

\`\`\`json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
\`\`\`

Key details:

- **\`command\`** — the executable on your PATH (node, python, npx, uvx, docker)
- **\`args\`** — command-line arguments; the first is usually the script/package name
- **\`env\`** — environment variables for the subprocess
- **Paths must be absolute** — relative paths do not work

## Configuring remote servers (HTTP or SSE)

For servers running on a server (e.g., deployed to the cloud), use the \`url\` field:

\`\`\`json
{
  "mcpServers": {
    "remote-api": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer your_token",
        "X-API-Key": "your_key"
      }
    }
  }
}
\`\`\`

You can use environment variable interpolation in \`url\` and \`headers\`:

\`\`\`json
{
  "mcpServers": {
    "remote-api": {
      "url": "\${env:MCP_SERVER_URL}",
      "headers": {
        "Authorization": "Bearer \${env:MCP_SERVER_TOKEN}"
      }
    }
  }
}
\`\`\`

## Reloading after config changes

After saving \`mcp.json\`, Cursor must reload to pick up the changes:

1. Press Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)
2. Type "Reload Window" and press Enter

Cursor restarts and loads your new server config. If a server shows a red X in the **MCP & Integrations** tab, the connection failed — click the server name to see the error details.

## Verifying your servers

Open the **MCP & Integrations** tab in Settings. Each server shows:

- Green dot: connected and ready
- Red X: connection error
- Tool count: number of tools/resources exposed
- Error message: if something failed

Click on a server name to see detailed status, error logs, and retry options.

Test the connection: open the Agent chat and ask it to use a tool from that server. For example, if you have a GitHub server, ask "List my recent repositories." The Agent should call the tool and return results.

## Common issues and fixes

| Issue | Cause | Fix |
| --- | --- | --- |
| Server shows red X | Command not found or crashed | Check the command is in PATH; test it in your terminal first |
| Timeout error | Server took too long to start | Increase timeout or check server logs (click server in UI) |
| Env variables not resolved | Shell profile not loaded | Restart Cursor after updating ~/.bashrc or ~/.zshrc |
| Config file not found | Cursor not looking in the right place | Verify path is exactly ~/.cursor/mcp.json (global) or .cursor/mcp.json (project root) |
| Stale server config in Agent | Reload not completed | Fully quit Cursor (Cmd+Q) then reopen; in-window reload may not always work |

## Complete team setup example

Here is a realistic \`.cursor/mcp.json\` for a team project:

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${env:GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "\${env:DATABASE_URL}"
      }
    },
    "internal-api": {
      "url": "http://localhost:8000/mcp",
      "headers": {
        "Authorization": "Bearer \${env:INTERNAL_API_TOKEN}"
      }
    }
  }
}
\`\`\`

Commit this to your repo. Each teammate sets:

\`\`\`bash
export GITHUB_TOKEN="ghp_..."
export DATABASE_URL="postgresql://..."
export INTERNAL_API_TOKEN="secret_..."
\`\`\`

in their shell profile. When they open the project in Cursor, all four servers appear and work automatically.

## Best practices

- **Use project config for team workflows** — commit \`.cursor/mcp.json\` to git so all contributors get the same setup
- **Keep secrets in environment variables** — never hardcode tokens or API keys in the config file
- **Start with one server** — test it works before adding more; each new server is one config entry
- **Name servers clearly** — use the server's purpose in the name (github, database, internal-api) not generic names
- **Document custom servers** — if your team wrote a custom MCP server, add a README explaining how to install and authenticate
- **Use absolute paths for local servers** — relative paths fail silently; always use /home/user/path/to/server or \`$(pwd)/relative/path\`

## Next steps

Once your MCP servers are set up in Cursor:

1. Test them in the Agent chat — ask it to use each tool
2. Extend your workflow — integrate with your IDE for code generation, testing, or deployment
3. Share with your team — commit the config and document setup in your project README
4. Build more servers — as you discover gaps, write custom MCP servers to fill them

The MCP ecosystem is growing rapidly. Browse the [Cursor Marketplace](/marketplace) and [cursor.directory](https://cursor.directory) for more servers, and share yours when you build one.
`.trim(),
  faqs: [
    {
      question: 'What is the difference between ~/.cursor/mcp.json and .cursor/mcp.json?',
      answer:
        'The first (~/.cursor/mcp.json) is your global config; servers defined there appear in every Cursor project. The second (.cursor/mcp.json in your project root) is project-scoped; only projects with this file see those servers. If both files define a server with the same name, the project config takes priority.',
    },
    {
      question: 'Do I need to restart Cursor after changing mcp.json?',
      answer:
        'Yes. Press Cmd+Shift+P (or Ctrl+Shift+P on Windows/Linux) and run "Reload Window". The full Cursor quit-and-reopen is more reliable if in-window reload does not work.',
    },
    {
      question: 'Can I use relative paths in mcp.json?',
      answer:
        'No. For local servers, always use absolute paths. Relative paths fail silently or work inconsistently. Use $(pwd)/relative/path in shell scripts to convert a relative path to absolute.',
    },
    {
      question: 'How do I know if my server is working?',
      answer:
        'Open Settings > MCP & Integrations. If your server shows a green dot, it is connected. Red X means an error — click the server name to see details. You can also test it by asking the Agent to use one of its tools in the chat.',
    },
    {
      question: 'What if my server command works in the terminal but fails in Cursor?',
      answer:
        'Cursor may not have the same PATH or environment variables as your terminal. Check that the full command path is correct (e.g., /usr/local/bin/node instead of just node), and verify environment variables are set in your shell profile, not just your current terminal session.',
    },
    {
      question: 'Can I use mcp.json for remote HTTP servers, or only local commands?',
      answer:
        'Both. Use the command/args fields for local subprocesses and the url field for remote HTTP or SSE servers. Remote servers are ideal for cloud-deployed MCP services or multi-tenant systems.',
    },
    {
      question: 'How do I share MCP setup with my team?',
      answer:
        'Commit .cursor/mcp.json to your git repo. Use ${env:VARIABLE_NAME} for secrets so each teammate sets them in their own shell profile. Document any custom servers or special setup in your project README.',
    },
    {
      question: 'Can I configure MCP servers via the UI instead of editing JSON?',
      answer:
        'Yes. The UI method works for simple cases: Settings > MCP & Integrations > Add new MCP server. However, for team projects or complex configs with environment variables, editing the JSON file directly is faster and version-control friendly.',
    },
  ],
}
