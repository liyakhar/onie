import type { BlogPost } from '#/content/blog/types'

export const modelContextProtocolTutorialPost: BlogPost = {
  slug: 'model-context-protocol-tutorial',
  title: 'Model Context Protocol tutorial: Connect AI to your tools',
  description:
    'Learn MCP from scratch. Build your first server, connect Claude or Cursor to your tools, and understand how MCP enables AI integrations without bespoke rewrites.',
  publishedAt: '2026-07-21',
  readingMinutes: 12,
  primaryKeyword: 'model context protocol tutorial',
  keywordCluster: [
    'model context protocol tutorial',
    'mcp server tutorial',
    'how mcp works',
    'mcp client server',
    'mcp resources tools prompts',
    'mcp setup guide',
  ],
  author: {
    name: 'Jordan Roberts',
    role: 'Full-stack engineer · MCP practitioner',
    bio: 'Builds MCP servers for internal tooling and connects Claude to proprietary systems. Ships workflows and integrations on Onie.',
  },
  tldr:
    'Model Context Protocol (MCP) standardizes how AI hosts like Claude or Cursor discover and invoke external tools. MCP is built on three primitives—Resources (read-only data), Tools (callable functions), and Prompts (task templates)—communicated over JSON-RPC. Learn the architecture, build your first server in under an hour, and deploy it locally or to the cloud.',
  relatedSlugs: ['build-mcp-server', 'claude-code-mcp-add', 'mcp-server-cursor-setup'],
  body: `
## Why MCP matters in 2026

Until MCP, connecting an AI model to external tools meant writing custom integrations for each platform. You'd write OpenAI function schemas, then rewrite them for Claude, then again for your local fine-tuned model. Every tool connection required hand-rolled JSON schemas and prompt engineering hacks.

Model Context Protocol changes that. Instead of rewiring for every model, you define your tools once in MCP. Any MCP-compatible host—Claude Desktop, Cursor, VS Code Copilot, or a custom agent—gets access to the same tool surface automatically.

By July 2026, the ecosystem has exploded. Community-built MCP servers exist for GitHub, Slack, PostgreSQL, Supabase, Stripe, Figma, Docker, and hundreds of other platforms. If you're still copy-pasting data between your AI chat and external APIs, you're leaving productivity on the table.

## The MCP architecture

MCP uses a three-layer model. Understanding each layer is critical for building and debugging:

### Hosts and clients

A **host** is the AI application—Claude Desktop, Cursor, Claude Code, or a custom agent. The host starts up and spawns one or more MCP connections. Inside the host runs a **client**—a protocol handler that manages session negotiation, message routing, and lifecycle.

The host (and its client) ask the server: "What can you do?" The server responds with a list of resources, tools, and prompts. From that point forward, whenever the model decides to invoke a tool, the client sends the request to the server, the server executes it, and the result comes back to the model.

### Servers

An **MCP server** is a subprocess or remote service that exposes capabilities. Capabilities come in three flavors:

- **Resources** — read-only data. File contents, database rows, API responses, markdown documents. The model can request resources on demand instead of stuffing them into the prompt upfront.
- **Tools** — executable functions. Create a GitHub issue, deploy to Vercel, query a database, send a Slack message. Tools have typed schemas and side effects.
- **Prompts** — reusable task templates. A server can expose a "code review" prompt that accepts a PR URL and returns a structured template. Reduces token waste and standardizes workflows.

### Transport

Communication happens over JSON-RPC 2.0. Two transport options:

- **stdio** — Local subprocess communication. Perfect for development and desktop apps. The client spawns the server as a child process and communicates over stdin/stdout.
- **HTTP** — Remote, scalable connections. Deploy servers to Vercel, AWS Lambda, or any cloud. Clients connect over HTTPS.

This separation is powerful. A single host can connect to multiple servers. If you expose GitHub tools on one server and Slack tools on another, the model sees a unified tool surface and doesn't care about the network topology.

## The three primitives: Resources, Tools, and Prompts

Let's look at what each primitive does and when to use it.

### Resources: read-only snapshots

Resources provide data the model can read on demand. Think of them as addressable URLs on your MCP server.

Common examples:

- A file in your repository (e.g., \`README.md\`)
- The result of a database query (e.g., a list of customers)
- A Slack channel's message history
- An API response (e.g., the current status of a deployment)

Resources are read-only from the model's perspective. The model can ask for a resource, and the server returns it. Resources are the backbone of in-context RAG (retrieval-augmented generation). Instead of stuffing documents into the prompt, you expose them as resources the model can fetch on demand.

### Tools: executable functions

Tools are where the action happens. A tool is a function with:

- A name and description (what it does and when to use it)
- Input schema (parameters, types, validation)
- A handler (the code that runs when invoked)

When a model invokes a tool, the client sends the request to the server, the handler runs, and the result comes back as structured text.

Examples of tools:

- Create a GitHub issue
- Query a database
- Deploy a service
- Send a Slack message
- Run a command on your machine

### Prompts: reusable task templates

Prompts are pre-defined task templates. A server can expose prompts the model can request. For example, a code-review server might expose a \`review_pull_request\` prompt that accepts a PR URL and returns a review template.

Prompts reduce prompt engineering overhead. Instead of asking the model "review this PR thoroughly, check for security issues, and return a structured analysis," the server provides a structured prompt that does exactly that, every time.

## Building your first MCP server

Let's build a real server that exposes weather data as a resource and a temperature-alert tool. This pattern works for any data source or API.

### Step 1: Scaffold with TypeScript

Create a new folder and install the SDK:

\`\`\`bash
mkdir weather-mcp && cd weather-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node ts-node
\`\`\`

Create \`src/index.ts\`:

\`\`\`typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});
\`\`\`

The \`McpServer\` class handles protocol negotiation and message routing. The \`StdioServerTransport\` connects the server to stdin/stdout so it can talk to the host.

### Step 2: Add a resource

Let's expose weather data as a resource:

\`\`\`typescript
server.resource(
  "weather://current/{location}",
  { location: z.string().describe("City name") },
  async ({ location }) => {
    // In production, fetch from a real API like OpenWeather
    const data = {
      location,
      temperature: 72,
      condition: "Partly cloudy",
      humidity: 65,
    };
    return {
      contents: [
        {
          uri: \`weather://current/\${location}\`,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);
\`\`\`

The resource accepts a location parameter and returns weather data. The model can request the resource by URI, and the server calls the handler to fetch it.

### Step 3: Add a tool

Tools are executable functions:

\`\`\`typescript
server.tool(
  "alert_temperature",
  "Trigger an alert if temperature exceeds a threshold",
  {
    location: z.string().describe("City name"),
    threshold: z.number().describe("Temperature threshold in Fahrenheit"),
  },
  async ({ location, threshold }) => {
    // In production, integrate with a real alerting service
    console.log(\`Alert for \${location}: threshold is \${threshold}F\`);
    return {
      content: [
        {
          type: "text",
          text: \`Alert registered for \${location}. You will be notified if temperature exceeds \${threshold}F.\`,
        },
      ],
    };
  }
);
\`\`\`

When the model invokes \`alert_temperature\`, the client sends the request to the server, the handler logs and processes it, and returns a text response.

### Step 4: Start the server

Connect the transport and start:

\`\`\`typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP server started");
}

main().catch(console.error);
\`\`\`

Add to \`package.json\`:

\`\`\`json
{
  "type": "module",
  "scripts": {
    "dev": "ts-node src/index.ts"
  }
}
\`\`\`

Run: \`npm run dev\`. Your server is now listening.

### Step 5: Connect to Claude Desktop or Cursor

In Claude Desktop, edit \`~/Library/Application Support/Claude/claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-mcp/dist/index.js"]
    }
  }
}
\`\`\`

Restart Claude. In the Chat interface, you'll see a tool icon with your weather tools available.

In Cursor, edit \`.cursor/mcp.json\`:

\`\`\`json
{
  "mcpServers": [
    {
      "name": "weather",
      "command": "node",
      "args": ["/path/to/weather-mcp/dist/index.js"]
    }
  ]
}
\`\`\`

Press \`Cmd+K\` (or \`Ctrl+K\`) and reload. Claude Code now has access to your tools.

## Scaling to production

Local stdio works great for development. For production, use HTTP:

\`\`\`typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// or for HTTP:
// import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/http.js";

const transport = process.env.TRANSPORT === "http"
  ? new StreamableHTTPServerTransport({
      url: process.env.MCP_URL || "http://localhost:3000",
      sessionIdGenerator: undefined, // Stateless for horizontal scaling
    })
  : new StdioServerTransport();
\`\`\`

A stateless server can run on Vercel, AWS Lambda, or any serverless platform. Deploy the server, point the host to the HTTP URL, and the model gets access to your tools from anywhere.

## Best practices

### 1. Schema design matters

Good tool descriptions help the model decide when to invoke them. A tool named \`fetch_user\` with description "Get user by ID" is clearer than \`get_u\` with no description.

\`\`\`typescript
server.tool(
  "fetch_user",
  "Retrieve user profile by ID. Use this to get user email, name, and account status.",
  {
    userId: z.string().describe("The user's unique ID in the system"),
  },
  // handler...
);
\`\`\`

### 2. Errors are text

When a tool fails, return an error message as text:

\`\`\`typescript
return {
  content: [
    {
      type: "text",
      text: \`Error: User not found. Check the ID and try again.\`,
    },
  ],
  isError: true,
};
\`\`\`

### 3. Resources > inline context

If you have data the model should read, expose it as a resource. Resources keep the protocol lightweight and let the model fetch data on demand.

### 4. Validate inputs

Use Zod or similar to validate tool inputs. The schema is automatically sent to the model, and the SDK validates incoming requests:

\`\`\`typescript
const params = z.object({
  url: z.string().url("Must be a valid URL"),
  timeout: z.number().min(100).max(30000),
});
\`\`\`

## Debugging and testing

### MCP Inspector

Use the official MCP Inspector to test your server locally without a host:

\`\`\`bash
npx @modelcontextprotocol/inspector node dist/index.js
\`\`\`

This opens a web UI where you can:

- See all exposed resources, tools, and prompts
- Invoke tools and see responses
- Test parameters and error handling

### Logs and error messages

Stderr is your friend. The host discards stdout, so use \`console.error()\` for debugging:

\`\`\`typescript
console.error(\`Tool \${toolName} called with:\`, params);
\`\`\`

### Test in Cursor

Claude Code runs locally, so it's easier to debug than cloud. Write a simple task: "Use the weather tool to get the temperature for San Francisco." Claude Code will invoke your tool, and you can watch the output in the terminal.

## Connecting MCP to Onie workflows

If you build an MCP server and want to publish the workflow on Onie, document your server's capabilities and how to set it up. Show a real example workflow: How does a practitioner use it in Claude Code or Cursor? Link to the server repository and share a sample Claude Code automation or Cursor skill that uses it.

Onie's community shares workflows and integrations. If you've built an MCP server that saves you time, others want to learn from it.

## FAQ

**Can I use MCP with ChatGPT or Gemini?** Yes. MCP is not Claude-specific. Any host that supports MCP can connect to your server. OpenAI, Google, and other platforms have added MCP support or announced plans to.

**Do I need to rebuild my server for each host?** No. One MCP server works with any MCP-compatible host. That's the whole point.

**What if I need to store state across tool calls?** Use an explicit state handle pattern. A tool returns a handle (a string ID), and subsequent tool calls accept that handle as input. Store the state in a database or cache.

**Is MCP secure?** MCP itself has no built-in auth. Use OAuth 2.1 with PKCE for remote HTTP servers, and rely on file system permissions for local stdio servers. Always validate inputs in your tool handlers.

**Can I deploy an MCP server to Vercel or Lambda?** Yes. Use HTTP transport instead of stdio. Set \`sessionIdGenerator: undefined\` for stateless operation, and any cloud platform can host it.

**How do I test an MCP server?** Use the MCP Inspector (\`npx @modelcontextprotocol/inspector\`), or write a simple test client using the SDK.

**Where can I find pre-built MCP servers?** The official MCP registry lists hundreds. Search for "mcp github" or "mcp notion" for popular integrations.
`.trim(),
  faqs: [
    {
      question: 'What is the Model Context Protocol?',
      answer:
        'MCP is an open standard that allows AI hosts like Claude or Cursor to discover and invoke external tools, resources, and templates. It eliminates the need for bespoke integrations between each model and each API by defining a universal protocol layer. Instead of rewriting tool definitions for OpenAI, Claude, and every other platform, you define them once in MCP and any compatible host can use them.',
    },
    {
      question: 'What are the three MCP primitives?',
      answer:
        'Resources are read-only data snapshots the model can fetch on demand (file contents, database rows, API responses). Tools are executable functions with typed schemas and side effects (create a GitHub issue, deploy a service, send a message). Prompts are reusable task templates that standardize workflows and reduce token waste.',
    },
    {
      question: 'How do I connect an MCP server to Claude Desktop?',
      answer:
        'Edit the MCP configuration file at ~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or the equivalent on Windows/Linux. Add a new entry under "mcpServers" pointing to your server command. Restart Claude. The server will appear in the Chat interface as an available tool source.',
    },
    {
      question: 'How do I connect an MCP server to Cursor?',
      answer:
        'Create or edit .cursor/mcp.json in your project root. Add an entry under "mcpServers" with your server command and args. Reload Cursor or press Cmd+K. Claude Code will detect the server and expose its tools.',
    },
    {
      question: 'What transport options does MCP support?',
      answer:
        'stdio (local subprocess communication, perfect for development and desktop apps) and HTTP (remote, scalable connections suitable for cloud deployment). Use stdio for development and local Cursor/Claude Desktop setups. Use HTTP to deploy servers to Vercel, AWS Lambda, or other cloud platforms.',
    },
    {
      question: 'Can I use MCP with platforms other than Claude?',
      answer:
        'Yes. MCP is platform-agnostic. OpenAI, Google, and other providers have added or announced MCP support. Any MCP-compatible host can connect to your server, regardless of the underlying model.',
    },
    {
      question: 'How do I test an MCP server locally?',
      answer:
        'Use the official MCP Inspector: npx @modelcontextprotocol/inspector node dist/index.js. This opens a web UI where you can view all exposed resources and tools, invoke them with test parameters, and see responses. Great for debugging before connecting to a host.',
    },
    {
      question: 'How do I handle state across multiple tool calls?',
      answer:
        'Use the explicit state handle pattern. A tool returns a handle (a string identifier), and subsequent tool calls accept that handle as input. Store the actual state in a database or cache keyed by the handle. This pattern works for both stateful and stateless deployments.',
    },
  ],
}
