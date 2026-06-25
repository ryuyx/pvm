import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { configManager } from './config.js';
import type { ProxyStatus } from '../types/index.js';

/**
 * Check if proxy is currently enabled in environment
 */
export function isProxyEnabled(): boolean {
  return !!(process.env.http_proxy || process.env.HTTP_PROXY);
}

/**
 * Get current proxy status
 */
export function getProxyStatus(): ProxyStatus {
  const config = configManager.getConfig();

  return {
    isEnabled: isProxyEnabled(),
    config,
    env: {
      http_proxy: process.env.http_proxy,
      https_proxy: process.env.https_proxy,
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      NO_PROXY: process.env.NO_PROXY,
      no_proxy: process.env.no_proxy,
    },
  };
}

/**
 * Generate shell export commands for enabling proxy
 * Returns commands that user should eval in their shell
 */
export function generateEnableCommands(): string {
  const config = configManager.getConfig();
  const commands: string[] = [];

  commands.push(`export http_proxy="${config.http}"`);
  commands.push(`export https_proxy="${config.https}"`);
  commands.push(`export HTTP_PROXY="${config.http}"`);
  commands.push(`export HTTPS_PROXY="${config.https}"`);

  if (config.noProxy) {
    commands.push(`export NO_PROXY="${config.noProxy}"`);
    commands.push(`export no_proxy="${config.noProxy}"`);
  } else {
    commands.push('unset NO_PROXY');
    commands.push('unset no_proxy');
  }

  return commands.join('\n');
}

/**
 * Generate shell commands for disabling proxy
 */
export function generateDisableCommands(): string {
  const commands = [
    'unset http_proxy',
    'unset https_proxy',
    'unset HTTP_PROXY',
    'unset HTTPS_PROXY',
    'unset NO_PROXY',
    'unset no_proxy',
  ];

  return commands.join('\n');
}

/**
 * Generate PowerShell commands for enabling proxy
 */
export function generateEnableCommandsPowerShell(): string {
  const config = configManager.getConfig();
  const commands: string[] = [];

  commands.push(`$env:http_proxy="${config.http}"`);
  commands.push(`$env:https_proxy="${config.https}"`);
  commands.push(`$env:HTTP_PROXY="${config.http}"`);
  commands.push(`$env:HTTPS_PROXY="${config.https}"`);

  if (config.noProxy) {
    commands.push(`$env:NO_PROXY="${config.noProxy}"`);
    commands.push(`$env:no_proxy="${config.noProxy}"`);
  } else {
    commands.push('Remove-Item Env:NO_PROXY -ErrorAction SilentlyContinue');
    commands.push('Remove-Item Env:no_proxy -ErrorAction SilentlyContinue');
  }

  return commands.join('\n');
}

/**
 * Generate PowerShell commands for disabling proxy
 */
export function generateDisableCommandsPowerShell(): string {
  const commands = [
    'Remove-Item Env:http_proxy -ErrorAction SilentlyContinue',
    'Remove-Item Env:https_proxy -ErrorAction SilentlyContinue',
    'Remove-Item Env:HTTP_PROXY -ErrorAction SilentlyContinue',
    'Remove-Item Env:HTTPS_PROXY -ErrorAction SilentlyContinue',
    'Remove-Item Env:NO_PROXY -ErrorAction SilentlyContinue',
    'Remove-Item Env:no_proxy -ErrorAction SilentlyContinue',
  ];

  return commands.join('\n');
}

/**
 * Detect current shell type
 */
export function detectShell(): 'powershell' | 'bash' | 'unknown' {
  if (process.platform === 'win32') {
    // On Windows, check if running in PowerShell or cmd
    const shell = process.env.SHELL || process.env.ComSpec || '';
    if (shell.toLowerCase().includes('powershell') || process.env.PSModulePath) {
      return 'powershell';
    }
  }

  // Unix-like systems (macOS, Linux) or Git Bash on Windows
  const shell = process.env.SHELL || '';
  if (shell.includes('bash') || shell.includes('zsh') || shell.includes('sh')) {
    return 'bash';
  }

  return 'unknown';
}

export function detectShellWithConfig(): { shell: string; configFile: string } | null {
  const homeDir = os.homedir();

  const shellEnv = process.env.SHELL || '';

  if (shellEnv.includes('zsh')) {
    return { shell: 'zsh', configFile: path.join(homeDir, '.zshrc') };
  } else if (shellEnv.includes('bash')) {
    return { shell: 'bash', configFile: path.join(homeDir, '.bashrc') };
  } else if (os.platform() === 'win32') {
    try {
      const profilePath = execSync('powershell -NoProfile -Command "echo $PROFILE"', {
        encoding: 'utf-8',
      }).trim();
      return { shell: 'powershell', configFile: profilePath };
    } catch {
      return null;
    }
  }

  return { shell: 'bash', configFile: path.join(homeDir, '.bashrc') };
}

export function isShellIntegrationInstalled(configFile: string): boolean {
  if (!fs.existsSync(configFile)) {
    return false;
  }

  const content = fs.readFileSync(configFile, 'utf-8');
  return content.includes('# pvm - Proxy Manager shell integration');
}

// Shell function templates
const BASH_FUNCTION = `
# pvm - Proxy Manager shell integration
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
`;

const ZSH_FUNCTION = BASH_FUNCTION;

const POWERSHELL_FUNCTION = `
# pvm - Proxy Manager shell integration
function pvm {
  if ($args[0] -eq "on") {
    $commands = & pvm on 2>&1 | Select-String '^\\$env:'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✓ Proxy enabled" -ForegroundColor Green
  } elseif ($args[0] -eq "off") {
    $commands = & pvm off 2>&1 | Select-String '^\\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✗ Proxy disabled" -ForegroundColor Red
  } else {
    & pvm @args
  }
}
`;

function getShellFunction(shell: string): string {
  switch (shell) {
    case 'zsh':
      return ZSH_FUNCTION;
    case 'bash':
      return BASH_FUNCTION;
    case 'powershell':
      return POWERSHELL_FUNCTION;
    default:
      return BASH_FUNCTION;
  }
}

export function promptInstall(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(
        "Shell integration not detected. Allows 'pvm on'/'pvm off' to actually set environment variables.\n",
      ) + chalk.white('Would you like to install it now? (Y/n) '),
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer === '');
      },
    );
  });
}

export function installShellIntegration(detected: { shell: string; configFile: string }): void {
  const { shell, configFile } = detected;

  const configDir = path.dirname(configFile);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const shellFunction = getShellFunction(shell);

  removeShellIntegration(configFile);

  const separator = '\n# ' + '='.repeat(58) + '\n';
  const content = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf-8') : '';
  const newContent = content + separator + shellFunction;

  fs.writeFileSync(configFile, newContent, 'utf-8');
}

export function removeShellIntegration(configFile: string): void {
  let content: string;
  try {
    content = fs.readFileSync(configFile, 'utf-8');
  } catch {
    return;
  }
  const lines = content.split('\n');

  const findBlock = (startFrom: number): { start: number; end: number } | null => {
    let startIndex = -1;
    let endIndex = -1;

    for (let i = startFrom; i < lines.length; i++) {
      if (lines[i].includes('# pvm - Proxy Manager shell integration')) {
        startIndex = i;
        if (i > 0 && lines[i - 1].trim() === '') {
          startIndex = i - 1;
          if (i > 1 && lines[i - 2].match(/^#\s*=+$/)) {
            startIndex = i - 2;
            if (i > 2 && lines[i - 3].trim() === '') {
              startIndex = i - 3;
            }
          }
        }
        break;
      }
    }

    if (startIndex === -1) return null;

    for (let i = startIndex; i < lines.length; i++) {
      if (lines[i].match(/^}\s*$/) && i > startIndex) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) return null;

    while (endIndex + 1 < lines.length && lines[endIndex + 1].trim() === '') {
      endIndex++;
    }

    return { start: startIndex, end: endIndex };
  };

  let cursor = 0;
  const removeIndexes: number[] = [];

  while (cursor < lines.length) {
    const block = findBlock(cursor);
    if (!block) break;
    removeIndexes.push(block.start, block.end);
    cursor = block.end + 1;
  }

  if (removeIndexes.length === 0) return;

  const removeSet = new Set<number>();
  for (let i = 0; i < removeIndexes.length; i += 2) {
    for (let j = removeIndexes[i]; j <= removeIndexes[i + 1]; j++) {
      removeSet.add(j);
    }
  }

  const newLines = lines.filter((_, i) => !removeSet.has(i));
  fs.writeFileSync(configFile, newLines.join('\n'), 'utf-8');
}
