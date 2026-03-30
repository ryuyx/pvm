import chalk from 'chalk';
import { getProxyStatus, detectShell } from '../core/proxy.js';
import { configManager } from '../core/config.js';

interface TestResult {
  success: boolean;
  latency?: number;
  error?: string;
  ip?: string;
  location?: string;
}

async function testDirectConnection(): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await fetch('https://httpbin.org/ip', {
      signal: AbortSignal.timeout(10000),
    });
    const latency = Date.now() - start;
    const data = await response.json() as { origin: string };
    return {
      success: true,
      latency,
      ip: data.origin,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testProxyConnection(proxyUrl: string): Promise<TestResult> {
  const start = Date.now();
  try {
    const url = new URL(proxyUrl);
    const proxyHost = url.hostname;
    const proxyPort = parseInt(url.port, 10) || (url.protocol === 'https:' ? 443 : 80);

    // 首先测试代理端口是否可连接
    const isPortOpen = await testPortConnection(proxyHost, proxyPort, 5000);
    
    if (!isPortOpen) {
      return {
        success: false,
        error: `Cannot connect to proxy at ${proxyHost}:${proxyPort}`,
      };
    }

    const portLatency = Date.now() - start;

    // 如果直接测试代理 HTTP 请求成功，则返回成功
    try {
      const response = await fetch('https://httpbin.org/ip', {
        signal: AbortSignal.timeout(10000),
      });
      const totalLatency = Date.now() - start;
      const data = await response.json() as { origin: string };
      
      return {
        success: true,
        latency: totalLatency,
        ip: data.origin,
      };
    } catch {
      // 如果 fetch 失败，但至少端口是通的
      return {
        success: true,
        latency: portLatency,
        ip: 'Unknown (proxy may require authentication)',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testPortConnection(host: string, port: number, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    import('net').then(({ createConnection }) => {
      const socket = createConnection(port, host);
      
      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
    }).catch(() => {
      resolve(false);
    });
  });
}

async function getIpInfo(ip: string): Promise<{ location?: string; org?: string }> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json() as { 
      city?: string; 
      region?: string; 
      country_name?: string;
      org?: string;
    };
    
    if (data.city && data.country_name) {
      return {
        location: `${data.city}, ${data.country_name}`,
        org: data.org,
      };
    }
    return {};
  } catch {
    return {};
  }
}

export async function handleTest(): Promise<void> {
  const status = getProxyStatus();
  const shell = detectShell();

  console.log(chalk.bold('🧪 Testing proxy configuration...\n'));

  // 显示当前配置
  console.log(chalk.blue('Current Configuration:'));
  console.log(`  HTTP Proxy:  ${chalk.cyan(status.config.http || '<not set>')}`);
  console.log(`  HTTPS Proxy: ${chalk.cyan(status.config.https || '<not set>')}`);
  console.log(`  Status:      ${status.isEnabled ? chalk.green('✓ ENABLED') : chalk.red('✗ DISABLED')}`);
  console.log(`  Shell:       ${chalk.cyan(shell === 'powershell' ? 'PowerShell' : shell === 'bash' ? 'Bash/Zsh' : 'Unknown')}`);
  console.log();

  // 如果没有启用代理，先提醒用户
  if (!status.isEnabled) {
    console.log(chalk.yellow('⚠️  Proxy is currently disabled.'));
    console.log(chalk.dim('   Run "pvm on" to enable proxy first, or test with saved configuration.\n'));
  }

  // 测试直接连接（无代理）
  console.log(chalk.blue('Testing direct connection (no proxy)...'));
  const directResult = await testDirectConnection();
  
  if (directResult.success) {
    console.log(`  ${chalk.green('✓')} Connected directly`);
    console.log(`    Latency: ${chalk.cyan(`${directResult.latency}ms`)}`);
    if (directResult.ip) {
      console.log(`    IP: ${chalk.cyan(directResult.ip)}`);
      const info = await getIpInfo(directResult.ip);
      if (info.location) {
        console.log(`    Location: ${chalk.cyan(info.location)}`);
      }
      if (info.org) {
        console.log(`    ISP: ${chalk.cyan(info.org)}`);
      }
    }
  } else {
    console.log(`  ${chalk.red('✗')} Direct connection failed: ${chalk.dim(directResult.error)}`);
  }
  console.log();

  // 测试代理连接
  const proxyUrl = status.config.https || status.config.http;
  if (proxyUrl) {
    console.log(chalk.blue(`Testing proxy connection (${proxyUrl})...`));
    const proxyResult = await testProxyConnection(proxyUrl);
    
    if (proxyResult.success) {
      console.log(`  ${chalk.green('✓')} Proxy is reachable`);
      if (proxyResult.latency) {
        console.log(`    Latency: ${chalk.cyan(`${proxyResult.latency}ms`)}`);
        
        // 与直连对比
        if (directResult.success && directResult.latency) {
          const diff = proxyResult.latency - directResult.latency;
          if (diff > 0) {
            console.log(`    Overhead: ${chalk.yellow(`+${diff}ms`)} compared to direct`);
          } else {
            console.log(`    Overhead: ${chalk.green(`${diff}ms`)} (faster than direct!)`);
          }
        }
      }
      
      if (proxyResult.ip && proxyResult.ip !== directResult.ip) {
        console.log(`    Exit IP: ${chalk.cyan(proxyResult.ip)}`);
        const info = await getIpInfo(proxyResult.ip);
        if (info.location) {
          console.log(`    Exit Location: ${chalk.cyan(info.location)}`);
        }
        if (info.org) {
          console.log(`    Exit ISP: ${chalk.cyan(info.org)}`);
        }
        
        if (directResult.ip && proxyResult.ip !== directResult.ip) {
          console.log(`    ${chalk.green('✓')} IP successfully changed!`);
        }
      }
    } else {
      console.log(`  ${chalk.red('✗')} Proxy connection failed: ${chalk.dim(proxyResult.error)}`);
      console.log();
      console.log(chalk.yellow('Troubleshooting:'));
      console.log('  1. Check if the proxy URL is correct');
      console.log('  2. Verify the proxy is running on the specified port');
      console.log('  3. Check if authentication is required');
      console.log('  4. Ensure firewall is not blocking the connection');
    }
  } else {
    console.log(chalk.yellow('⚠️  No proxy URL configured.'));
    console.log(chalk.dim('   Run "pvm set <url>" to configure a proxy.\n'));
  }

  console.log();
  console.log(chalk.dim('Config file: ') + configManager.getConfigPath());
}
