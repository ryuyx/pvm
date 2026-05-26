import chalk from 'chalk';
import {
  generateEnableCommands,
  generateEnableCommandsPowerShell,
  detectShell,
  detectShellWithConfig,
  isShellIntegrationInstalled,
  installShellIntegration,
  promptInstall,
} from '../core/proxy.js';
import { configManager } from '../core/config.js';

const SHELL_INTEGRATION_TIP =
  "Tip: Run 'pvm init' to set up shell integration for automatic proxy management.";

export async function handleOn() {
  const detected = detectShellWithConfig();
  const isIntegrated = detected && isShellIntegrationInstalled(detected.configFile);

  if (detected && !isIntegrated) {
    if (process.stdin.isTTY) {
      const shouldInstall = await promptInstall();
      if (shouldInstall) {
        installShellIntegration(detected);
        console.log(chalk.green('✓ Shell integration installed!'));
        console.log();
        console.log(chalk.green('[proxy] Enabling proxy...'));
        console.log();
        return printProxyEnabled();
      }
    } else {
      console.log(chalk.dim(SHELL_INTEGRATION_TIP));
      console.log();
    }
  }

  if (isIntegrated) {
    console.log(chalk.green('[proxy] Enabling proxy...'));
    console.log();
    return printProxyEnabled();
  }

  const shell = detectShell();

  console.log(chalk.green('[proxy] Enabling proxy...'));
  console.log();

  if (shell === 'powershell') {
    console.log(chalk.yellow('PowerShell detected. Run the following commands:'));
    console.log();
    console.log(chalk.cyan(generateEnableCommandsPowerShell()));
  } else if (shell === 'bash') {
    console.log(chalk.yellow('Bash/Zsh detected. Run the following commands:'));
    console.log();
    console.log(chalk.cyan(generateEnableCommands()));
  } else {
    console.log(chalk.yellow('Unknown shell. Here are commands for both:'));
    console.log();
    console.log(chalk.blue('For Bash/Zsh:'));
    console.log(chalk.cyan(generateEnableCommands()));
    console.log();
    console.log(chalk.blue('For PowerShell:'));
    console.log(chalk.cyan(generateEnableCommandsPowerShell()));
  }

  console.log();
  console.log(chalk.dim('Tip: To automate this, add a shell function. See README for details.'));
}

function printProxyEnabled() {
  const config = configManager.getConfig();
  console.log(chalk.green('[proxy] Proxy enabled'));
  console.log(chalk.dim(`  ${config.http || config.https}`));
  console.log();
  console.log(chalk.dim("Run 'pvm list' to see full configuration and environment variables."));
}
