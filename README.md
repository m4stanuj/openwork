# M4ST MCP Workspace

Portable MCP workspace and control-plane layer by Mast Anuj.

This repo keeps MCP configuration, reusable skills, assistant workspace conventions, and setup helpers in one place so AI coding tools can work with the same project context.

## What It Does

- Provides portable MCP workspace conventions.
- Keeps reusable skills and command patterns.
- Supports cross-editor assistant setup.
- Helps agents inspect project context before acting.
- Keeps public wording compact, credible, and M4ST-branded.

## Core Idea

```text
one workspace -> shared tools -> shared skills -> consistent assistant behavior
```

## M4ST Fit

This workspace supports:

- M4ST local AI operator
- M4ST model router
- M4ST prompt reuse cache
- browser automation workflows
- research and documentation workflows
- authorized defensive OSINT workflows

## Setup

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Keep secrets in local environment files only. Do not commit keys, tokens, passwords, private contact data, or machine-specific credentials.

## Safety Boundary

For browser auth, OTP, CAPTCHA, payment, legal approval, public posting, account recovery, or irreversible actions, pause for human handoff.

Security work must be owned, approved, defensive, scoped, and evidence-based.
