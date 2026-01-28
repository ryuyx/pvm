import Conf from 'conf';
import path from 'path';
import os from 'os';
import type { ProxyConfig } from '../types/index.js';

const DEFAULT_PROXY_URL = 'http://127.0.0.1:20170';

interface ConfigSchema {
  http: string;
  https: string;
  noProxy: string;
}

class ConfigManager {
  private config: Conf<ConfigSchema>;

  constructor() {
    this.config = new Conf<ConfigSchema>({
      cwd: path.join(os.homedir(), '.pvm'),
      configName: 'config',
      defaults: {
        http: DEFAULT_PROXY_URL,
        https: DEFAULT_PROXY_URL,
        noProxy: '',
      },
    });
  }

  getConfig(): ProxyConfig {
    return {
      http: this.config.get('http'),
      https: this.config.get('https'),
      noProxy: this.config.get('noProxy'),
    };
  }

  setHttp(url: string): void {
    this.config.set('http', url);
  }

  setHttps(url: string): void {
    this.config.set('https', url);
  }

  setBoth(url: string): void {
    this.config.set('http', url);
    this.config.set('https', url);
  }

  setNoProxy(list: string): void {
    this.config.set('noProxy', list);
  }

  reset(): void {
    this.config.set('http', DEFAULT_PROXY_URL);
    this.config.set('https', DEFAULT_PROXY_URL);
    this.config.set('noProxy', '');
  }

  getConfigPath(): string {
    return this.config.path;
  }
}

export const configManager = new ConfigManager();
