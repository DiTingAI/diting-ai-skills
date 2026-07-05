# Security Policy

## Supported Versions
We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅                 |
| < 1.0   | ❌                 |

## Reporting a Vulnerability

We take the security of Diting AI Skills seriously. If you believe you have found a security vulnerability, please follow these steps:

### 🔒 **Private Disclosure**
Please do **NOT** disclose security-related issues publicly. Instead, please email us at security@diting.cc with the following information:

1. **Subject**: `[SECURITY] Vulnerability Report - Diting AI Skills`
2. **Description**: Detailed description of the vulnerability
3. **Steps to Reproduce**: Clear steps to reproduce the issue
4. **Impact**: Potential impact of the vulnerability
5. **Suggested Fix**: If you have any suggestions for fixing the issue

### 📋 **What to Include in Your Report**
- Type of vulnerability (e.g., XSS, CSRF, SQL injection, etc.)
- Affected component or file
- Proof of concept or exploit code
- Suggested fix or mitigation
- Your contact information for follow-up questions

### 🕒 **Response Time**
We will acknowledge receipt of your report within **48 hours** and provide a detailed response within **7 days**.

### 🎯 **In-Scope Vulnerabilities**
- API security issues
- Authentication/authorization bypass
- Data exposure
- Command injection
- File upload vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Remote code execution (RCE)

### 🚫 **Out-of-Scope**
- Security issues in dependencies (please report to upstream)
- Theoretical vulnerabilities without proof of concept
- Social engineering attacks
- Physical security issues

## Security Best Practices

### API Key Security
```bash
# Store API key in environment variable (not in scripts)
export DITING_API_KEY=your_key_here

# Use .env file for local development
echo "DITING_API_KEY=your_key_here" > .env

# Never commit API keys to version control
echo ".env" >> .gitignore
```

### Network Security
- Always use HTTPS for API calls
- Validate SSL certificates
- Use secure connections when transmitting data

### Data Security
- Local files are processed securely
- Temporary files are cleaned up after use
- No sensitive data is stored locally

## Security Updates
We regularly update dependencies and address security issues. Please keep your installation up to date:

```bash
# Update to latest version
curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash
```

## Contact
- **Security Email**: security@diting.cc
- **General Support**: support@diting.cc
- **Website**: https://diting.cc