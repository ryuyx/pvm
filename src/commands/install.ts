import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';

const BASH_FUNCTION = `
# pvm - Proxy Manager shell integration
pvm() {
  if [ "$1" = "on" ]; then
    eval "$(command pvm on 2>/dev/null | grep -E '^(export|unset)')"
    echo "✓ Proxy enabled"
  elif [ "$1" = "off" ]; then
    eval "$(command pvm off 2>/dev/null | grep -E '^(export|unset)')"
    echo "✗ Proxy disabled"
  else
    command pvm "$@"
  fi
}
`;

const ZSH_FUNCTION = BASH_FUNCTION; // Same as Bash

const POWERSHELL_FUNCTION = `
# pvm - Proxy Manager shell integration
function pvm {
  if ($args[0] -eq "on") {
    $commands = & (Get-Command pvm -CommandType Application).Source on 2>$null | Select-String '^\\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✓ Proxy enabled" -ForegroundColor Green
  } elseif ($args[0] -eq "off") {
    $commands = & (Get-Command pvm -CommandType Application).Source off 2>$null | Select-String '^\\$env:|^Remove-Item'
    $commands | ForEach-Object { Invoke-Expression $_ }
    Write-Host "✗ Proxy disabled" -ForegroundColor Red
  } else {
    & (Get-Command pvm -CommandType Application).Source @args
  }
}
`;

function detectShell(): { shell: string; configFile: string } | null {
  const homeDir = os.homedir();
  
  // Check SHELL environment variable (Unix-like systems)
  const shellEnv = process.env.SHELL || '';
  
  if (shellEnv.includes('zsh')) {
    return { shell: 'zsh', configFile: path.join(homeDir, '.zshrc') };
  } else if (shellEnv.includes('bash')) {
    return { shell: 'bash', configFile: path.join(homeDir, '.bashrc') };
  } else if (os.platform() === 'win32') {
    // PowerShell on Windows
    try {
      const profilePath = execSync('powershell -NoProfile -Command "echo $PROFILE"', { encoding: 'utf-8' }).trim();
      return { shell: 'powershell', configFile: profilePath };
    } catch (error) {
      console.error(chalk.red('Failed to detect PowerShell profile path'));
      return null;
    }
  }
  
  // Default to bash if shell is not detected
  return { shell: 'bash', configFile: path.join(homeDir, '.bashrc') };
}

function getShellFunction(shell: string): string {
  switch (shell) {
    case 'zsh':
      return ZSH_FUNCTION;
    case 'bash':
      return BASH_FUNCTION;
    case 'powershell':
      return POWERSHELL_FUNCTION;
    default:
      return BASH_FUNCTION;
  }
}

function isAlreadyInstalled(configFile: string): boolean {
  if (!fs.existsSync(configFile)) {
    return false;
  }
  
  const content = fs.readFileSync(configFile, 'utf-8');
  return content.includes('# pvm - Proxy Manager shell integration');
}

export function handleInstall() {
  console.log(chalk.blue.bold('🔧 Installing pvm shell integration...\n'));
  
  const detected = detectShell();
  
  if (!detected) {
    console.error(chalk.red('✗ Could not detect shell type'));
    console.log(chalk.yellow('\nPlease manually add the shell function to your shell configuration file.'));
    console.log(chalk.cyan('\nSee documentation: https://github.com/ryuyx/pvm#shell-integration'));
    process.exit(1);
  }
  
  const { shell, configFile } = detected;
  
  console.log(chalk.gray(`Detected shell: ${shell}`));
  console.log(chalk.gray(`Config file: ${configFile}\n`));
  
  // Check if already installed
  if (isAlreadyInstalled(configFile)) {
    console.log(chalk.yellow('⚠ Shell integration is already installed!'));
    console.log(chalk.gray(`Found in: ${configFile}\n`));
    
    console.log(chalk.cyan('To reinstall, please remove the existing function first.'));
    return;
  }
  
  // Ensure config file directory exists (for PowerShell on Windows)
  const configDir = path.dirname(configFile);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Get the shell function
  const shellFunction = getShellFunction(shell);
  
  // Append to config file
  try {
    const separator = '\n' + '='.repeat(60) + '\n';
    const content = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf-8') : '';
    const newContent = content + separator + shellFunction;
    
    fs.writeFileSync(configFile, newContent, 'utf-8');
    
    console.log(chalk.green('✓ Shell integration installed successfully!\n'));
    console.log(chalk.cyan('To activate the changes, run:'));
    
    if (shell === 'powershell') {
      console.log(chalk.white(`  . $PROFILE`));
    } else {
      console.log(chalk.white(`  source ${configFile}`));
    }
    
    console.log(chalk.gray('\nOr restart your terminal.\n'));
    
    console.log(chalk.cyan('Now you can use:'));
    console.log(chalk.white('  pvm on   # Automatically enables proxy'));
    console.log(chalk.white('  pvm off  # Automatically disables proxy'));
    
  } catch (error) {
    console.error(chalk.red('✗ Failed to write to config file:'), error);
    process.exit(1);
  }
}

export function handleUninstall() {
  console.log(chalk.blue.bold('🔧 Uninstalling pvm shell integration...\n'));
  
  const detected = detectShell();
  
  if (!detected) {
    console.error(chalk.red('✗ Could not detect shell type'));
    process.exit(1);
  }
  
  const { shell, configFile } = detected;
  
  if (!fs.existsSync(configFile)) {
    console.log(chalk.yellow('⚠ Config file does not exist'));
    return;
  }
  
  const content = fs.readFileSync(configFile, 'utf-8');
  
  if (!isAlreadyInstalled(configFile)) {
    console.log(chalk.yellow('⚠ Shell integration is not installed'));
    return;
  }
  
  // Find the start and end of the pvm block
  const lines = content.split('\n');
  let startIndex = -1;
  let endIndex = -1;
  
  // Find start (look for separator before comment)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('# pvm - Proxy Manager shell integration')) {
      startIndex = i;
      
      // Look back for empty line before comment
      if (i > 0 && lines[i - 1].trim() === '') {
        startIndex = i - 1;
        // Look back for separator before empty line
        if (i > 1 && lines[i - 2].match(/^=+$/)) {
          startIndex = i - 2;
          // Look back for empty line before separator
          if (i > 2 && lines[i - 3].trim() === '') {
            startIndex = i - 3;
          }
        }
      }
      break;
    }
  }
  
  if (startIndex === -1) {
    console.log(chalk.yellow('⚠ Could not find pvm shell integration'));
    return;
  }
  
  // Find end (look for closing brace of pvm function)
  // For PowerShell: closing brace at same indentation level
  // For Bash/Zsh: closing brace at start of line
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // Match closing brace that's either at column 0 or has only whitespace before it
    if (line.match(/^}\s*$/) && i > startIndex) {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    console.log(chalk.yellow('⚠ Could not find end of pvm function'));
    return;
  }
  
  // Skip any trailing empty lines after the closing brace
  while (endIndex + 1 < lines.length && lines[endIndex + 1].trim() === '') {
    endIndex++;
  }
  
  // Remove the block
  const newLines = [
    ...lines.slice(0, startIndex),
    ...lines.slice(endIndex + 1)
  ];
  
  // Write back
  fs.writeFileSync(configFile, newLines.join('\n'), 'utf-8');
  
  console.log(chalk.green('✓ Shell integration uninstalled successfully!\n'));
  console.log(chalk.cyan('To apply changes, run:'));
  
  if (shell === 'powershell') {
    console.log(chalk.white(`  . $PROFILE`));
  } else {
    console.log(chalk.white(`  source ${configFile}`));
  }
  
  console.log(chalk.gray('\nOr restart your terminal.'));
}
