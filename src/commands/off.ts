import chalk from 'chalk';
import {
  generateDisableCommands,
  generateDisableCommandsPowerShell,
  detectShell,
} from '../core/proxy.js';

export function handleOff() {
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
