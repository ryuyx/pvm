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
