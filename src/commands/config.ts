import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { addToNoProxyList, removeFromNoProxyList } from '../utils/no-proxy.js';
import { handleList } from './list.js';

export function handleConfig(
  action: string,
  key?: string,
  value?: string,
) {
  switch (action) {
    case 'show':
      handleList();
      break;

    case 'set':
      if (!key) {
        console.log(chalk.red('Error: Missing key'));
        printConfigUsage();
        return;
      }

      switch (key) {
        case 'http':
          if (!value) {
            console.log(chalk.red('Error: Missing URL for http'));
            return;
          }
          configManager.setHttp(value);
          console.log(chalk.green(`[proxy] Set HTTP to: ${value}`));
          break;

        case 'https':
          if (!value) {
            console.log(chalk.red('Error: Missing URL for https'));
            return;
          }
          configManager.setHttps(value);
          console.log(chalk.green(`[proxy] Set HTTPS to: ${value}`));
          break;

        case 'both':
          if (!value) {
            console.log(chalk.red('Error: Missing URL for both'));
            return;
          }
          configManager.setBoth(value);
          console.log(chalk.green(`[proxy] Set both HTTP and HTTPS to: ${value}`));
          break;

        case 'no-proxy':
        case 'no_proxy':
          configManager.setNoProxy(value || '');
          console.log(chalk.green(`[proxy] Set NO_PROXY to: ${value || '<empty>'}`));
          break;

        default:
          console.log(chalk.red(`Error: Unknown config key: ${key}`));
          printConfigUsage();
      }
      break;

    case 'add':
      if (key !== 'no-proxy' && key !== 'no_proxy') {
        console.log(chalk.red('Error: Only "no-proxy" can be added'));
        return;
      }
      if (!value) {
        console.log(chalk.red('Error: Missing item to add'));
        return;
      }
      const currentList = configManager.getConfig().noProxy;
      const newList = addToNoProxyList(currentList, value);
      configManager.setNoProxy(newList);
      console.log(chalk.green(`[proxy] Added "${value}" to NO_PROXY`));
      console.log(chalk.dim(`NO_PROXY: ${newList || '<empty>'}`));
      break;

    case 'rm':
    case 'remove':
    case 'del':
      if (key !== 'no-proxy' && key !== 'no_proxy') {
        console.log(chalk.red('Error: Only "no-proxy" can be removed'));
        return;
      }
      if (!value) {
        console.log(chalk.red('Error: Missing item to remove'));
        return;
      }
      const currentListRm = configManager.getConfig().noProxy;
      const newListRm = removeFromNoProxyList(currentListRm, value);
      configManager.setNoProxy(newListRm);
      console.log(chalk.green(`[proxy] Removed "${value}" from NO_PROXY`));
      console.log(chalk.dim(`NO_PROXY: ${newListRm || '<empty>'}`));
      break;

    case 'reset':
      configManager.reset();
      console.log(chalk.green('[proxy] Configuration reset to defaults'));
      console.log(chalk.dim('  HTTP: http://127.0.0.1:20170'));
      console.log(chalk.dim('  HTTPS: http://127.0.0.1:20170'));
      console.log(chalk.dim('  NO_PROXY: <empty>'));
      break;

    default:
      console.log(chalk.red(`Error: Unknown config action: ${action}`));
      printConfigUsage();
  }
}

function printConfigUsage() {
  console.log();
  console.log('Usage:');
  console.log('  proxy config show');
  console.log('  proxy config set <http|https|both|no-proxy> <value>');
  console.log('  proxy config add no-proxy <item>');
  console.log('  proxy config rm no-proxy <item>');
  console.log('  proxy config reset');
}
