import type { BlogPost } from '#/content/blog/types'

export const mcpToolsResourcesPromptsPost: BlogPost = {
  slug: 'mcp-tools-resources-prompts',
  title: 'MCP tools, resources, and prompts: Control models',
  description:
    'Understand MCP primitives: tools for actions, resources for data, prompts for templates. Learn when to use each and how they control AI behavior in agent workflows.',
  publishedAt: '2026-07-27',
  readingMinutes: 9,
  primaryKeyword: 'mcp tools resources prompts difference',
  keywordCluster: [
    'mcp tools resources prompts difference',
    'mcp primitives explained',
    'mcp tools vs resources',
    'mcp prompts templates',
    'when to use mcp tools resources prompts',
    'mcp architecture primitives',
  ],
  author: {
    name: 'Jordan Roberts',
    role: 'Full-stack engineer · MCP practitioner',
    bio: 'Builds MCP servers for internal tooling and connects Claude to proprietary systems. Ships workflows and integrations on Onie.',
  },
  tldr:
    'MCP defines three primitives—Tools, Resources, and Prompts—each with a distinct control model. Tools are model-controlled (the AI decides when to invoke them); Resources are application-controlled (the host decides what data to provide); Prompts are user-controlled (humans trigger templates). Understanding this distinction prevents common design mistakes and ensures your MCP servers work correctly with Claude, Cursor, and agent frameworks.',
  relatedSlugs: ['model-context-protocol-tutorial', 'build-mcp-server', 'claude-code-mcp-add'],
  body: `
## Why primitives matter

When you start building MCP servers, the three primitives—Tools, Resources, and Prompts—might feel like arbitrary categories. They're not. Each primitive answers a specific question about control: Who decides when this capability is used?

Confusing them leads to broken workflows. A common mistake: exposing read-only data as a tool instead of a resource. The model can invoke it any number of times, potentially with side effects you didn't anticipate. Another: using a tool when you need a prompt. The model might invoke it inconsistently, and you lose the benefits of templated, predictable behavior.

Once you understand the control model behind each primitive, you design MCP servers that are intuitive to use, easier to debug, and more reliable in agent workflows.

## Tools: Model-controlled actions

**Tools are executable functions that the model decides to invoke.**

When you call an MCP-compatible host like Claude or Cursor with an available tool, the AI decides whether to use it based on the task. You describe what the tool does and what parameters it accepts. The model determines if invoking it helps complete the user's request.

Common examples of tools:

- Create a GitHub issue or pull request
- Send a Slack message
- Deploy to Vercel or AWS
- Run a database query or mutation
- Execute a shell command
- Call an external API

Tools are the only MCP primitive that causes side effects. When invoked, they change state: a file is created, a record is updated, a message is sent.

### When to use tools

Use tools when:

- The model needs to take an action to complete a task
- The action has side effects (modifies state, triggers operations)
- You want the model to decide autonomously when to invoke it
- Multiple tool invocations might be part of a single workflow (e.g., fetch user data, then create an issue)

### Tool anatomy

Every tool has four components:

1. **Name** — Unique identifier (e.g., \`create_github_issue\`)
2. **Description** — Explains what it does and when to use it
3. **Input schema** — Defines parameters, types, and constraints (as JSON Schema)
4. **Handler** — The code that executes when the model invokes it

Example in TypeScript:

\`\`\`typescript
server.tool(
  "create_github_issue",
  "Create a new GitHub issue. Use this to report bugs or suggest features.",
  {
    repository: z.string().describe("Repository in owner/repo format"),
    title: z.string().describe("Issue title"),
    body: z.string().describe("Issue description (markdown)"),
  },
  async ({ repository, title, body }) => {
    const [owner, repo] = repository.split("/");
    // Call GitHub API
    const result = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
    });
    return {
      content: [
        {
          type: "text",
          text: \`Issue created: \${result.data.html_url}\`,
        },
      ],
    };
  }
);
\`\`\`

The model sees the tool, understands what it does and what parameters are required, and decides when to invoke it.

## Resources: Application-controlled data

**Resources are read-only data sources that the application (host) decides to provide.**

Unlike tools, the model cannot autonomously request resources by URI. The host application decides what resources to expose and when to pass them to the model. Resources are identified by URIs (like filesystem paths or database URLs) and contain text or binary content.

Common examples of resources:

- A repository README or documentation file
- The result of a database query (customer list, product catalog)
- API documentation or schema
- A Slack channel's message history
- The current state of a deployment or system

Resources are the backbone of in-context learning. Instead of embedding large documents in the system prompt, you expose them as resources the model can reference on demand.

### When to use resources

Use resources when:

- The model needs to read data but shouldn't modify it
- The host application controls what data is available
- You want to keep context lean and let the model fetch data when needed
- Multiple similar items exist (e.g., multiple files or database records)

### Resource anatomy

Every resource has:

1. **URI** — A unique identifier (e.g., \`file:///docs/README.md\` or \`postgres://db/users\`)
2. **Description** — Explains what the resource contains
3. **Handler** — Returns the content when requested

Example:

\`\`\`typescript
server.resource(
  "file:///{path}",
  { path: z.string().describe("File path relative to /docs") },
  async ({ path }) => {
    const content = await fs.readFile(\`./docs/\${path}\`, "utf-8");
    return {
      contents: [
        {
          uri: \`file:///\${path}\`,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  }
);
\`\`\`

The host application decides which resources to load and pass to the model. The model reads them but never modifies them directly.

## Prompts: User-controlled templates

**Prompts are reusable task templates that users (humans) explicitly select to trigger workflows.**

Prompts are pre-defined instruction sequences that package common tasks. When a user selects a prompt from the UI, the host renders it and sends it to the model. Prompts reduce boilerplate and standardize how the model approaches a task.

Common examples of prompts:

- \`summarize_meeting\` — Generate meeting notes from a transcript
- \`review_pull_request\` — Review code and suggest improvements
- \`analyze_logs\` — Search for errors and explain what went wrong
- \`plan_project\` — Break down a project into tasks and timeline
- \`draft_email\` — Write a professional response to an incoming message

Prompts are the MCP primitive most similar to slash commands in chat interfaces.

### When to use prompts

Use prompts when:

- You want to standardize how the model approaches a task
- The task should be triggered explicitly by a user, not autonomously by the model
- You need consistent output structure or reasoning across multiple runs
- You want to reduce token waste by pre-defining the reasoning path

### Prompt anatomy

Every prompt has:

1. **Name** — Human-readable identifier (e.g., \`review_pull_request\`)
2. **Description** — Explains what the prompt does
3. **Arguments** — Parameters the user can customize
4. **Handler** — Returns the structured message sequence to send to the model

Example:

\`\`\`typescript
server.prompt(
  "review_pull_request",
  "Review a pull request for code quality, security, and style",
  { prUrl: z.string().describe("Pull request URL") },
  async ({ prUrl }) => {
    const pr = await fetchPullRequest(prUrl);
    return {
      messages: [
        {
          role: "user",
          content: \`
Review this pull request for:
- Code quality and maintainability
- Security issues
- Performance concerns
- Testing adequacy
- Documentation completeness

PR Title: \${pr.title}
Description: \${pr.description}
Changed files: \${pr.files.map(f => f.filename).join(", ")}

Return a structured review with:
1. Summary (1-2 sentences)
2. Issues found (list or none)
3. Suggested improvements
4. Overall recommendation (approve, request changes, comment)
          \`.trim(),
        },
      ],
    };
  }
);
\`\`\`

When a user selects the \`review_pull_request\` prompt, Cursor or Claude Desktop renders it, the user customizes the arguments, and the model receives a structured task.

## The control model: Who decides?

Here's the mental model that unifies all three primitives:

| Primitive | Control | When invoked | Example |
|-----------|---------|--------------|---------|
| **Tools** | Model | Model decides based on task | Create issue if bug is found |
| **Resources** | Application | Host decides what to provide | Load README when context is needed |
| **Prompts** | User | Human explicitly selects | Click "Review PR" in the UI |

This distinction prevents design mistakes. If you want something to happen automatically, use a tool. If you want the host to provide context, use a resource. If you want a repeatable workflow triggered by a human, use a prompt.

## Common mistakes

### Mistake 1: Treating resources as tools

Resources should never have side effects. If your resource does something when accessed (sends an email, logs data, modifies a database), convert it to a tool. Tools are meant for actions; resources are for reading.

### Mistake 2: Using tools for context

If you want to provide data for the model to reference, use a resource, not a tool. Tools incur latency and token cost every time the model invokes them. Resources let the host load data upfront and include it in the context window.

### Mistake 3: Using prompts for decisions

Prompts are templates for users to select, not decision trees for the model. If you want the model to decide dynamically, use a tool or resource. Prompts are triggered by humans selecting them from a menu.

## Designing a balanced MCP server

A well-designed MCP server uses all three primitives strategically:

- **Tools** for actions the model takes to help the user
- **Resources** for data the host provides for context
- **Prompts** for repeatable workflows users trigger explicitly

Example: A code-review MCP server

- **Tool**: \`submit_review_comment\` — Post a review comment on a specific line
- **Resource**: \`file://{filename}\` — Load the file content for the model to read
- **Prompt**: \`review_pull_request\` — User-triggered workflow that applies the model's review

This design separates concerns: the model can read file content (resources), decide when to leave feedback (tools), and users can trigger standardized reviews (prompts).

## Testing your primitives

Use the MCP Inspector to verify you've chosen the right primitives:

\`\`\`bash
npx @modelcontextprotocol/inspector node dist/index.js
\`\`\`

In the inspector, check:

- **Tools list** — Are these actions the model should decide to take?
- **Resources list** — Are these read-only data the host should provide?
- **Prompts list** — Are these workflows users should trigger explicitly?

If a tool has no side effects, move it to resources. If a resource can be modified, make it a tool. If a prompt is never selected by users, replace it with a tool the model can invoke directly.

## Connecting to agent workflows

When you build MCP servers for agent workflows—especially in Claude Code or custom orchestration—primitives determine how your server integrates:

- Agents need **tools** to take actions autonomously (deploy, create, modify)
- Agents need **resources** to fetch context when needed (docs, schemas, state)
- Agents need **prompts** for standardized reasoning when humans trigger workflows

Onie shares agent workflows that compose MCP servers. When documenting your server, explain which primitives you expose and what each does. A clear primitive breakdown helps practitioners understand when and how to use your server.

## FAQ

**Can I use MCP primitives with platforms other than Claude?** Yes. Any MCP-compatible host—Claude Desktop, Cursor, VS Code Copilot, or custom agents—uses the same primitives. The control model is universal.

**What if I need the model to read data and then decide whether to take an action?** Use a resource for the data (host loads it) and a tool for the action (model invokes it). This is the standard pattern.

**Can a tool return multiple results?** Yes. A tool can return structured content with multiple fields. The model receives the full result and decides what to do with it.

**Are resources cached?** No. Every time the model requests a resource, the handler runs. If you need caching, implement it in your handler using a library like \`node-cache\`.

**Can prompts have conditional logic?** Yes. The handler can inspect arguments and return different message sequences. For example, a prompt might load different context based on the file type provided.

**How do I version my primitives?** Include a version number in the server metadata, and update the descriptions when primitives change. Hosts negotiate protocol version at startup, so breaking changes should be rare.

**What if I need the model to periodively check a resource?** Use a tool that invokes the resource internally. Tools are model-controlled, so the model can call it in a loop if needed.
`.trim(),
  faqs: [
    {
      question: 'What is the difference between MCP tools and resources?',
      answer:
        'Tools are model-controlled actions with side effects. The AI decides when to invoke them. Resources are application-controlled, read-only data. The host application decides what resources to provide. Use tools for actions; use resources for context.',
    },
    {
      question: 'When should I use MCP prompts?',
      answer:
        'Use prompts for reusable task templates that users explicitly select from the UI. Prompts standardize how the model approaches a task and reduce token waste. If you want the model to decide autonomously, use a tool instead.',
    },
    {
      question: 'Can MCP tools modify state?',
      answer:
        'Yes. Tools are the only MCP primitive meant for side effects. Use tools to create files, update databases, send messages, or trigger operations. Resources and prompts should never modify state.',
    },
    {
      question: 'How does the host decide which resources to provide?',
      answer:
        'The host application controls which resources to load and pass to the model. The model can request resources by URI, but the host decides whether that resource is available and what content it contains.',
    },
    {
      question: 'What is the control model?',
      answer:
        'The control model defines who decides when a primitive is used. Tools are model-controlled (AI decides), Resources are application-controlled (host decides), Prompts are user-controlled (human decides). This distinction prevents design mistakes.',
    },
    {
      question: 'Can I use MCP with agent workflows?',
      answer:
        'Yes. Agents rely on all three primitives: tools to take autonomous actions, resources to fetch context, and prompts for standardized reasoning. MCP provides a universal interface for agents to discover and use these capabilities across platforms.',
    },
    {
      question: 'What if a tool has no side effects?',
      answer:
        'Convert it to a resource. If something only reads data without modifying state, the host should control when it is accessed, not the model. This keeps your server design clean and lets the host optimize context loading.',
    },
    {
      question: 'How do I test my MCP primitives?',
      answer:
        'Use the MCP Inspector (npx @modelcontextprotocol/inspector) to verify your primitives. Check that tools are actions, resources are read-only data, and prompts are user-triggered templates. Adjust your design if any primitive violates these principles.',
    },
  ],
}
