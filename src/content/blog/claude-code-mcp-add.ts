import type { BlogPost } from '#/content/blog/types'

export const claudeCodeMcpAddPost: BlogPost = {
  slug: 'claude-code-mcp-add',
  title: 'Adding MCP servers to Claude Code with claude mcp add',
  description:
    'Step-by-step guide to registering local and remote MCP servers using the claude mcp add command. Cover scope, transport types, environment variables, and troubleshooting.',
  publishedAt: '2026-07-20',
  readingMinutes: 7,
  primaryKeyword: 'claude code mcp add',
  keywordCluster: [
    'claude code mcp add',
    'claude mcp add command',
    'how to add mcp server',
    'claude code mcp configuration',
    'mcp server registration',
  ],
  author: {
    name: 'Alex Chen',
    role: 'DevTools engineer · Claude Code user',
    bio: 'Runs MCP servers daily in Claude Code across multiple projects. Builds on Onie and writes about developer workflows.',
  },
  tldr:
    'The claude mcp add command registers an MCP server with Claude Code in seconds. Use it once per server—at local, project, or user scope—and every session gets access to that server's tools. For local servers, provide the command to run. For hosted servers, provide a URL. Both support environment variables, headers, and OAuth.',
  relatedSlugs: ['build-mcp-server', 'mcp-server-cursor-setup'],
  body: `
## When you need claude mcp add

You reach for \`claude mcp add\` after you have an MCP server ready to connect—either one you built yourself, an npm package, or a hosted service like Notion or Sentry. The command is your single entry point for all three scenarios.

Once registered, every Claude Code session in that scope (local project, project-shared, or user-global) gets immediate access to the server's tools. No restart, no config file editing, no middleware setup. Run the command, start a session, and use the tools.

## Command syntax

The basic form changes slightly based on whether your server is local (stdio) or hosted (HTTP).

For a local stdio server:

\`\`\`bash
claude mcp add [flags] <server-name> -- <command> [args...]
\`\`\`

For a hosted HTTP server:

\`\`\`bash
claude mcp add --transport http [flags] <server-name> <url>
\`\`\`

In both cases:
- **server-name** is a label you choose. Claude Code uses it in logs and in commands like \`claude mcp remove\`.
- **--** separates Claude Code flags from the server command (stdio only).
- **<command> [args...]** is what Claude Code runs to start the server (stdio only).
- **<url>** is the server's HTTP endpoint (HTTP only).

Common flags:

| Flag | Meaning |
| --- | --- |
| \`--transport\` | \`stdio\` (default, local subprocess) or \`http\` (remote URL) |
| \`--scope\` / \`-s\` | \`local\` (this project only), \`project\` (shared in .mcp.json), or \`user\` (all projects) |
| \`--env\` / \`-e\` | Environment variable to inject (repeatable) |
| \`--header\` | HTTP header for auth (repeatable, HTTP only) |

## Adding a local stdio server

A stdio server runs as a subprocess on your machine. Use this for npm packages, Python servers, or anything that needs file system access.

Example: register the Playwright MCP server:

\`\`\`bash
claude mcp add playwright -- npx -y @modelcontextprotocol/server-playwright@latest
\`\`\`

The \`-y\` flag tells npx to install without prompting—required to prevent the process from hanging.

Check the connection:

\`\`\`bash
claude mcp list
\`\`\`

On first run you may see a timeout while npx downloads. Wait a moment and re-run. Once it shows Connected, you can start a Claude Code session and use the tools.

## Adding an HTTP server

HTTP servers are hosted at a URL. Register them without the \`--\` separator:

\`\`\`bash
claude mcp add --transport http claude-docs https://code.claude.com/docs/mcp
\`\`\`

For services that require a static bearer token, pass it via \`--header\`:

\`\`\`bash
claude mcp add --transport http my-api https://api.example.com/mcp \
  --header "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

For OAuth services like Notion, Sentry, or GitHub, add without a token. Then start a Claude Code session, run the \`/mcp\` slash command, select the server, and choose Authenticate. Your browser opens to the service's sign-in page.

## Scope: local, project, or user

The \`--scope\` flag controls which config file Claude Code writes to and which sessions the server is available in.

### Local scope (default)

\`\`\`bash
claude mcp add playground -- npx -y @modelcontextprotocol/server-playwright@latest
\`\`\`

Writes to \`~/.claude.json\` under the current project entry. Only you, only this project. When you open Claude Code in a different project directory, this server is not active. Use local scope during setup or for one-off testing.

### Project scope

\`\`\`bash
claude mcp add --scope project playwright -- npx -y @modelcontextprotocol/server-playwright@latest
\`\`\`

Writes to \`.mcp.json\` in the project root. Commit this file to version control and every teammate who clones the repository gets the same servers. Prompts contributors once to approve project-scoped servers. Use project scope for team workflows.

### User scope

\`\`\`bash
claude mcp add --scope user playwright -- npx -y @modelcontextprotocol/server-playwright@latest
\`\`\`

Writes to \`~/.claude.json\` at the top level. Available to you across all projects. Use user scope for utilities you rely on everywhere.

## Passing environment variables

Some servers need secrets or configuration at startup time. Use \`--env\` to inject them:

\`\`\`bash
claude mcp add --env API_KEY=your_key --env API_URL=https://api.example.com \
  my-tools -- node /path/to/server.js
\`\`\`

For project scope, store the variables in \`.mcp.json\`:

\`\`\`json
{
  "mcpServers": {
    "my-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "your_key",
        "API_URL": "https://api.example.com"
      }
    }
  }
}
\`\`\`

Never embed credentials directly in the command. Use environment variables and store sensitive values in your shell's secret management or a local .env file that you do not commit.

## Windows and PowerShell notes

The command works identically on Windows. The only differences are path format and where config files live.

Config file locations on Windows:

| Scope | Path |
| --- | --- |
| local / user | \`%USERPROFILE%\.claude.json\` (typically \`C:\Users\YourName\.claude.json\`) |
| project | \`.mcp.json\` in the project root |

If you set \`CLAUDE_CONFIG_DIR\`, Claude Code reads config from inside that directory instead.

Environment variables in PowerShell: Set them on the same line as the command:

\`\`\`powershell
$env:API_KEY = "your_key"; claude mcp add --env API_KEY=$env:API_KEY my-tools -- node server.js
\`\`\`

Testing HTTP connectivity: PowerShell's \`curl\` is an alias for \`Invoke-WebRequest\`. Use \`curl.exe\` for the real binary:

\`\`\`powershell
curl.exe -I https://api.example.com/mcp
\`\`\`

## Managing servers

After adding servers, use these commands to inspect and modify them:

\`\`\`bash
# List all servers and their connection status
claude mcp list

# Show the stored definition for one server
claude mcp get <server-name>

# Remove a server (defaults to local scope)
claude mcp remove <server-name>

# Remove from a specific scope
claude mcp remove <server-name> --scope user

# Reset project-level approval choices for all contributors
claude mcp reset-project-choices
\`\`\`

## Troubleshooting

**Server added but shows "Failed to connect"**

For stdio servers: run the command directly in your terminal to see errors. For the Playwright server, run \`npx -y @modelcontextprotocol/server-playwright@latest\` and observe output. If it starts and waits for input, the server works—the issue is in how Claude Code launches it.

For HTTP servers: verify the URL is reachable with \`curl -I <url>\` (or \`curl.exe -I\` on Windows). A 404 or 405 response usually means the URL is correct but the path is wrong for MCP endpoints.

**"No MCP servers configured" inside a session**

Local-scoped servers are tied to the directory where you ran \`claude mcp add\`. If you start Claude Code from a different directory, those servers are not active. Add the server again from the current project, or use \`--scope user\` to make it available everywhere.

**Connection timeout on first run**

\`npx\` may take longer than the 30-second default while downloading a package. Set a longer timeout with the environment variable:

\`\`\`bash
MCP_TIMEOUT=120000 claude
\`\`\`

The value is in milliseconds.

**Server connects but tools are never called**

Claude selects tools based on their descriptions. Vague descriptions lead to tools being overlooked. If you own the server, improve the \`description\` field in each tool's definition. Start with: what it does, what inputs mean, when to use it.

## Next steps

Now that your server is registered:

1. Start a Claude Code session: \`claude\`
2. Run \`/mcp\` to see all connected servers and their tools
3. Ask Claude to use a tool from your server—it will call it automatically
4. Build workflows that combine your server's tools with Claude's reasoning

For servers you build yourself, publish to npm so teammates can register them with \`npx\`. Explore the [Anthropic MCP Directory](https://modelcontextprotocol.io/clients) for hosted servers and connectors to adopt.

Share your setup on Onie. Workflows that stick are worth publishing.
`.trim(),
  faqs: [
    {
      question: 'What is the difference between stdio and HTTP transport?',
      answer:
        'Stdio runs the server as a local subprocess Claude Code launches and manages. Use this for npm packages, Python servers, or tools that need file system access. HTTP connects to a server hosted at a URL. Use this for cloud services, team-deployed servers, or anything already running elsewhere.',
    },
    {
      question: 'Should I use local, project, or user scope?',
      answer:
        'Local for testing. Project for team workflows—commit .mcp.json so everyone gets the same servers. User for utilities you use across all projects. You can mix scopes: one server at user, another at project scope in different repos.',
    },
    {
      question: 'How do I pass secrets to an MCP server?',
      answer:
        'Use --env when adding the server, or add an env block in .mcp.json for project scope. Do not embed credentials in the command itself. For sensitive values, store them in environment variables or a local .env file that is not committed to version control.',
    },
    {
      question: 'Can I use the same server name in multiple scopes?',
      answer:
        'No. A server name is unique within its scope. If you try to add a server with the same name at the same scope, you get an error. To register the same underlying server at multiple scopes, give each a different name or remove the existing one first.',
    },
    {
      question: 'Do teammates need to approve project-scoped servers?',
      answer:
        'Yes. The first time a teammate opens Claude Code in a project with project-scoped servers, they see a prompt to approve them. This prevents a cloned repository from launching processes without consent. They can also approve manually with /mcp or reset approvals with claude mcp reset-project-choices.',
    },
    {
      question: 'What happens if an MCP server crashes?',
      answer:
        'For stdio servers, Claude Code will attempt to reconnect on the next tool call. For HTTP servers, the request will fail with a connection error. In both cases, claude mcp list will show a Failed to connect status. Restart the server (for stdio, remove and re-add it; for HTTP, ensure the remote service is running) and try again.',
    },
    {
      question: 'Can I switch a server between scopes?',
      answer:
        'No. Scope is fixed at registration. To change it, remove the server at the old scope and re-add it at the new scope: claude mcp remove <name> --scope local && claude mcp add --scope user <name> -- <command>.',
    },
    {
      question: 'Where does Claude Code store MCP server configurations?',
      answer:
        'Local and user scopes: ~/.claude.json (or %USERPROFILE%.claude.json on Windows, or inside CLAUDE_CONFIG_DIR if set). Project scope: .mcp.json at the project root. Claude Code reads .claude.json at startup and loads project-scoped servers from .mcp.json when you open a project.',
    },
  ],
}
