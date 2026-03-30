<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md - AI Assistant Guidelines

## Project Overview

PVM (Proxy Version Manager) - A cross-platform CLI tool for managing proxy environment variables. Built with TypeScript, targeting Node.js 16+.

## Build Commands

```bash
# Build TypeScript to dist/
npm run build

# Watch mode for development
npm run dev

# Run the CLI
npm start
# or
node dist/index.js
```

## Lint Commands

```bash
# Lint TypeScript files
npm run lint

# Fix auto-fixable issues
npx eslint src --ext .ts --fix
```

## Format Commands

```bash
# Format all TypeScript files
npm run format

# Check formatting without writing
npx prettier --check "src/**/*.ts"
```

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2020
- Module: ESNext with Node.js resolution
- Strict mode enabled
- All strict flags: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`

### Formatting (Prettier)
- Semi-colons: required
- Trailing commas: all
- Single quotes: yes
- Print width: 100
- Tab width: 2 spaces
- Arrow function parentheses: always

### Imports
- Use ES modules (`"type": "module"` in package.json)
- Import order: external libraries first, then internal modules
- Use `.js` extension in imports (e.g., `import { foo } from './bar.js'`)
- Type imports: `import type { Foo } from './types.js'`

### Naming Conventions
- Functions: camelCase (e.g., `getProxyStatus`)
- Types/Interfaces: PascalCase (e.g., `ProxyConfig`)
- Constants: camelCase for local, UPPER_SNAKE_CASE for true constants
- Files: camelCase with `.ts` extension

### Error Handling
- Use early returns for guard clauses
- Validate inputs before processing
- Use `console.error()` for errors with chalk colors for visibility
- Exit with appropriate status codes when needed

### Type Safety
- Avoid `any` (ESLint warns on explicit any)
- Use explicit return types on exported functions
- Define interfaces for configuration objects
- Use union types for literal values (e.g., `'powershell' | 'bash' | 'unknown'`)

## Project Structure

```
src/
├── index.ts           # CLI entry point with command definitions
├── types/
│   └── index.ts       # TypeScript interfaces (ProxyConfig, ProxyStatus)
├── commands/
│   ├── on.ts          # Enable proxy command
│   ├── off.ts         # Disable proxy command
│   ├── list.ts        # Show status command
│   ├── set.ts         # Set proxy URL command
│   ├── config.ts      # Config management subcommands
│   └── install.ts     # Shell integration install/uninstall
├── core/
│   ├── proxy.ts       # Proxy detection and command generation
│   └── config.ts      # Configuration management
└── utils/
    └── no-proxy.ts    # NO_PROXY pattern utilities
```

## Dependencies

- **chalk**: Terminal styling (v5.x, ESM)
- **commander**: CLI framework (v12.x)
- **conf**: Configuration persistence (v13.x)

## ESLint Rules

- Extends: `eslint:recommended`, `@typescript-eslint/recommended`
- Parser: `@typescript-eslint/parser`
- Explicit module boundary types: off
- No explicit any: warn

## Notes

- This is a CLI tool that generates shell commands for users to eval
- Supports Bash/Zsh and PowerShell
- Configuration stored via `conf` library
- No test framework currently configured
- Always include `.js` extension in TypeScript imports for ESM compatibility
