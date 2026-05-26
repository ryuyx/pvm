import chalk from 'chalk';
import { getProxyStatus, detectShellWithConfig, isShellIntegrationInstalled } from '../core/proxy.js';
import { configManager } from '../core/config.js';

export function handleList() {
  const status = getProxyStatus();
  const config = status.config;

  console.log(chalk.blue('Full Configuration'));
  console.log();

  console.log(chalk.blue('Saved Configuration:'));
  console.log(`  HTTP:      ${chalk.cyan(config.http)}`);
  console.log(`  HTTPS:     ${chalk.cyan(config.https)}`);
  console.log(`  NO_PROXY:  ${chalk.cyan(config.noProxy || '<not set>')}`);
  console.log();

  console.log(chalk.blue('Environment Variables:'));
  console.log(`  http_proxy:    ${chalk.cyan(status.env.http_proxy || '<not set>')}`);
  console.log(`  https_proxy:   ${chalk.cyan(status.env.https_proxy || '<not set>')}`);
  console.log(`  HTTP_PROXY:    ${chalk.cyan(status.env.HTTP_PROXY || '<not set>')}`);
  console.log(`  HTTPS_PROXY:   ${chalk.cyan(status.env.HTTPS_PROXY || '<not set>')}`);
  console.log(`  NO_PROXY:      ${chalk.cyan(status.env.NO_PROXY || '<not set>')}`);
  console.log();

  const detected = detectShellWithConfig();
  const isIntegrated = detected && isShellIntegrationInstalled(detected.configFile);
  console.log(
    `  Shell Integration: ${isIntegrated ? chalk.green('✓ installed') : chalk.red('✗ not installed')}`,
  );
  console.log();

  const statusText = status.isEnabled
    ? chalk.green('✓ ENABLED')
    : chalk.red('✗ DISABLED');
  console.log(chalk.bold('Status: ') + statusText);
  console.log();

  console.log(chalk.dim(`Config file: ${configManager.getConfigPath()}`));
}
