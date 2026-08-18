# Security Policy

## Supported version

Security fixes are applied to the latest commit on the default branch.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub Security Advisories instead of a public issue. Include the affected version, reproduction steps, and the expected impact. Do not include live credentials in the report.

## Browser API credentials

This repository builds a browser-only application. Values read from Vite's `VITE_` environment variables are included in the JavaScript sent to users and therefore are not secrets.

- Use only provider credentials that you accept will be public and copyable.
- Apply every restriction the provider supports. Some Web Service keys cannot be protected by browser-domain allowlists, so quotas and billing limits only reduce impact; they do not make the key secret.
- Never place server credentials, private tokens, signing keys, or unrestricted API keys in `.env.local` or any `VITE_` variable.
- Put operations that require private credentials behind a server-side API.
- Rotate private credentials, unrestricted credentials, and legacy credentials that were unintentionally exposed. A deliberately public client key appearing in a normal browser build is expected, but it still requires provider-side restrictions and monitoring.

Copy `.env.example` to `.env.local` for local development. The real file is ignored by Git.

## Historical exposure

Older revisions of this project contained browser API credentials and IDE deployment metadata. Removing them from the current tree does not remove them from existing clones, release archives, or Git history. Treat those values as exposed and rotate or revoke them in the relevant provider consoles.
