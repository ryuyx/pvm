import readline from 'readline';
import chalk from 'chalk';
import {
  generateEnableCommands,
  generateEnableCommandsPowerShell,
  detectShell,
  detectShellWithConfig,
  isShellIntegrationInstalled,
  installShellIntegration,
} from '../core/proxy.js';

const SHELL_INTEGRATION_TIP =
  "Tip: Run 'pvm init' to set up shell integration for automatic proxy management.";

function promptInstall(): Promise<boolean> {
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

export async function handleOn() {
  const detected = detectShellWithConfig();
  if (detected && !isShellIntegrationInstalled(detected.configFile)) {
    if (process.stdin.isTTY) {
      const shouldInstall = await promptInstall();
      if (shouldInstall) {
        installShellIntegration(detected);
        console.log(chalk.green('✓ Shell integration installed!'));
        console.log();
        console.log(chalk.green('[proxy] Enabling proxy...'));
        console.log();
        // Fall through to print the enable commands
      }
    } else {
      console.log(chalk.dim(SHELL_INTEGRATION_TIP));
      console.log();
    }
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
