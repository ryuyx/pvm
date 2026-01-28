#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { handleOn } from './commands/on.js';
import { handleOff } from './commands/off.js';
import { handleList } from './commands/list.js';
import { handleSet } from './commands/set.js';
import { handleConfig } from './commands/config.js';
import { handleInstall, handleUninstall } from './commands/install.js';
import { getProxyStatus } from './core/proxy.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('pvm')
  .description('Cross-platform CLI tool for managing proxy environment variables')
  .version(packageJson.version, '-v, --version');

// pvm on
program
  .command('on')
  .description('Enable proxy (displays commands to run)')
  .action(() => {
    handleOn();
  });

// pvm off
program
  .command('off')
  .description('Disable proxy (displays commands to run)')
  .action(() => {
    handleOff();
  });

// pvm list
program
  .command('list')
  .alias('status')
  .description('Show current proxy configuration and status')
  .action(() => {
    handleList();
  });

// pvm set <url>
program
  .command('set [url]')
  .description('Set proxy URL for both HTTP and HTTPS')
  .option('--http <url>', 'Set HTTP proxy URL')
  .option('--https <url>', 'Set HTTPS proxy URL')
  .option('--no-proxy <list>', 'Set NO_PROXY list (comma-separated)')
  .action((url, options) => {
    handleSet(url, options);
  });

// pvm config
const configCmd = program
  .command('config')
  .description('Manage proxy configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    handleConfig('show');
  });

configCmd
  .command('set <key> <value>')
  .description('Set configuration value (http|https|both|no-proxy)')
  .action((key, value) => {
    handleConfig('set', key, value);
  });

configCmd
  .command('add <key> <value>')
  .description('Add item to NO_PROXY list')
  .action((key, value) => {
    handleConfig('add', key, value);
  });

configCmd
  .command('rm <key> <value>')
  .alias('remove')
  .description('Remove item from NO_PROXY list')
  .action((key, value) => {
    handleConfig('rm', key, value);
  });

configCmd
  .command('reset')
  .description('Reset configuration to defaults')
  .action(() => {
    handleConfig('reset');
  });

// pvm install
program
  .command('install')
  .description('Install shell integration (auto-enable/disable proxy)')
  .action(() => {
    handleInstall();
  });

// pvm uninstall
program
  .command('uninstall')
  .description('Uninstall shell integration')
  .action(() => {
    handleUninstall();
  });

// Default action (no command)
program.action(() => {
  const status = getProxyStatus();
  
  if (status.isEnabled) {
    console.log(chalk.green(`✓ Proxy is ENABLED`));
    console.log(chalk.dim(`  ${status.env.http_proxy || status.env.HTTP_PROXY}`));
  } else {
    console.log(chalk.red('✗ Proxy is DISABLED'));
  }
  
  console.log();
  console.log(chalk.dim('Run "pvm --help" for usage information'));
});

program.parse();
