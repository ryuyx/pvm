
# pvm - Proxy Manager

Cross-platform CLI tool for managing proxy environment variables (HTTP_PROXY, HTTPS_PROXY, NO_PROXY). Node.js/TypeScript CLI distributed via npm.

## Build / Lint / Test

```bash
npm run build       # tsc — compiles src/ to dist/
npm run dev         # tsc --watch
npm run lint        # eslint src --ext .ts
npm run format      # prettier --write "src/**/*.ts"
npm start           # node dist/index.js
npm run prepublishOnly  # runs build before publish
```

**Lint/format extras:**

```bash
npx eslint src --ext .ts --fix   # Auto-fix lint issues
npx prettier --check "src/**/*.ts"  # Check formatting (CI)
```

**Publishing:** Tag push (`v*.*.*`) triggers GitHub Actions (`.github/workflows/publish.yml`) to build, publish to npm, and create a GitHub Release. Requires `NPM_TOKEN` repo secret.

There is no test framework configured. Before adding tests, choose one (e.g., vitest or jest) and install it first.

## Project Structure

```
src/
├── index.ts            # Entry point — Commander program setup
├── commands/           # One file per CLI command (on.ts, off.ts, list.ts, set.ts, config.ts, install.ts, test.ts)
├── core/               # Business logic (config.ts, proxy.ts)
├── types/              # TypeScript interfaces (index.ts)
└── utils/              # Pure utility functions (no-proxy.ts)
```

## Code Style Guidelines

### Imports

- Node builtins first (`fs`, `path`, `os`, `child_process`), then third-party (`chalk`, `commander`, `conf`), then local (`../core/`, `../utils/`, `../types/`)
- Use `import type { Foo }` for type-only imports
- Always use `.js` extension in local imports (ESM): `'../core/config.js'`
- JSON imports use `with { type: 'json' }` syntax: `import pkg from '../package.json' with { type: 'json' }`
- One import group per section, no blank lines between same-group imports

### Formatting (Prettier enforced)

- 2-space indent, single quotes, trailing commas (all), print width 100
- Semicolons required, arrow parens always

### Types

- Strict mode enabled in tsconfig
- Define shared interfaces in `src/types/index.ts`
- Use inline `interface` for module-internal types (e.g., `ConfigSchema` in core/config.ts)
- Minimize `any` — treat `@typescript-eslint/no-explicit-any` as warning
- Functions that can return null/undefined should reflect that in their return type

### Naming Conventions

- **Files**: kebab-case (`no-proxy.ts`, `proxy.ts`)
- **Variables & Functions**: camelCase (`handleOn`, `configManager`, `parseNoProxyList`)
- **Classes & Interfaces**: PascalCase (`ConfigManager`, `ProxyConfig`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants (`DEFAULT_PROXY_URL`)
- **Event handlers**: prefix with `handle` (`handleOn`, `handleConfig`, `handleList`)

### Error Handling

- Use `console.log(chalk.red('Error: ...'))` for user-facing errors (no exceptions for expected error paths)
- Use `process.exit(1)` only in the install/uninstall commands (for unrecoverable errors)
- Validate early: check required params at the top of handler functions and return early
- Catch errors from Node API calls (fs, execSync) and show user-friendly messages
- Do NOT throw exceptions for CLI input validation — print error + usage, then return

### Output Conventions

- Use `chalk` consistently for terminal styling:
  - `chalk.green('✓ ...')` for success messages
  - `chalk.red('✗ ...')` for errors
  - `chalk.dim('...')` for secondary info (tips, paths, config file locations)
  - `chalk.cyan('...')` for command output / values to display
  - `chalk.yellow('...')` for warnings / detected shell type
  - `chalk.blue('...')` for section headers
- Prefix CLI messages with `[proxy]` for log lines related to proxy operations
- End output with a blank line before tips/usage when helpful

### ESM & module

- `"type": "module"` in package.json
- All imports must include `.js` extension (even for .ts files)
- JSON imports use `with { type: 'json' }` syntax
- Target ES2020, module resolution "bundler"

### Patterns

- **Singleton**: Export a single instance (e.g., `export const configManager = new ConfigManager()`)
- **Pure functions**: Keep utils/ functions stateless and side-effect-free
- **One concern per file**: Each command handler in its own file under commands/
- **Shell detection**: `detectShell()` returns `'powershell' | 'bash' | 'unknown'`
- **Config**: Managed via `conf` library, stored at `~/.pvm/config.json`

### OpenSpec (spec-driven development)

This project uses OpenSpec for spec-driven development. See `@/openspec/AGENTS.md` for the full workflow. Key commands:

```bash
openspec list                    # List active changes
openspec list --specs            # List specifications
openspec validate --strict       # Validate all specs
```
