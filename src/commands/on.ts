import chalk from 'chalk';
import {
  generateEnableCommands,
  generateEnableCommandsPowerShell,
  detectShell,
} from '../core/proxy.js';

export function handleOn() {
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
