# pvm

[![npm version](https://badge.fury.io/js/%40ryuyx%2Fpvm.svg)](https://www.npmjs.com/package/@ryuyx/pvm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cross-platform CLI for managing `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables.

## Install

```bash
npm install -g @ryuyx/pvm
```

## Usage

```bash
# Set proxy
pvm set http://127.0.0.1:7890

# Enable / disable
pvm on
pvm off

# Check status
pvm list

# Test connectivity
pvm test
```

### Shell integration

`pvm on`/`pvm off` print export commands by default. For them to actually modify your shell environment, install the shell integration:

```bash
pvm install   # adds shell function, then reload your shell
pvm uninstall # removes it
```

After installation, `pvm on` and `pvm off` will set/unset environment variables automatically.

### Config

```bash
pvm config show                  # View config
pvm config set http <url>        # Set HTTP proxy
pvm config set https <url>       # Set HTTPS proxy
pvm config set both <url>        # Set both to same URL
pvm config set no-proxy <list>   # Set bypass list
pvm config add no-proxy <item>   # Add to bypass list
pvm config rm no-proxy <item>    # Remove from bypass list
pvm config reset                 # Reset to defaults
```

## How it works

pvm stores config in `~/.pvm/config.json` using [conf](https://github.com/sindresorhus/conf). Commands generate the appropriate `export`/`unset` statements for your shell (bash, zsh, or PowerShell). The shell integration wraps pvm with a shell function so `on`/`off` eval the output directly in the current shell.
