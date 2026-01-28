import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { isProxyEnabled } from '../core/proxy.js';

export function handleSet(url?: string, options?: { http?: string; https?: string; noProxy?: string }) {
  if (!url && !options?.http && !options?.https) {
    console.log(chalk.red('Error: Missing URL or options'));
    console.log();
    console.log('Usage:');
    console.log('  pvm set <url>');
    console.log('  pvm set --http <url> [--https <url>] [--no-proxy <list>]');
    return;
  }

  // Simple mode: pvm set <url>
  if (url && !options?.http && !options?.https) {
    configManager.setBoth(url);
    console.log(chalk.green(`[proxy] Set both HTTP and HTTPS to: ${url}`));
  }
  
  // Advanced mode with options
  if (options?.http) {
    configManager.setHttp(options.http);
    console.log(chalk.green(`[proxy] Set HTTP to: ${options.http}`));
  }
  if (options?.https) {
    configManager.setHttps(options.https);
    console.log(chalk.green(`[proxy] Set HTTPS to: ${options.https}`));
  }
  if (options?.noProxy !== undefined) {
    configManager.setNoProxy(options.noProxy);
    console.log(chalk.green(`[proxy] Set NO_PROXY to: ${options.noProxy || '<empty>'}`));
  }

  console.log();
  if (isProxyEnabled()) {
    console.log(chalk.yellow('Proxy is currently enabled. Run "pvm on" to apply new settings.'));
  } else {
    console.log(chalk.dim('Configuration saved. Run "pvm on" to enable proxy.'));
  }
}
