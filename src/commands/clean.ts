import readline from 'readline';
import chalk from 'chalk';
import {
  detectShellWithConfig,
  isShellIntegrationInstalled,
  removeShellIntegration,
} from '../core/proxy.js';
import { configManager } from '../core/config.js';

function prompt(question: string, defaultYes: boolean): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const hint = defaultYes ? 'Y/n' : 'y/N';
    rl.question(chalk.white(`${question} (${hint}) `), (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === '') {
        resolve(defaultYes);
      } else {
        resolve(trimmed === 'y');
      }
    });
  });
}

export async function handleClean() {
  console.log(chalk.blue.bold('🧹 pvm clean — Clean up\n'));

  const detected = detectShellWithConfig();
  const isInteractive = process.stdin.isTTY;

  // Step 1: Remove shell integration
  if (!detected) {
    console.log(chalk.yellow('⚠ Could not detect shell configuration file.'));
  } else {
    const installed = isShellIntegrationInstalled(detected.configFile);

    if (!installed) {
      console.log(chalk.yellow('⚠ Shell integration is not installed.'));
    } else if (isInteractive) {
      const confirmed = await prompt('Remove pvm shell integration?', true);
      if (!confirmed) {
        console.log(chalk.dim('Skipped.'));
      } else {
        removeShellIntegration(detected.configFile);
        console.log(chalk.green('✓ Shell integration removed!'));

        if (detected.shell === 'powershell') {
          console.log(chalk.cyan('  Run: . $PROFILE'));
        } else {
          console.log(chalk.cyan(`  Run: source ${detected.configFile}`));
        }
        console.log(chalk.dim('  Or restart your terminal.'));
      }
    } else {
      // Non-interactive: remove silently
      removeShellIntegration(detected.configFile);
      console.log(chalk.green('✓ Shell integration removed.'));
    }
  }

  console.log();

  // Step 2: Optionally reset config
  if (isInteractive) {
    const resetConfig = await prompt('Reset proxy configuration to defaults?', false);
    if (resetConfig) {
      configManager.reset();
      console.log(chalk.green('✓ Proxy configuration reset to defaults.'));
      console.log(chalk.dim('  HTTP: http://127.0.0.1:20170'));
      console.log(chalk.dim('  HTTPS: http://127.0.0.1:20170'));
    } else {
      console.log(chalk.dim('Proxy configuration kept.'));
    }
  } else {
    console.log(chalk.dim('Non-interactive mode — config not reset.'));
    console.log(chalk.dim('Run "pvm config reset" to clear proxy settings.'));
  }
}
