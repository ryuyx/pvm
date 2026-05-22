# pvm

[![npm version](https://badge.fury.io/js/%40ryuyx%2Fpvm.svg)](https://www.npmjs.com/package/@ryuyx/pvm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cross-platform CLI for managing `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables.

pvm stores your proxy configuration in `~/.pvm/config.json` and generates the appropriate `export`/`unset` statements for your shell (Bash, Zsh, or PowerShell). With optional shell integration, `pvm on` / `pvm off` can actually modify your current shell's environment.

---

## Install

```bash
npm install -g @ryuyx/pvm
```

Verify installation:

```bash
pvm --version
pvm --help
```

---

## Quick Start

```bash
# 1. First-time setup (configure proxy + install shell integration)
pvm init

# 2. Enable proxy
pvm on

# 3. Verify it's working
pvm list
pvm test
```

---

## Commands

### `pvm on` — Enable proxy

Prints the `export` statements needed to set `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` in your current shell.

```bash
pvm on
```

**Output:**

```
[proxy] Enabling proxy...

Bash/Zsh detected. Run the following commands:

export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"
export NO_PROXY="localhost,127.0.0.1"
export no_proxy="localhost,127.0.0.1"
```

Without shell integration, you need to manually copy & paste these commands, or eval the output:

```bash
eval "$(pvm on | grep -E '^(export|unset|\$env:)')"
```

With shell integration installed (via `pvm init`), just run `pvm on` and it takes effect automatically.

The first time you run `pvm on` without shell integration, it will prompt you to install it.

### `pvm off` — Disable proxy

Prints `unset` / `Remove-Item` commands for all proxy variables.

```bash
pvm off
```

### `pvm list` — Show configuration and status

Displays both saved configuration and current environment variables. Also shows whether proxy is currently enabled.

```bash
pvm list
```

Alias: `pvm status`

### `pvm set <url>` — Set proxy URL

Sets both HTTP and HTTPS proxy to the same URL. This is the quickest way to configure.

```bash
pvm set http://127.0.0.1:7890
```

For more granular control, use options:

```bash
pvm set --http http://proxy.example.com:8080 --https http://proxy.example.com:8443 --no-proxy "localhost,127.0.0.1,.local"
```

### `pvm config` — Manage configuration

```bash
# View current config (same as pvm list)
pvm config show

# Set HTTP proxy only
pvm config set http http://proxy.example.com:8080

# Set HTTPS proxy only
pvm config set https http://proxy.example.com:8443

# Set both to same URL
pvm config set both http://127.0.0.1:7890

# Set NO_PROXY list (comma-separated, overwrites existing)
pvm config set no-proxy "localhost,127.0.0.1,.local,.internal"

# Add an item to NO_PROXY (preserves existing)
pvm config add no-proxy .example.com

# Remove an item from NO_PROXY
pvm config rm no-proxy .internal

# Reset all settings to defaults (http://127.0.0.1:20170)
pvm config reset
```

> **Note on keys**: Both `no-proxy` and `no_proxy` (with underscore) are accepted as key names.

### `pvm test` — Test proxy connectivity

Runs connectivity tests to verify your proxy is working. It:

1. Checks direct internet connectivity (via httpbin.org)
2. Tests the configured proxy endpoint (port + HTTP)
3. Displays latency, exit IP, and location info
4. Shows overhead compared to direct connection

```bash
pvm test
```

Alias: `pvm doctor`

Output example:

```
🧪 Testing proxy configuration...

Current Configuration:
  HTTP Proxy:  http://127.0.0.1:7890
  HTTPS Proxy: http://127.0.0.1:7890
  Status:      ✓ ENABLED
  Shell:       Bash/Zsh

Testing direct connection (no proxy)...
  ✓ Connected directly
    Latency: 45ms
    IP: 1.2.3.4
    Location: Tokyo, Japan

Testing proxy connection (http://127.0.0.1:7890)...
  ✓ Proxy is reachable
    Latency: 120ms
    Overhead: +75ms compared to direct
    Exit IP: 5.6.7.8
    Exit Location: Los Angeles, United States
    ✓ IP successfully changed!
```

### `pvm init` — First-time setup

Interactive guided setup for new users. Configures your proxy URL and optionally installs shell integration.

```bash
pvm init
```

`pvm init` will:

1. Check if a proxy URL is already configured — if not, prompt for one (default: `http://127.0.0.1:20170`)
2. Check if shell integration is installed — if not, offer to install it
3. Show a summary of what was configured

In non-interactive environments (CI/CD), `pvm init` silently shows the current configuration without making changes.

### `pvm clean` — Remove shell integration

Removes the pvm shell function from your shell config file and optionally resets proxy configuration.

```bash
pvm clean
```

`pvm clean` will:

1. Confirm removal of shell integration (if present)
2. Optionally ask "Reset proxy configuration to defaults?"
3. Show reload instructions

In non-interactive environments, it removes shell integration silently but does NOT reset config.

#### How shell integration works

`pvm init` appends a shell function to your shell's config file (`.zshrc`, `.bashrc`, or PowerShell `$PROFILE`). When you run `pvm on`, the wrapper function:

1. Calls the real pvm binary and captures its output
2. Filters for `export`/`unset` lines
3. Evals them in the **current** shell

This is necessary because a child process cannot modify its parent's environment — the shell function bridges that gap.

---

## Configuration File

pvm stores its configuration at:

```
~/.pvm/config.json
```

This file is managed via the `pvm config` commands. Default values:

| Key       | Default                  |
| --------- | ------------------------ |
| `http`    | `http://127.0.0.1:20170` |
| `https`   | `http://127.0.0.1:20170` |
| `noProxy` | `""` (empty)             |

> The default port `20170` is commonly used by proxy clients like Clash Meta. Change it to match your proxy software.

---

## NO_PROXY

The `NO_PROXY` variable specifies hosts that should bypass the proxy. Entries are comma-separated:

```bash
pvm config set no-proxy "localhost,127.0.0.1,.local,.example.com,10.0.0.0/8"
```

Typical entries:

| Entry          | Matches                                           |
| -------------- | ------------------------------------------------- |
| `localhost`    | The literal hostname                              |
| `127.0.0.1`    | Loopback IP                                       |
| `.local`       | `*.local` domains (mDNS)                          |
| `.example.com` | Any subdomain of example.com                      |
| `10.0.0.0/8`   | Entire RFC 1918 range (if your app supports CIDR) |

---

## Tips

**CI/CD usage:** In non-interactive environments, `pvm on` prints export commands without prompting. Pipe to eval if needed:

```bash
eval "$(pvm on)"
```

**Quick toggle with shell integration:**

```bash
alias proxy="pvm on"
alias noproxy="pvm off"
```

**Check what changed after pvm on:**

```bash
pvm on && pvm list
```

---

## How It Works

```
┌──────────────┐     pvm set/on/off      ┌──────────────┐
│   Your CLI   │ ──────────────────────▶  │    pvm CLI    │
│   (terminal) │ ◀──────────────────────  │  (Node.js)    │
└──────────────┘   export/unset commands  └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │  ~/.pvm/      │
                                          │  config.json  │
                                          └──────────────┘

With shell integration:
┌──────────────┐  pvm on    ┌──────────────────┐  eval  ┌──────────────┐
│   Your CLI   │ ────────▶   │  Shell function   │ ─────▶ │  Current     │
│   (terminal) │ ◀────────   │  (wrapper)        │        │  Shell Env   │
└──────────────┘   "✓ Done"  └──────────────────┘        └──────────────┘
                                  │
                                  │ calls real pvm binary
                                  ▼
                           ┌──────────────┐
                           │    pvm CLI    │
                           │  (Node.js)    │
                           └──────┬───────┘
                                  │
                           ┌──────▼───────┐
                           │  ~/.pvm/      │
                           │  config.json  │
                           └──────────────┘
```

pvm stores configuration using [conf](https://github.com/sindresorhus/conf). Commands generate shell-specific `export`/`unset` statements (Bash/Zsh) or `$env:` assignments (PowerShell). Because a subprocess cannot modify its parent shell's environment, the shell integration pattern uses a shell function to `eval` the output in the current shell session.
