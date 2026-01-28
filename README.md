# Proxy Manager

> 🚀 Cross-platform CLI tool for managing proxy environment variables

[![npm version](https://badge.fury.io/js/%40ryuyx%2Fpvm.svg)](https://www.npmjs.com/package/@ryuyx/pvm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Cross-platform** - Works on Windows, macOS, and Linux  
✅ **Simple CLI** - Easy-to-use commands for managing proxies  
✅ **Persistent Config** - Save proxy settings for reuse  
✅ **NO_PROXY Support** - Manage proxy bypass lists  
✅ **Shell Integration** - Optional shell functions for seamless usage

## Installation

```bash
npm install -g @ryuyx/pvm
```

## Quick Start

```bash
# Set proxy
pvm set http://127.0.0.1:7890

# Enable proxy (shows commands to run)
pvm on

# Check status
pvm list

# Disable proxy
pvm off
```

## Usage

### Basic Commands

**Check current status:**
```bash
pvm
pvm list
```

**Set proxy URL:**
```bash
# Set both HTTP and HTTPS to the same URL
pvm set http://127.0.0.1:7890

# Set HTTP and HTTPS separately
pvm set --http http://127.0.0.1:7890 --https http://127.0.0.1:7891

# Set with NO_PROXY list
pvm set http://127.0.0.1:7890 --no-proxy "localhost,127.0.0.1,.local"
```

**Enable/Disable proxy:**
```bash
pvm on    # Shows commands to enable
pvm off   # Shows commands to disable
```

### Configuration Management

**View configuration:**
```bash
pvm config show
```

**Set specific values:**
```bash
pvm config set http http://127.0.0.1:7890
pvm config set https http://127.0.0.1:7891
pvm config set both http://127.0.0.1:7890
pvm config set no-proxy "localhost,127.0.0.1"
```

**Manage NO_PROXY list:**
```bash
# Add domain to NO_PROXY
pvm config add no-proxy .local

# Remove domain from NO_PROXY
pvm config rm no-proxy .local
```

**Reset to defaults:**
```bash
pvm config reset
```

## Shell Integration

Since Node.js runs in a subprocess and cannot modify the parent shell's environment, you have the following options:

### Option 1: Automatic Installation (Recommended)

Simply run the install command to automatically add shell integration:

```bash
pvm install
```

This will:
- Detect your shell type (Bash, Zsh, or PowerShell)
- Add the integration function to your shell config file
- Enable `pvm on` and `pvm off` to work automatically

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc for Zsh
# Or simply restart your terminal
```

To uninstall:
```bash
pvm uninstall
```

### Option 2: Manual Copy-Paste (Simple)

```bash
# 1. Run this to see the commands
pvm on

# 2. Copy and paste the output commands into your shell
export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
# ... etc
```

### Option 3: Manual Shell Function (Advanced)

If you prefer to add the function manually, add this to your shell profile:

**For Bash/Zsh** (~/.bashrc or ~/.zshrc):
```bash
pvm() {
  if [ "$1" = "on" ]; then
    eval "$(command pvm on 2>/dev/null | grep -E '^(export|unset)')"
    echo "✓ Proxy enabled"
  elif [ "$1" = "off" ]; then
    eval "$(command pvm off 2>/dev/null | grep -E '^(export|unset)')"
    echo "✗ Proxy disabled"
  else
    command pvm "$@"
  fi
}
```

**For PowerShell** ($PROFILE):
```powershell
function pvm {
  if ($args[0] -eq "on") {
    $commands = pvm-actual on 2>$null | Select-String '^\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✓ Proxy enabled" -ForegroundColor Green
  } elseif ($args[0] -eq "off") {
    $commands = pvm-actual off 2>$null | Select-String '^\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✗ Proxy disabled" -ForegroundColor Red
  } else {
    pvm-actual @args
  }
}

# Rename the actual command
Set-Alias -Name pvm-actual -Value pvm.cmd
```

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

Now you can use:
```bash
pvm on   # Actually enables proxy
pvm off  # Actually disables proxy
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
| `pvm` | Show current status |
| `pvm on` | Display commands to enable proxy |
| `pvm off` | Display commands to disable proxy |
| `pvm list` | Show configuration and status |
| `pvm set <url>` | Set proxy URL |
| `pvm install` | Auto-install shell integration |
| `pvm uninstall` | Remove shell integration |
| `pvm config show` | Show configuration |
| `pvm config set <key> <value>` | Set config value |
| `pvm config add no-proxy <item>` | Add to NO_PROXY list |
| `pvm config rm no-proxy <item>` | Remove from NO_PROXY list |
| `pvm config reset` | Reset to defaults |

## Environment Variables

This tool manages the following environment variables:

- `http_proxy` / `HTTP_PROXY` - HTTP proxy URL
- `https_proxy` / `HTTPS_PROXY` - HTTPS proxy URL
- `no_proxy` / `NO_PROXY` - Comma-separated list of hosts to bypass proxy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Liu Yuxuan

## Related Projects

- [conf](https://github.com/sindresorhus/conf) - Simple config handling
- [commander](https://github.com/tj/commander.js) - Node.js CLI framework
- [chalk](https://github.com/chalk/chalk) - Terminal styling

---

Made with ❤️ for developers who need proxy management
