import type { BlogPost } from '#/content/blog/types'

export const installClaudeCodePost: BlogPost = {
  slug: 'install-claude-code',
  title: 'How to install Claude Code on your system',
  description:
    'Step-by-step guide to install Claude Code on macOS, Linux, Windows. Covers native install, Homebrew, WinGet, and fixes for common PATH errors.',
  publishedAt: '2026-07-12',
  readingMinutes: 8,
  primaryKeyword: 'install claude code',
  keywordCluster: [
    'install claude code',
    'claude code download',
    'claude code setup',
    'claude code installation guide',
    'how to install claude code',
  ],
  author: {
    name: 'Jordan Chen',
    role: 'Developer · Claude Code adopter',
    bio: 'Uses Claude Code daily across macOS and Linux workstations. Focuses on making terminal tooling accessible to both new and experienced developers.',
  },
  tldr:
    'Install Claude Code using the native installer (recommended) by running a one-line command in your terminal, or use Homebrew/WinGet if you prefer a package manager. After install, type `claude` in your terminal to authenticate and start coding. If you hit a PATH error, add `~/.local/bin` to your shell configuration.',
  relatedSlugs: [
    'how-to-write-claude-code-skills',
    'claude-code-workflow-examples',
    'claude-code-skills-vs-rules',
  ],
  body: `
## Native install (recommended)

The native installer is the easiest way to get Claude Code running. It downloads the latest version, places it on your PATH automatically, and updates itself in the background.

### macOS, Linux, and WSL

Copy this line and paste it into your terminal, then press Enter:

\`\`\`bash
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

The installer downloads the binary and places it at \`~/.local/bin/claude\`. When the installation finishes, you'll see "Claude Code successfully installed!"

**Supported versions:**
- macOS 13.0 or later
- Ubuntu 20.04 LTS or later
- Fedora 38 or later
- Alpine Linux 3.18 or later

### Windows PowerShell

Open PowerShell and run:

\`\`\`powershell
irm https://claude.ai/install.ps1 | iex
\`\`\`

The installer downloads and runs automatically. You'll see output scrolling as it works. When done, you'll see "Claude Code successfully installed!"

### Windows Command Prompt (CMD)

If you prefer CMD instead of PowerShell:

\`\`\`batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
\`\`\`

**Note:** On Windows, the native installer places the binary at \`%USERPROFILE%\\.local\\bin\\claude.exe\`. Git for Windows is recommended so Claude Code can use the Bash tool; otherwise it falls back to PowerShell.

## Package manager alternatives

If you already use a package manager, you can install Claude Code through it instead.

### Homebrew (macOS and Linux)

\`\`\`bash
brew install --cask claude-code
\`\`\`

Two casks are available:
- \`claude-code\` — tracks the stable release (about a week behind latest, skips regressions)
- \`claude-code@latest\` — tracks the latest channel

**Important:** Homebrew installations do not auto-update. To get new versions, run:

\`\`\`bash
brew upgrade claude-code
\`\`\`

### WinGet (Windows)

\`\`\`powershell
winget install Anthropic.ClaudeCode
\`\`\`

Like Homebrew, WinGet does not auto-update. Run \`winget upgrade Anthropic.ClaudeCode\` to update manually.

### Linux package managers

On Debian/Ubuntu:

\`\`\`bash
sudo apt install claude-code
\`\`\`

On Fedora/RHEL:

\`\`\`bash
sudo dnf install claude-code
\`\`\`

On Alpine:

\`\`\`bash
sudo apk add claude-code
\`\`\`

## Log in and start your first session

After installation, open a terminal in any project directory and start Claude Code:

\`\`\`bash
claude
\`\`\`

On first run, you'll be prompted to log in. Follow the browser window to authenticate with your Claude account. Once logged in, you're ready to start coding.

### Starting Claude Code in a project

Each time you want to use Claude Code in a new project:

\`\`\`bash
cd /path/to/your/project
claude
\`\`\`

Claude Code will open and be ready to read your code, ask questions, and make edits.

## Fixing "command not found" errors

If you installed Claude Code but got a "\`command not found\`" or "'\`claude\` is not recognized" error, the installer placed the binary on disk but your shell cannot find it. This happens when \`~/.local/bin\` is not in your shell's PATH.

### Check your PATH

Run this command to see where your shell looks for programs:

\`\`\`bash
echo $PATH
\`\`\`

Look for \`~/.local/bin\` or \`/home/username/.local/bin\` in the output. If it's missing, follow the fix below.

### Add to PATH permanently

**On macOS (zsh):**

\`\`\`bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
\`\`\`

Then close and reopen your terminal.

**On Linux (bash):**

\`\`\`bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
\`\`\`

Then close and reopen your terminal.

**On Windows PowerShell:**

PATH is usually set by the installer, but if the \`claude\` command is not found, use WinGet or Homebrew instead — they handle PATH automatically.

### Verify the fix

Test that Claude Code is on your PATH:

\`\`\`bash
claude --version
\`\`\`

You should see a version number. If it works, your PATH is set up correctly.

## Verify the installation

After installing and configuring your PATH, confirm everything works:

\`\`\`bash
claude --version
\`\`\`

Then start Claude Code:

\`\`\`bash
claude
\`\`\`

If you see the Claude Code interface and it opens without errors, you're ready to code.

## Troubleshooting other installation issues

### Network errors during download

The installer downloads from \`downloads.claude.ai\`. If you see "Failed to fetch version," verify your internet connection can reach that domain:

\`\`\`bash
curl -I https://downloads.claude.ai
\`\`\`

### Permission denied errors

If the installer fails with permission errors on Linux or macOS, check that your home directory has write permission:

\`\`\`bash
ls -la ~/ | grep .local
\`\`\`

If \`.local\` does not exist or has restricted permissions, the installer cannot create \`~/.local/bin\`. Create the directory manually:

\`\`\`bash
mkdir -p ~/.local/bin
\`\`\`

Then re-run the installer.

### Desktop app alternative

If terminal setup feels daunting, Claude Code also ships as a desktop application. Download it for macOS or Windows, then open it directly — no terminal required. On Linux, use \`sudo apt install claude-code\` to install the app alongside the CLI.

## Next steps

Once Claude Code is installed and running, you're ready to start coding. Point Claude Code at your project, ask it questions about your code, and request edits. To share your workflows with teammates, publish your skills on [Onie](/app/explore).
`.trim(),
  faqs: [
    {
      question: 'What are the system requirements for Claude Code?',
      answer:
        'Claude Code requires macOS 13.0 or later on macOS; Ubuntu 20.04 LTS or later on Linux; Windows 10 or later on Windows. WSL (Windows Subsystem for Linux) is supported. For the best experience with Git integration, install Git for Windows on Windows.',
    },
    {
      question: 'Does Claude Code auto-update?',
      answer:
        'Yes, the native installer auto-updates in the background. Homebrew and WinGet installations do not auto-update; run `brew upgrade claude-code` or `winget upgrade Anthropic.ClaudeCode` manually to get new versions.',
    },
    {
      question: 'Why is my PATH showing an error after install?',
      answer:
        'The native installer places the Claude Code binary at `~/.local/bin` (macOS/Linux) or `%USERPROFILE%\\.local\\bin` (Windows). Your shell searches for programs only in directories listed in your PATH. If `~/.local/bin` is not in PATH, add it by editing your shell configuration file (`.zshrc` on macOS, `.bashrc` on Linux). After editing, run `source ~/.zshrc` or `source ~/.bashrc` and restart your terminal.',
    },
    {
      question: 'Can I install Claude Code via npm?',
      answer:
        'Claude Code is no longer available as an npm package. Use the native installer, Homebrew, or WinGet instead. If you have an old npm installation, remove it with `npm uninstall -g @anthropic-ai/claude-code`.',
    },
    {
      question: 'How do I uninstall Claude Code?',
      answer:
        'On macOS or Linux, remove the binary with `rm ~/.local/bin/claude`. On Windows, remove it with `del %USERPROFILE%\\.local\\bin\\claude.exe`. If you installed via Homebrew, run `brew uninstall claude-code`. If via WinGet, run `winget uninstall Anthropic.ClaudeCode`. Shell configuration changes (PATH additions) must be removed manually from `.zshrc`, `.bashrc`, or PowerShell profile.',
    },
    {
      question: 'What should I do if the install command fails with a 403 error?',
      answer:
        'A 403 error means your network cannot reach the installer download server. Check your internet connection and firewall settings. Verify you can reach the download server: `curl -I https://claude.ai/install.sh`. If the problem persists, try again in a few minutes or contact Anthropic support.',
    },
    {
      question: 'Can I install Claude Code on a remote server?',
      answer:
        'Yes. SSH into your server and run the installation command for your OS (e.g., `curl -fsSL https://claude.ai/install.sh | bash` on Linux). After installing, you can run Claude Code in your terminal over SSH. Note that Claude Code requires an active internet connection and an authenticated Claude account.',
    },
    {
      question: 'Should I use the native installer or a package manager?',
      answer:
        'The native installer is recommended because it handles auto-updates and PATH configuration automatically. Use Homebrew or WinGet if you already manage your tools through them, but remember to update manually. Both approaches work equally well once installed.',
    },
  ],
}
