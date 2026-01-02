# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

- Please do not report security vulnerabilities through public GitHub issues.
- Please email **security@bekaa.eu** (or your designated contact).
- We will acknowledge your report within 48 hours.

## SLA for Vulnerability Remediation

Reflecting our commit to security, we aim to patch vulnerabilities within these timeframes:

- **Critical**: 7 days
- **High**: 14 days
- **Medium**: 30 days
- **Low**: 90 days

## Security Measures

This project employs:

- **SAST**: Linter security rules.
- **SCA**: Dependency auditing (`npm audit`).
- **Secrets Scanning**: Automated checks for credentials.
- **SRI**: Validation of external resources.
- **Headers**: HSTS, CSP, and X-Frame-Options enforced.
