# Project Context

## Purpose
A cross-platform CLI tool for managing proxy settings via environment variables. Provides simple commands to enable/disable proxies and manage NO_PROXY lists across Windows, macOS, and Linux.

## Tech Stack
- **TypeScript** - Type-safe development
- **Commander.js** - CLI framework for command parsing
- **conf** - Cross-platform configuration storage
- **chalk** - Terminal output styling
- **Node.js >= 16** - Runtime environment

## Project Conventions

### Code Style
- **Language**: TypeScript with strict mode enabled
- **Formatting**: Prettier with 2-space indentation
- **Naming**: 
  - camelCase for variables and functions
  - PascalCase for classes and types
  - kebab-case for file names
- **Linting**: ESLint with TypeScript recommended rules

### Architecture Patterns
- **Modular Design**: Separate concerns into commands/, core/, utils/
- **Configuration Layer**: Centralized config management via conf library
- **Cross-platform Compatibility**: OS-specific logic abstracted in core modules
- **Immutable Config**: All config changes create new objects

### Testing Strategy
- Unit tests for core logic (config, no-proxy utilities)
- Integration tests for CLI commands
- Manual testing on all three platforms (Windows/macOS/Linux)

### Git Workflow
- **Main Branch**: Production-ready code
- **Feature Branches**: feature/description
- **Commit Convention**: Conventional Commits (feat:, fix:, docs:, etc.)

## Domain Context
- **Proxy Environment Variables**: HTTP_PROXY, HTTPS_PROXY, NO_PROXY (and lowercase variants)
- **Shell Integration Challenge**: Node.js CLI runs in subprocess, cannot directly modify parent shell environment
- **Solution**: Provide shell init scripts that users source in their .bashrc/.zshrc

## Important Constraints
- Must work without admin/sudo privileges (unless using system-level settings)
- Cannot directly modify parent shell environment from Node.js
- Configuration must persist across sessions
- NO_PROXY list must support standard formats (comma-separated domains/IPs)

## External Dependencies
- npm registry for distribution
- User's shell environment (.bashrc, .zshrc, PowerShell profile)
