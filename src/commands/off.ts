import chalk from 'chalk';
import {
  generateDisableCommands,
  generateDisableCommandsPowerShell,
  detectShell,
  detectShellWithConfig,
  isShellIntegrationInstalled,
  installShellIntegration,
  promptInstall,
} from '../core/proxy.js';

const SHELL_INTEGRATION_TIP =
  "Tip: Run 'pvm init' to set up shell integration for automatic proxy management.";

export async function handleOff() {
  const detected = detectShellWithConfig();
  const isIntegrated = detected && isShellIntegrationInstalled(detected.configFile);

  if (detected && !isIntegrated) {
    if (process.stdin.isTTY) {
      const shouldInstall = await promptInstall();
      if (shouldInstall) {
        installShellIntegration(detected);
        console.log(chalk.green('✓ Shell integration installed!'));
        console.log();
        console.log(chalk.red('[proxy] Disabling proxy...'));
        console.log();
        return printProxyDisabled();
      }
    } else {
      console.log(chalk.dim(SHELL_INTEGRATION_TIP));
      console.log();
    }
  }

  if (isIntegrated) {
    console.log(chalk.red('[proxy] Disabling proxy...'));
    console.log();
    return printProxyDisabled();
  }

  const shell = detectShell();

  console.log(chalk.red('[proxy] Disabling proxy...'));
  console.log();

  if (shell === 'powershell') {
    console.log(chalk.yellow('PowerShell detected. Run the following commands:'));
    console.log();
    console.log(chalk.cyan(generateDisableCommandsPowerShell()));
  } else if (shell === 'bash') {
    console.log(chalk.yellow('Bash/Zsh detected. Run the following commands:'));
    console.log();
    console.log(chalk.cyan(generateDisableCommands()));
  } else {
    console.log(chalk.yellow('Unknown shell. Here are commands for both:'));
    console.log();
    console.log(chalk.blue('For Bash/Zsh:'));
    console.log(chalk.cyan(generateDisableCommands()));
    console.log();
    console.log(chalk.blue('For PowerShell:'));
    console.log(chalk.cyan(generateDisableCommandsPowerShell()));
  }

  console.log();
  console.log(chalk.dim('Tip: To automate this, add a shell function. See README for details.'));
}

function printProxyDisabled() {
  console.log(chalk.green('[proxy] Proxy disabled'));
  console.log();
  console.log(chalk.dim("Run 'pvm list' to see full configuration and environment variables."));
}
