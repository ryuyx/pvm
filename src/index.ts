#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { handleOn } from './commands/on.js';
import { handleOff } from './commands/off.js';
import { handleList } from './commands/list.js';
import { handleSet } from './commands/set.js';
import { handleConfig } from './commands/config.js';
import { handleInit } from './commands/init.js';
import { handleClean } from './commands/clean.js';
import { handleTest } from './commands/test.js';
import { getProxyStatus } from './core/proxy.js';
import { configManager } from './core/config.js';
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
  .action(async () => {
    await handleOn();
  });

// pvm off
program
  .command('off')
  .description('Disable proxy (displays commands to run)')
  .action(async () => {
    await handleOff();
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
const configCmd = program.command('config').description('Manage proxy configuration');

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

// pvm init
program
  .command('init')
  .description('First-time setup: configure proxy and install shell integration')
  .action(async () => {
    await handleInit();
  });

// pvm clean
program
  .command('clean')
  .description('Remove shell integration and optionally reset configuration')
  .action(async () => {
    await handleClean();
  });

// pvm test
program
  .command('test')
  .alias('doctor')
  .description('Test proxy connectivity and display IP information')
  .action(async () => {
    await handleTest();
  });

// Default action (no command)
program.action(() => {
  const status = getProxyStatus();
  const config = configManager.getConfig();
  const isDefault = configManager.isDefaultConfig();

  console.log(chalk.blue('Proxy Status'));
  console.log(`  Status:    ${status.isEnabled ? chalk.green('ENABLED') : chalk.red('DISABLED')}`);

  if (!isDefault) {
    console.log(`  HTTP:      ${chalk.cyan(config.http)}`);
    console.log(`  HTTPS:     ${chalk.cyan(config.https)}`);
    console.log(`  NO_PROXY:  ${chalk.cyan(config.noProxy || '<not set>')}`);
    console.log(`  Config:    ${chalk.dim(configManager.getConfigPath())}`);
  }

  if (isDefault) {
    console.log();
    console.log(chalk.dim('Quick Start:'));
    console.log(chalk.dim('  pvm init\t\tFirst-time setup'));
    console.log(chalk.dim('  pvm set <url>\t\tSet your proxy address'));
    console.log(chalk.dim('  pvm on\t\tEnable proxy'));
  }

  console.log();
  console.log(chalk.dim('Run "pvm --help" for usage, "pvm list" for detailed view'));
});

program.parse();
