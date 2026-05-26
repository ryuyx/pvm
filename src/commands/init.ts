import readline from 'readline';
import chalk from 'chalk';
import {
  detectShellWithConfig,
  isShellIntegrationInstalled,
  installShellIntegration,
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

function promptUrl(currentUrl: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      chalk.white(`Enter proxy URL ${chalk.dim(`(default: ${currentUrl})`)}: `),
      (answer) => {
        rl.close();
        resolve(answer.trim() || currentUrl);
      },
    );
  });
}

function showSummary(detected: { shell: string; configFile: string } | null, integrationJustInstalled: boolean) {
  const config = configManager.getConfig();

  console.log();
  console.log(chalk.blue('Configuration Summary:'));
  console.log(`  HTTP:      ${chalk.cyan(config.http)}`);
  console.log(`  HTTPS:     ${chalk.cyan(config.https)}`);
  console.log(`  NO_PROXY:  ${chalk.cyan(config.noProxy || '<not set>')}`);

  if (detected) {
    const installed = isShellIntegrationInstalled(detected.configFile);
    console.log(`  Shell:     ${chalk.cyan(detected.shell)}`);
    console.log(
      `  Integration: ${installed ? chalk.green('✓ installed') : chalk.red('✗ not installed')}`,
    );
  }

  if (integrationJustInstalled) {
    console.log();
    console.log('# ' + '='.repeat(50));
    console.log(chalk.bold.cyan('  Restart your terminal or source your shell config to apply.'));
    console.log('# ' + '='.repeat(50));
    console.log();
  }

  console.log();
  console.log(chalk.green('✓ pvm is ready. Run "pvm on" to enable proxy.'));
  console.log(chalk.dim('Config file:'), configManager.getConfigPath());
}

export async function handleInit() {
  console.log(chalk.blue.bold('🔧 pvm init — First-time setup\n'));

  const detected = detectShellWithConfig();
  const config = configManager.getConfig();
  const isDefault = configManager.isDefaultConfig();
  const isInteractive = process.stdin.isTTY;
  let integrationJustInstalled = false;

  if (!isInteractive) {
    console.log(chalk.dim('Non-interactive mode — showing current configuration.'));
    showSummary(detected, integrationJustInstalled);
    return;
  }

  // Step 1: Proxy URL
  if (isDefault) {
    console.log(chalk.yellow('No proxy URL configured yet.'));
    const url = await promptUrl(config.http);
    configManager.setBoth(url);
    console.log(chalk.green(`✓ Proxy set to: ${url}\n`));
  } else {
    console.log(chalk.green('✓ Proxy already configured.'));
    console.log(`  HTTP:  ${chalk.cyan(config.http)}`);
    console.log(`  HTTPS: ${chalk.cyan(config.https)}`);
    if (config.noProxy) {
      console.log(`  NO_PROXY: ${chalk.cyan(config.noProxy)}`);
    }
    console.log();
  }

  // Step 2: Shell integration
  if (!detected) {
    console.log(chalk.yellow('⚠ Could not detect shell configuration file.'));
    console.log(
      chalk.dim('  Shell integration requires a known shell (bash, zsh, or PowerShell).'),
    );
  } else {
    const alreadyInstalled = isShellIntegrationInstalled(detected.configFile);

    if (alreadyInstalled) {
      const reinstall = await prompt('Shell integration is already installed. Reinstall?', false);
      if (reinstall) {
        installShellIntegration(detected);
        integrationJustInstalled = true;
        console.log(chalk.green('✓ Shell integration reinstalled!'));
      } else {
        console.log(chalk.dim('Skipped.'));
      }
    } else {
      const shouldInstall = await prompt(
        'Install shell integration? This allows "pvm on/off" to set environment variables automatically.',
        true,
      );
      if (shouldInstall) {
        installShellIntegration(detected);
        integrationJustInstalled = true;
        console.log(chalk.green('✓ Shell integration installed!'));

        console.log();
        console.log(chalk.bold.cyan('  ═══════════════════════════════════════'));
        if (detected.shell === 'powershell') {
          console.log(chalk.bold.cyan('  Run: . $PROFILE'));
        } else {
          console.log(chalk.bold.cyan(`  Run: source ${detected.configFile}`));
        }
        console.log(chalk.bold.cyan('  ═══════════════════════════════════════'));
        console.log();
      } else {
        console.log(chalk.dim('Skipped. You can always set it up later.\n'));
      }
    }
  }

  showSummary(detected, integrationJustInstalled);
}
