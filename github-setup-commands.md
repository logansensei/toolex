# GitHub Repository Setup Commands

## Step 1: Initialize Git Repository
```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Advanced Security Recon Tool with modern pentesting features"
```

## Step 2: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository name: `security-recon-tool`
4. Description: `Advanced web security reconnaissance platform with modern pentesting features`
5. Set to Public or Private (your choice)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

## Step 3: Connect Local Repository to GitHub
```bash
# Add remote origin (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/security-recon-tool.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Create Additional Branches
```bash
# Create development branch
git checkout -b development
git push -u origin development

# Create feature branch
git checkout -b feature/enhanced-ui
git push -u origin feature/enhanced-ui

# Switch back to main
git checkout main
```

## Step 5: Create GitHub Actions Workflow
Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm install
        cd client && npm install
    
    - name: Run tests
      run: |
        npm test
        cd client && npm test
    
    - name: Build application
      run: |
        cd client && npm run build
    
    - name: Build Docker image
      run: docker build -t security-recon-tool .
```

## Step 6: Create Docker Hub Integration
```bash
# Create Docker Hub repository
# 1. Go to https://hub.docker.com
# 2. Create new repository: security-recon-tool
# 3. Set to Public

# Build and push Docker image
docker build -t YOUR_DOCKERHUB_USERNAME/security-recon-tool .
docker push YOUR_DOCKERHUB_USERNAME/security-recon-tool
```

## Step 7: Create Release
```bash
# Create a tag for the release
git tag -a v1.0.0 -m "Release version 1.0.0: Advanced Security Recon Tool"

# Push tags to GitHub
git push origin v1.0.0

# Create release on GitHub:
# 1. Go to your repository on GitHub
# 2. Click "Releases"
# 3. Click "Create a new release"
# 4. Choose tag: v1.0.0
# 5. Release title: "Security Recon Tool v1.0.0"
# 6. Description: Include features and installation instructions
# 7. Click "Publish release"
```

## Step 8: Setup GitHub Pages (Optional)
```bash
# Create docs branch for GitHub Pages
git checkout -b docs
git push -u origin docs

# Create documentation
mkdir docs
echo "# Security Recon Tool Documentation" > docs/README.md
git add docs/
git commit -m "Add documentation"
git push origin docs
```

## Step 9: Create Contributing Guidelines
Create `CONTRIBUTING.md`:
```markdown
# Contributing to Security Recon Tool

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Install client dependencies: `cd client && npm install`
4. Start development server: `npm run dev`
5. Start client: `npm run client`

## Code Style

- Use ESLint for JavaScript
- Use Prettier for code formatting
- Follow React best practices
- Write tests for new features

## Security

- Only test on authorized systems
- Follow responsible disclosure
- Report security issues privately
```

## Step 10: Create Issue Templates
Create `.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Ubuntu 20.04]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

Create `.github/ISSUE_TEMPLATE/feature_request.md`:
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: enhancement
assignees: ''

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Step 11: Create Pull Request Template
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Manual testing completed

## Security
- [ ] No sensitive data exposed
- [ ] Security best practices followed
- [ ] Authorization checks implemented

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left
- [ ] Error handling implemented
```

## Step 12: Setup Branch Protection Rules
1. Go to repository Settings
2. Click "Branches"
3. Add rule for "main" branch
4. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Restrict pushes to matching branches

## Step 13: Create Security Policy
Create `SECURITY.md`:
```markdown
# Security Policy

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability
Please report security vulnerabilities privately to security@yourdomain.com

## Security Features
- Rate limiting
- Input validation
- CORS protection
- JWT authentication
- Secure headers

## Responsible Disclosure
We follow responsible disclosure practices. Please:
1. Report vulnerabilities privately
2. Allow reasonable time for fixes
3. Do not disclose publicly until fixed
```

## Step 14: Final Push
```bash
# Add all new files
git add .

# Commit changes
git commit -m "Add GitHub workflows, templates, and documentation"

# Push to GitHub
git push origin main
```

## Step 15: Create GitHub Repository Badges
Add to README.md:
```markdown
![GitHub release](https://img.shields.io/github/release/YOUR_USERNAME/security-recon-tool)
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/security-recon-tool)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/security-recon-tool)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/security-recon-tool)
![Docker pulls](https://img.shields.io/docker/pulls/YOUR_DOCKERHUB_USERNAME/security-recon-tool)
![License](https://img.shields.io/github/license/YOUR_USERNAME/security-recon-tool)
```

## Repository Structure
Your final repository should have:
```
security-recon-tool/
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── client/
│   ├── public/
│   ├── src/
│   └── package.json
├── routes/
├── services/
├── models/
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── deploy.sh
└── ec2-deployment-commands.md
```

## Next Steps
1. Share the repository with your team
2. Set up monitoring and alerts
3. Create documentation website
4. Add more comprehensive tests
5. Implement CI/CD pipeline
6. Set up automated security scanning

Your Security Recon Tool is now ready for production deployment! 🚀
