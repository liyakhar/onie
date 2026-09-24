import type { BlogPost } from '#/content/blog/types'

export const mcpIntegrationClaudeCodePost: BlogPost = {
  slug: 'mcp-integration-claude-code',
  title: 'MCP integration for Claude Code: local and remote',
  description:
    'Connect MCP servers to Claude Code CLI with stdio and HTTP transports. Set up team servers, authenticate with OAuth or bearer tokens, and share configs via git.',
  publishedAt: '2026-09-24',
  readingMinutes: 9,
  primaryKeyword: 'mcp integration claude code',
  keywordCluster: [
    'mcp integration claude code',
    'claude code mcp setup',
    'claude mcp add command',
    'mcp stdio configuration',
    'mcp http server claude code',
    'team mcp servers',
    'mcp oauth authentication',
  ],
  author: {
    name: 'Casey Matthews',
    role: 'AI engineer · MCP systems architect',
    bio: 'Builds and deploys MCP servers across teams and projects. Ships integration patterns that connect Claude Code to internal APIs, databases, and custom tools.',
  },
  tldr:
    'Claude Code (the CLI) connects to MCP servers via the claude mcp add command, supporting both local stdio (subprocesses on your machine) and remote HTTP (cloud-deployed services). Choose stdio for development and on-premise tools; use HTTP for team-shared servers. Authenticate via OAuth (native support) or bearer tokens, then configure via .claude/settings.json or project .mcp.json. Test with /mcp to verify tools, then commit to git for team sharing.',
  relatedSlugs: [
    'build-mcp-server',
    'model-context-protocol-tutorial',
    'claude-code-mcp-add',
    'mcp-server-cursor-setup',
    'mcp-tools-resources-prompts',
  ],
  body: `
## Why integrate MCP into Claude Code workflows

Claude Code (the terminal-based Claude interface) connects to MCP servers to give your AI assistant access to tools beyond its built-in capabilities. Instead of copying data into prompts or writing custom integration code, you configure an MCP server once and every Claude Code session automatically includes its tools.

Common reasons to add MCP servers to Claude Code:

- **Internal APIs** — access your company's CRM, billing system, or knowledge base without manual API calls
- **Databases** — query Postgres, MongoDB, or proprietary data stores directly from prompts
- **Local tooling** — call build systems, shell commands, or development utilities from Claude Code
- **Remote services** — connect to deployed MCP servers your team runs in the cloud
- **Governance** — standardize which tools your team's AI interactions can access

The integration bridges the gap between Claude Code's conversational interface and your real infrastructure.

## Stdio vs. HTTP: when to use each

MCP servers communicate with Claude Code via two transport mechanisms:

| Transport | Where it runs | Setup time | Use case |
| --- | --- | --- | --- |
| **Stdio** | Your local machine | 5 minutes | Development, on-premise tools, personal workflows |
| **HTTP** | Cloud or internal server | 15 minutes | Team sharing, multi-user access, persistent services |

**Stdio** is simpler: Claude Code launches your server as a subprocess, talks to it via standard input and output, and shuts it down when the session ends. You own the process lifecycle.

**HTTP** requires a long-running server (you deploy it and keep it alive), but multiple team members can hit the same endpoint without each running a local copy. OAuth and bearer tokens handle authentication.

Start with stdio for personal workflows. Move to HTTP when your team needs consistent access or your tool must stay running between sessions.

## Setting up a local stdio server

Let's add a local MCP server to Claude Code. Suppose you have a Node.js server at ~/my-mcp-server/dist/index.js.

First, register it with Claude Code:

\`\`\`bash
claude mcp add --transport stdio my-tools node ~/my-mcp-server/dist/index.js
\`\`\`

The command updates your Claude Code configuration and confirms:

\`\`\`
Added stdio MCP server my-tools with command: node ~/my-mcp-server/dist/index.js
\`\`\`

Start a Claude Code session and type /mcp to list all registered servers:

\`\`\`
/mcp

Server: my-tools (stdio)
  status: connected
  tools: 4 available
    - fetch_word_count
    - check_url_status
    - read_file
    - write_file
\`\`\`

If the server fails to connect, the status shows "error". Click into the error message to see detailed logs — usually a path problem or a crash in your server code.

Once connected, ask Claude Code to use a tool:

\`\`\`
User: Count the words in this paragraph: "The Model Context Protocol..."
\`\`\`

Claude Code will call fetch_word_count automatically, and the response flows back into the conversation.

## Configuring remote HTTP servers

For a server deployed to the cloud or running on your internal network, use the HTTP transport.

Say your team has deployed an MCP server at https://mcp.company.com/api and it requires OAuth. Register it like this:

\`\`\`bash
claude mcp add --transport http internal-tools https://mcp.company.com/api
\`\`\`

On first use inside Claude Code, type /mcp:

\`\`\`
/mcp
\`\`\`

Claude Code will detect the server requires authentication and open your browser to an OAuth login page. Approve the consent screen, and the OAuth token is stored securely for future sessions.

If your HTTP server uses a bearer token instead of OAuth:

\`\`\`bash
claude mcp add --transport http --headers 'Authorization: Bearer YOUR_TOKEN' api-server https://mcp.internal/api
\`\`\`

Replace YOUR_TOKEN with your actual token. For security, use environment variables instead of hardcoding:

\`\`\`bash
claude mcp add --transport http --headers "Authorization: Bearer \${API_TOKEN}" api-server https://mcp.internal/api
\`\`\`

Your shell's environment variables are interpolated at command time.

## Configuration files and scopes

Under the hood, claude mcp add writes to a configuration file. The location depends on the scope:

| Scope | File | Applies to |
| --- | --- | --- |
| **local** (default) | .claude/settings.json (project root) | Current project only |
| **user** | ~/.claude/settings.json | All Claude Code sessions |

For personal tools available everywhere, use:

\`\`\`bash
claude mcp add --scope user --transport stdio personal-tools node ~/my-tools/index.js
\`\`\`

For team projects, keep the default local scope so the config commits to git:

\`\`\`bash
cd ~/my-team-project
claude mcp add --transport http team-api https://mcp.company.com/api
\`\`\`

This writes to .claude/settings.json in your project root. Commit it to git. When teammates clone the repo and run Claude Code, the team-api server automatically appears in their /mcp list.

## Manual configuration in JSON

For complex setups or scripting, you can edit the configuration files directly.

Here is a .claude/settings.json with multiple servers:

\`\`\`json
{
  "mcpServers": {
    "local-fs": {
      "transport": "stdio",
      "command": "node",
      "args": ["~/my-mcp-server/dist/index.js"]
    },
    "postgres": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    },
    "internal-api": {
      "transport": "http",
      "url": "https://mcp.company.com/api",
      "headers": {
        "Authorization": "Bearer \${env:MCP_API_TOKEN}"
      }
    }
  }
}
\`\`\`

Environment variables in the config are resolved at runtime. Set them in your shell:

\`\`\`bash
export MCP_API_TOKEN="secret_key_here"
claude
\`\`\`

## Authenticating HTTP servers

MCP servers running over HTTP usually require authentication for security. Claude Code supports two patterns:

### OAuth (interactive)

If your HTTP server implements OAuth, Claude Code handles the flow automatically:

\`\`\`bash
claude mcp add --transport http github https://mcp.github.com/api
\`\`\`

Next time you use the server, Claude Code opens your browser. Log in, approve permissions, and Claude Code stores the token for future sessions. No manual token management.

### Bearer tokens

For servers that issue static tokens (common in enterprise), use the headers field:

\`\`\`bash
claude mcp add --transport http --headers 'Authorization: Bearer token123' data-api https://data.company.com/mcp
\`\`\`

Or store the token in an environment variable and reference it:

\`\`\`bash
export DATA_API_TOKEN="token123"
claude mcp add --transport http --headers "Authorization: Bearer \${DATA_API_TOKEN}" data-api https://data.company.com/mcp
\`\`\`

For secrets, never commit tokens to git. Use environment variables in .claude/settings.json and document them in your project README.

## Sharing MCP configs with your team

When your team shares a project, the MCP configuration should travel with the code.

1. **Commit the config file:**

\`\`\`bash
git add .claude/settings.json
git commit -m "Add team MCP servers (postgres, internal-api)"
git push origin main
\`\`\`

2. **Document environment variables in your README:**

\`\`\`markdown
## MCP Setup

This project uses MCP servers for internal APIs and databases.

### Environment variables

Set these in your shell profile before running Claude Code:

\`\`\`bash
export DATABASE_URL="postgresql://user:pass@host/dbname"
export MCP_API_TOKEN="your_api_token"
export GITHUB_TOKEN="your_github_token"
\`\`\`

Then run claude as usual. All MCP servers will connect automatically.
\`\`\`

3. **Test on a teammate's machine:**

When a teammate clones the repo and runs Claude Code, they should see all servers in /mcp. If a server shows "error", they likely need to set an environment variable.

## Troubleshooting common issues

| Issue | Cause | Fix |
| --- | --- | --- |
| Server shows "error" in /mcp | Command failed or connection refused | Run the command in your terminal first to verify it works |
| OAuth popup never appears | Token was already cached or auth failed | Run claude mcp remove, then add again and use /mcp immediately |
| "Bearer token rejected" | Wrong token or server not ready | Verify the token is current and the server is running |
| Env variable not resolved | Shell variable not exported | Run export VAR=value in your shell, not just inside .bashrc; then launch Claude Code |
| Tools not available in prompts | Server is "pending" (still starting) | Wait a few seconds or type /mcp to force refresh |

If a local stdio server crashes, Claude Code stops being able to call its tools. The server process is tied to your session lifecycle — when it exits, the connection drops.

## Best practices for team workflows

- **Use project-local configs** — commit .claude/settings.json so all contributors have identical setups
- **Externalise secrets** — never hardcode API keys; always use environment variables
- **Document each server** — add a comment in your config explaining what each server does and how to authenticate
- **Start small** — add one server, verify it works in /mcp, then add more
- **Version your servers** — if a server requires a specific version of a package, pin it in your args or docs
- **Monitor server health** — periodically test servers to ensure they are still responding

## Next steps

Once you have MCP servers wired into Claude Code:

1. Test each tool in a real workflow — ask Claude Code to solve a problem using your servers
2. Add more tools — iterate on your server's capabilities based on what you actually use
3. Deploy for your team — move successful local servers to HTTP so teammates can use them without local setup
4. Share the workflow — publish how you use MCP and Claude Code together on Onie

The MCP ecosystem continues to grow. Find published servers in the [Anthropic directory](https://docs.anthropic.com/mcp/directory) or [cursor.directory](https://cursor.directory), and build custom servers to fill gaps in your workflow.
`.trim(),
  faqs: [
    {
      question: 'Should I use stdio or HTTP for my team?',
      answer:
        'Start with stdio for development and proof of concept. Move to HTTP when multiple teammates need the same server without each running a local process. HTTP scales better and supports persistent services that run 24/7. Stdio is simpler for one-off tools or temporary workflows.',
    },
    {
      question: 'How do I keep my API token secure in Claude Code?',
      answer:
        'Never hardcode tokens in .claude/settings.json or commit them to git. Instead, use ${env:VARIABLE_NAME} in the config and set the actual token in your shell profile (~/.zshrc or ~/.bashrc). This way the token stays local and never leaves your machine in version control.',
    },
    {
      question: 'Can I use the same MCP server in both Claude Code and Claude Desktop?',
      answer:
        'Yes. The MCP protocol is universal. A server you configure for Claude Code can be added to Claude Desktop or any other MCP-compatible host. The configuration syntax differs slightly (Claude Desktop uses .mcp.json, Claude Code uses .claude/settings.json), but the server code is identical.',
    },
    {
      question: 'What happens if my HTTP MCP server goes down?',
      answer:
        'Claude Code shows the server as "error" in /mcp and cannot call its tools. If it is a critical tool, your workflow stops until the server recovers. For critical workflows, run HTTP servers behind a load balancer or auto-scaling service so failures are transparent.',
    },
    {
      question: 'How do I debug an MCP server that fails to connect?',
      answer:
        'For stdio: run the command directly in your terminal to see errors. For HTTP: use curl or your browser to test the endpoint (curl -H "Authorization: Bearer token" https://server-url/mcp). Check logs on both the server side and inside Claude Code (run /mcp and click the server name for error details).',
    },
    {
      question: 'Can I add the same server twice with different names?',
      answer:
        'Yes. This is useful if you have staging and production versions of the same server. Add them as separate entries with different names (prod-api, staging-api) so you can choose which one to use in a given Claude Code session.',
    },
    {
      question: 'What scopes should my team use for MCP servers?',
      answer:
        'Use local scope (the default) for project-specific servers — commit .claude/settings.json to git. Use user scope (--scope user) for personal or widely-shared tools you want in every project. Avoid mixing scopes for the same server in a team project, or configs will conflict.',
    },
    {
      question: 'How do I add an MCP server from a GitHub repo or npm package?',
      answer:
        'Most published MCP servers are npm packages. For stdio, use npx in your args: npx -y package-name. For HTTP, the package docs will provide a URL to the hosted server. If it is a GitHub repo, clone it locally, build it, then register the command or URL with claude mcp add.',
    },
  ],
}
