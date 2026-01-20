# Proxy Manager

> 🚀 Cross-platform CLI tool for managing proxy environment variables

[![npm version](https://badge.fury.io/js/%40proxy-mgr%2Fcli.svg)](https://www.npmjs.com/package/@proxy-mgr/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Cross-platform** - Works on Windows, macOS, and Linux  
✅ **Simple CLI** - Easy-to-use commands for managing proxies  
✅ **Persistent Config** - Save proxy settings for reuse  
✅ **NO_PROXY Support** - Manage proxy bypass lists  
✅ **Shell Integration** - Optional shell functions for seamless usage

## Installation

```bash
npm install -g @proxy-mgr/cli
```

## Quick Start

```bash
# Set proxy
proxy set http://127.0.0.1:7890

# Enable proxy (shows commands to run)
proxy on

# Check status
proxy list

# Disable proxy
proxy off
```

## Usage

### Basic Commands

**Check current status:**
```bash
proxy
proxy list
```

**Set proxy URL:**
```bash
# Set both HTTP and HTTPS to the same URL
proxy set http://127.0.0.1:7890

# Set HTTP and HTTPS separately
proxy set --http http://127.0.0.1:7890 --https http://127.0.0.1:7891

# Set with NO_PROXY list
proxy set http://127.0.0.1:7890 --no-proxy "localhost,127.0.0.1,.local"
```

**Enable/Disable proxy:**
```bash
proxy on    # Shows commands to enable
proxy off   # Shows commands to disable
```

### Configuration Management

**View configuration:**
```bash
proxy config show
```

**Set specific values:**
```bash
proxy config set http http://127.0.0.1:7890
proxy config set https http://127.0.0.1:7891
proxy config set both http://127.0.0.1:7890
proxy config set no-proxy "localhost,127.0.0.1"
```

**Manage NO_PROXY list:**
```bash
# Add domain to NO_PROXY
proxy config add no-proxy .local

# Remove domain from NO_PROXY
proxy config rm no-proxy .local
```

**Reset to defaults:**
```bash
proxy config reset
```

## Shell Integration

Since Node.js runs in a subprocess and cannot modify the parent shell's environment, you need to copy and run the commands shown by `proxy on` and `proxy off`.

### Option 1: Manual (Recommended for first-time users)

```bash
# 1. Run this to see the commands
proxy on

# 2. Copy and paste the output commands into your shell
export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
# ... etc
```

### Option 2: Shell Function (Advanced)

Add this to your shell profile for automatic execution:

**For Bash/Zsh** (~/.bashrc or ~/.zshrc):
```bash
proxy() {
  if [ "$1" = "on" ]; then
    eval "$(command proxy on 2>/dev/null | grep -E '^(export|unset)')"
    echo "✓ Proxy enabled"
  elif [ "$1" = "off" ]; then
    eval "$(command proxy off 2>/dev/null | grep -E '^(export|unset)')"
    echo "✗ Proxy disabled"
  else
    command proxy "$@"
  fi
}
```

**For PowerShell** ($PROFILE):
```powershell
function proxy {
  if ($args[0] -eq "on") {
    $commands = proxy-actual on 2>$null | Select-String '^\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✓ Proxy enabled" -ForegroundColor Green
  } elseif ($args[0] -eq "off") {
    $commands = proxy-actual off 2>$null | Select-String '^\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✗ Proxy disabled" -ForegroundColor Red
  } else {
    proxy-actual @args
  }
}

# Rename the actual command
Set-Alias -Name proxy-actual -Value proxy.cmd
```

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

Now you can use:
```bash
proxy on   # Actually enables proxy
proxy off  # Actually disables proxy
```

## How It Works

1. **Configuration Storage**: Settings are saved to a config file using the [conf](https://github.com/sindresorhus/conf) library
2. **Environment Variables**: Sets HTTP_PROXY, HTTPS_PROXY, and NO_PROXY (both uppercase and lowercase)
3. **Cross-platform**: Automatically detects shell type and generates appropriate commands

## Configuration File Location

Config is stored at:
- **Windows**: `%APPDATA%\proxy-manager-nodejs\Config\config.json`
- **macOS**: `~/Library/Preferences/proxy-manager-nodejs/config.json`
- **Linux**: `~/.config/proxy-manager-nodejs/config.json`

## Commands Reference

| Command | Description |
|---------|-------------|
| `proxy` | Show current status |
| `proxy on` | Display commands to enable proxy |
| `proxy off` | Display commands to disable proxy |
| `proxy list` | Show configuration and status |
| `proxy set <url>` | Set proxy URL |
| `proxy config show` | Show configuration |
| `proxy config set <key> <value>` | Set config value |
| `proxy config add no-proxy <item>` | Add to NO_PROXY list |
| `proxy config rm no-proxy <item>` | Remove from NO_PROXY list |
| `proxy config reset` | Reset to defaults |

## Environment Variables

This tool manages the following environment variables:

- `http_proxy` / `HTTP_PROXY` - HTTP proxy URL
- `https_proxy` / `HTTPS_PROXY` - HTTPS proxy URL
- `no_proxy` / `NO_PROXY` - Comma-separated list of hosts to bypass proxy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Related Projects

- [conf](https://github.com/sindresorhus/conf) - Simple config handling
- [commander](https://github.com/tj/commander.js) - Node.js CLI framework
- [chalk](https://github.com/chalk/chalk) - Terminal styling

---

Made with ❤️ for developers who need proxy management
