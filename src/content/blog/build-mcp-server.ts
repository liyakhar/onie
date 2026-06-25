import type { BlogPost } from '#/content/blog/types'

export const buildMcpServerPost: BlogPost = {
  slug: 'build-mcp-server',
  title: 'How to build an MCP server in 30 minutes',
  description:
    'Build a working Model Context Protocol server from scratch. Install the SDK, write a tool, test with MCP Inspector, and wire it into Claude Desktop or Cursor.',
  publishedAt: '2026-06-23',
  readingMinutes: 8,
  primaryKeyword: 'how to build an mcp server',
  keywordCluster: [
    'how to build an mcp server',
    'build mcp server',
    'mcp server setup',
    'mcp inspector',
    'fastmcp python',
    'mcp typescript example',
  ],
  author: {
    name: 'Jordan Roberts',
    role: 'Full-stack engineer · MCP practitioner',
    bio: 'Builds internal MCP servers to connect Claude to proprietary systems. Ships workflows and templates on Onie.',
  },
  tldr:
    'An MCP server is a subprocess that exposes tools, resources, or prompts to AI hosts via JSON-RPC. Create a folder, install the official SDK, define tools using decorators (Python) or Zod schemas (TypeScript), test with MCP Inspector, then add the server to your Claude Desktop or Cursor config. Start with a single tool; scale from there.',
  relatedSlugs: ['mcp-server-cursor-setup', 'claude-code-workflow-examples', 'how-to-write-claude-code-skills'],
  body: `
## Why build your own MCP server

You build an MCP server when you need to connect Claude, Cursor, or Claude Code to something no public server covers: an internal API, a proprietary database, a custom calculation, or a build system specific to your team.

The payoff is high: write the server once, and every MCP-compatible AI host your team uses gets that capability automatically. No additional integration work. The other reason to build your own: control. Your server runs in your infrastructure, uses your credentials, and does exactly what you specify. You are not sending data to a third party's system or waiting for someone else's release schedule.

Common use cases:
- Internal APIs — HR systems, billing data, CRMs, internal knowledge bases
- Local tooling — shell commands, file watchers, build system integration
- Air-gapped environments — data that must not leave your network
- Custom logic — domain-specific calculations no generic server covers

## How MCP works end to end

When Claude Desktop (or any MCP host) starts, it launches your server as a subprocess via stdio or connects to it over HTTP. The two parties do a handshake to negotiate protocol versions and capabilities. The host asks your server what tools it offers. From that point on, whenever the model decides to call a tool, the host forwards the call to your server, your handler runs, and the result travels back to the model.

You only write the handler. The SDK handles the JSON-RPC framing, schema generation, and lifecycle management. The server's tool name and description are what the model reads when it decides whether to call it. Treat the description like a mini-prompt: what it does, what inputs mean, when to use it.

## Setup: TypeScript with Zod (15 minutes)

The official TypeScript SDK is available as a package on npm. Start by creating a new directory and installing dependencies:

\`\`\`bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
\`\`\`

Create package.json with two critical settings:

\`\`\`json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.11.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0"
  }
}
\`\`\`

The "type": "module" line enables ES modules. Without it, the SDK's internal .js imports will fail.

Create tsconfig.json:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
\`\`\`

The module and moduleResolution must both be Node16. These settings ensure the TypeScript compiler handles the SDK's ES module imports correctly.

## Your first tool

Create src/index.ts:

\`\`\`typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "word-counter",
  version: "1.0.0",
});

server.registerTool(
  "fetch_word_count",
  {
    description:
      "Count the number of words in a block of text. Use this when the user asks how many words are in a passage.",
    inputSchema: {
      text: z.string().describe("The text whose words should be counted."),
    },
  },
  async ({ text }) => ({
    content: [
      {
        type: "text",
        text: String(text.trim().split(/\\s+/).filter(Boolean).length),
      },
    ],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("word-counter MCP server started on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
\`\`\`

Key points:
- Use console.error for logs, not console.log. Stdout is reserved for MCP protocol messages. Writing to stdout breaks the transport.
- inputSchema uses Zod; the SDK converts it to JSON Schema automatically.
- registerTool takes a name, description, schema, and handler.
- The handler returns a content array with type and text fields.

Build and test:

\`\`\`bash
npm run build
\`\`\`

## Test with MCP Inspector

Before connecting to Claude Desktop, test your server with the MCP Inspector — a browser-based tool that connects to your server, lists tools, and lets you invoke them without any Claude configuration.

\`\`\`bash
npx @modelcontextprotocol/inspector node dist/index.js
\`\`\`

The Inspector opens at http://localhost:6274. Click Tools, find fetch_word_count, enter test text in the text field, and click Run Tool. You will see the raw JSON-RPC request and response alongside the result.

Fixing bugs in the Inspector is much faster than debugging inside a full agent session. If your tool fails here, it will fail in Claude too.

## Wire it into Claude Desktop

Completely quit Claude Desktop, then edit its config file:

- macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
- Windows: %APPDATA%\\Claude\\claude_desktop_config.json
- Linux: ~/.config/Claude/claude_desktop_config.json

Add your server under mcpServers:

\`\`\`json
{
  "mcpServers": {
    "word-counter": {
      "command": "node",
      "args": ["/absolute/path/to/my-mcp-server/dist/index.js"]
    }
  }
}
\`\`\`

Use the absolute path. Relative paths do not work. Completely relaunch Claude Desktop after saving. You should see a hammer icon in the chat input bar. Ask Claude "How many words are in this paragraph?" and paste some text. It should call fetch_word_count automatically.

For Cursor, add the same config to .cursor/mcp.json in your project root. For Claude Code in a terminal, use .claude/settings.json.

## Scaling: add a second tool

Once your first tool works, adding more follows the same pattern:

\`\`\`typescript
server.registerTool(
  "check_url_status",
  {
    description: "Return the HTTP status code for a given URL. Use this to verify a URL is reachable.",
    inputSchema: {
      url: z.string().url().describe("The full URL to check, including https://"),
    },
  },
  async ({ url }) => {
    try {
      const response = await fetch(url, { timeout: 5000 });
      return {
        content: [
          {
            type: "text",
            text: \`Status: \${response.status}\`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: \`Error: \${error instanceof Error ? error.message : "Unknown error"}\`,
          },
        ],
      };
    }
  }
);
\`\`\`

## Python alternative (FastMCP)

If you prefer Python, the mcp package provides a higher-level API. No manual JSON Schema:

\`\`\`python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("word-counter")

@mcp.tool()
def fetch_word_count(text: str) -> str:
    """Count the number of words in a block of text.
    
    Use this when the user asks how many words are in a passage.
    """
    return str(len(text.split()))

if __name__ == "__main__":
    mcp.run(transport="stdio")
\`\`\`

FastMCP reads your function's type hints to build the JSON Schema automatically. The docstring becomes the description the model sees. Use uv run server.py in your Claude Desktop config instead of node.

## Critical pitfalls and fixes

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| Stray stdout in TypeScript | Tools never return results; Inspector shows parse errors | Replace every console.log() with console.error() |
| Relative path in config | Claude Desktop shows no tools after restart | Use absolute path: /home/user/my-mcp-server/dist/index.js |
| Missing "type": "module" (TS) | TypeScript compile fails with Cannot find module errors | Add to package.json and set module/moduleResolution to Node16 |
| Vague tool description | Model calls the wrong tool or hallucinates arguments | Rewrite description as a mini-prompt: what it does, when to call it |
| Server not restarted | Old tools appear in Claude Desktop after config change | Completely quit and relaunch Claude Desktop |

## Adding resources (read-only data)

Resources are read-only data the host loads as context — like attached files. Register one in TypeScript:

\`\`\`typescript
server.resource(
  "supported-cities",
  "weather://cities",
  {
    description: "List of cities with reliable weather data",
    mimeType: "application/json",
  },
  async () => {
    const cities = ["Amsterdam", "London", "New York", "Tokyo"];
    return {
      contents: [
        {
          uri: "weather://cities",
          text: JSON.stringify(cities, null, 2),
        },
      ],
    };
  }
);
\`\`\`

Resources appear alongside tools. The host loads them proactively so the model has context before deciding which tool to call.

## Moving to production: Streamable HTTP

The stdio transport is ideal for local development. For cloud-deployed servers or multi-tenant systems, switch to Streamable HTTP. The tool handler code is identical; only the transport layer changes:

\`\`\`typescript
import { McpHttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";

const transport = new McpHttpServerTransport({
  listenOptions: {
    port: 3000,
    hostname: "0.0.0.0",
  },
});

await server.connect(transport);
console.error("Server running on http://0.0.0.0:3000");
\`\`\`

Add bearer-token authentication on any Streamable HTTP server — an open HTTP endpoint is an unauthenticated remote execution risk.

## Next steps

You now have a working MCP server. Next:

1. Add more tools — each following the same registerTool pattern.
2. Add resources — read-only data the model uses as context.
3. Test with real workflows — try it in Claude Desktop with multi-step tasks that use your tools repeatedly.
4. Share your server — publish to npm so others can install it with npx.

Build in public. The setups that survive real work are worth shipping. Explore workflows for inspiration, then share yours on Onie.
`.trim(),
  faqs: [
    {
      question: 'Which language should I use, Python or TypeScript?',
      answer:
        'Both are fully supported and work identically from the host\'s perspective. Python with FastMCP is fastest to prototype — a decorator and docstring are all you need. TypeScript is a natural fit if your team already works in Node.js or you want strict compile-time types. Choose based on your team\'s existing stack.',
    },
    {
      question: 'Do I need to write JSON Schema manually?',
      answer:
        'No. FastMCP (Python) generates JSON Schema automatically from your function\'s type hints and docstring. The TypeScript SDK accepts Zod schemas and converts them. You only need raw JSON Schema if you use low-level SDK primitives or need features the high-level wrappers do not expose.',
    },
    {
      question: 'My server works in MCP Inspector but not in Claude Desktop. What should I check?',
      answer:
        'First verify the path in your config is absolute. Second, confirm the command and args exactly match what you ran in Inspector. Third, completely quit and relaunch Claude Desktop after every config change — a restart is required. Finally, check stderr output for startup errors.',
    },
    {
      question: 'Can I run multiple tools in one server?',
      answer:
        'Yes. You can register as many tools, resources, and prompts as you like in a single server instance. In practice, keep a server focused on one domain — one for your CRM, another for your file system — so the tool list stays short and the model chooses accurately.',
    },
    {
      question: 'What happens if my tool raises an exception?',
      answer:
        'An unhandled exception causes the server to return an error to the host. The better pattern is to catch exceptions inside your handler and return a response with isError: true and a plain-English explanation. That way the model can tell the user what went wrong and decide how to recover.',
    },
    {
      question: 'Can I connect my MCP server to clients other than Claude Desktop?',
      answer:
        'Yes. MCP is an open standard supported by Claude Desktop, Claude Code, Cursor, Windsurf, VS Code Copilot, and many others. A server you write today connects to any of them without changes — just add it to each host\'s config file.',
    },
  ],
}
