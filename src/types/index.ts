export interface ProxyConfig {
  http: string;
  https: string;
  noProxy: string;
}

export interface ProxyStatus {
  isEnabled: boolean;
  config: ProxyConfig;
  env: {
    http_proxy?: string;
    https_proxy?: string;
    HTTP_PROXY?: string;
    HTTPS_PROXY?: string;
    NO_PROXY?: string;
    no_proxy?: string;
  };
}
