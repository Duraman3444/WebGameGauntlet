# [PROJECT_NAME] - Documentation Update Script

## Overview
This document describes the automated documentation update system for [PROJECT_NAME]. The system ensures documentation stays current with code changes and project evolution.

## Update Script (`update-docs.sh`)

### Purpose
The update script automates the process of:
- Analyzing project structure
- Generating dependency reports
- Updating documentation metadata
- Validating documentation links
- Creating update logs

### Usage
```bash
# Basic usage
./update-docs.sh

# With specific options
./update-docs.sh --force --verbose

# Check only (no updates)
./update-docs.sh --check-only
```

### Command Options
```bash
Options:
  -h, --help           Show this help message
  -f, --force          Force update even if no changes detected
  -v, --verbose        Show detailed output
  -c, --check-only     Check documentation health without updating
  -q, --quiet          Suppress output except errors
  --skip-links        Skip link validation
  --skip-deps         Skip dependency analysis
  --skip-structure    Skip structure analysis
```

## Automated Tasks

### 1. Project Structure Analysis
**File:** `docs/generated/project-analysis.md`

```bash
# Analyzes project structure
analyze_project_structure() {
  # Count files by type
  find src -name "*.ts" -o -name "*.tsx" | wc -l
  find src -name "*.js" -o -name "*.jsx" | wc -l
  
  # Directory structure
  tree src -I 'node_modules|dist|build'
  
  # Component analysis
  find src/components -name "*.tsx" -exec basename {} \; | sort
}
```

### 2. Dependency Analysis
**File:** `docs/generated/dependency-report.md`

```bash
# Analyzes package dependencies
analyze_dependencies() {
  # Production dependencies
  jq '.dependencies' package.json
  
  # Development dependencies
  jq '.devDependencies' package.json
  
  # Outdated packages
  [PACKAGE_MANAGER] outdated --json 2>/dev/null || true
}
```

### 3. Package Status Check
**File:** `docs/generated/package-status.md`

```bash
# Checks package health
check_package_status() {
  # Security audit
  [PACKAGE_MANAGER] audit --json || true
  
  # Bundle size analysis
  [PACKAGE_MANAGER] run build --analyze || true
  
  # Test coverage
  [PACKAGE_MANAGER] run test:coverage --silent || true
}
```

### 4. Link Validation
**File:** `docs/generated/link-validation.md`

```bash
# Validates documentation links
validate_links() {
  # Find all markdown files
  find docs -name "*.md" -type f
  
  # Extract links from markdown
  grep -r '\[.*\](' docs/ | grep -v 'generated/'
  
  # Check internal links
  check_internal_links
  
  # Check external links (optional)
  check_external_links
}
```

### 5. Update Logging
**File:** `docs/generated/update-log.md`

```bash
# Logs update activities
log_update() {
  echo "## Update Log Entry"
  echo "**Date:** $(date)"
  echo "**Version:** $(get_version)"
  echo "**Changes:** $changes_detected"
  echo "**Duration:** $update_duration"
}
```

## NPM Scripts Integration

### Package.json Scripts
```json
{
  "scripts": {
    "update-docs": "./update-docs.sh",
    "docs:check": "./update-docs.sh --check-only",
    "docs:stats": "./update-docs.sh --stats-only",
    "docs:links": "./update-docs.sh --links-only",
    "docs:force": "./update-docs.sh --force",
    "docs:watch": "nodemon --watch src --exec './update-docs.sh'"
  }
}
```

### Usage Examples
```bash
# Regular update
npm run update-docs

# Check documentation health
npm run docs:check

# Generate statistics only
npm run docs:stats

# Force update
npm run docs:force

# Watch for changes
npm run docs:watch
```

## Configuration

### Script Configuration
```bash
# update-docs.config.sh
PROJECT_NAME="[PROJECT_NAME]"
VERSION="[VERSION]"
DOCS_DIR="docs"
GENERATED_DIR="docs/generated"
SOURCE_DIR="src"

# Update frequency
UPDATE_FREQUENCY="daily"
NEXT_UPDATE_DATE=$(date -d "+1 day" +"%Y-%m-%d")

# Features
ENABLE_LINK_VALIDATION=true
ENABLE_DEPENDENCY_ANALYSIS=true
ENABLE_STRUCTURE_ANALYSIS=true
ENABLE_PACKAGE_STATUS=true

# External services
LINK_CHECKER_URL="[LINK_CHECKER_URL]"
DEPENDENCY_CHECKER_URL="[DEPENDENCY_CHECKER_URL]"
```

### Environment Variables
```bash
# Optional environment variables
export DOCS_UPDATE_FREQUENCY="daily"
export DOCS_LINK_CHECK_TIMEOUT="30"
export DOCS_SKIP_EXTERNAL_LINKS="false"
export DOCS_VERBOSE_OUTPUT="false"
```

## Generated Documentation

### File Structure
```
docs/generated/
├── project-analysis.md           # Project structure analysis
├── dependency-report.md          # Dependency information
├── package-status.md             # Package health status
├── link-validation.md            # Link validation results
├── update-log.md                 # Update history
├── statistics.md                 # Documentation statistics
└── health-check.md               # Overall health report
```

### Update Tracking
```markdown
## Update History

| Date | Version | Changes | Duration | Status |
|------|---------|---------|----------|---------|
| 2024-12-09 | 1.0.0 | Initial setup | 2.3s | ✅ |
| 2024-12-10 | 1.0.1 | Added components | 1.8s | ✅ |
| 2024-12-11 | 1.0.2 | Updated deps | 2.1s | ✅ |
```

## Automation Setup

### Cron Job (Linux/Mac)
```bash
# Add to crontab
crontab -e

# Run daily at 2 AM
0 2 * * * cd /path/to/[PROJECT_NAME] && ./update-docs.sh

# Run weekly on Sunday at 6 AM
0 6 * * 0 cd /path/to/[PROJECT_NAME] && ./update-docs.sh --force
```

### GitHub Actions
```yaml
name: Update Documentation

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '[NODE_VERSION]'
          
      - name: Install dependencies
        run: [PACKAGE_MANAGER] install
        
      - name: Update documentation
        run: ./update-docs.sh
        
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/generated/
          git commit -m "Update documentation [skip ci]" || exit 0
          git push
```

### CI/CD Integration
```yaml
# Add to existing CI/CD pipeline
steps:
  - name: Check Documentation
    run: npm run docs:check
    
  - name: Update Documentation
    run: npm run update-docs
    
  - name: Validate Links
    run: npm run docs:links
```

## Monitoring and Alerts

### Health Checks
```bash
# Check documentation health
check_docs_health() {
  local issues=0
  
  # Check for broken links
  if ! validate_links; then
    issues=$((issues + 1))
  fi
  
  # Check for outdated content
  if ! check_freshness; then
    issues=$((issues + 1))
  fi
  
  # Check for missing documentation
  if ! check_completeness; then
    issues=$((issues + 1))
  fi
  
  return $issues
}
```

### Alerting
```bash
# Send alert if issues found
if ! check_docs_health; then
  send_alert "Documentation health check failed"
fi

# Alert functions
send_alert() {
  local message="$1"
  
  # Email notification
  echo "$message" | mail -s "Documentation Alert" [ALERT_EMAIL]
  
  # Slack notification
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"'"$message"'"}' \
    [SLACK_WEBHOOK_URL]
}
```

## Troubleshooting

### Common Issues

#### 1. Script Permissions
```bash
# Fix permissions
chmod +x update-docs.sh

# Check permissions
ls -la update-docs.sh
```

#### 2. Missing Dependencies
```bash
# Install required tools
# Tree command
brew install tree  # macOS
apt-get install tree  # Ubuntu

# jq command
brew install jq  # macOS
apt-get install jq  # Ubuntu
```

#### 3. Link Validation Failures
```bash
# Skip external links
./update-docs.sh --skip-external-links

# Increase timeout
export DOCS_LINK_CHECK_TIMEOUT=60
```

#### 4. Large Project Performance
```bash
# Skip heavy operations
./update-docs.sh --skip-deps --skip-structure

# Use parallel processing
export DOCS_PARALLEL_PROCESSING=true
```

### Debug Mode
```bash
# Enable debug output
export DEBUG=true
./update-docs.sh

# Verbose logging
./update-docs.sh --verbose

# Check specific component
./update-docs.sh --component=links
```

## Customization

### Custom Analysis Functions
```bash
# Add custom analysis
analyze_custom_metrics() {
  echo "## Custom Metrics"
  
  # Performance metrics
  analyze_performance_metrics
  
  # Security metrics
  analyze_security_metrics
  
  # Quality metrics
  analyze_quality_metrics
}
```

### Custom Reports
```bash
# Generate custom report
generate_custom_report() {
  local report_file="docs/generated/custom-report.md"
  
  echo "# Custom Report" > "$report_file"
  echo "Generated on $(date)" >> "$report_file"
  
  # Add custom sections
  add_custom_sections >> "$report_file"
}
```

### Integration with External Tools
```bash
# Integration examples
integrate_external_tools() {
  # Code quality tools
  run_sonarqube_analysis
  
  # Security scanning
  run_security_scan
  
  # Performance monitoring
  run_performance_analysis
}
```

## Best Practices

### Script Maintenance
1. **Keep scripts simple and focused**
2. **Use error handling and logging**
3. **Make scripts idempotent**
4. **Version control configuration**
5. **Test scripts regularly**

### Documentation Updates
1. **Automate where possible**
2. **Keep generated content separate**
3. **Use consistent formatting**
4. **Include timestamps and versions**
5. **Monitor update frequency**

### Performance Optimization
1. **Use parallel processing**
2. **Cache expensive operations**
3. **Skip unnecessary checks**
4. **Optimize file operations**
5. **Monitor execution time**

## Resources

### Tools and Utilities
- **[TOOL_1]:** [DESCRIPTION]
- **[TOOL_2]:** [DESCRIPTION]
- **[TOOL_3]:** [DESCRIPTION]

### Documentation
- **Script Documentation:** [SCRIPT_DOCS_URL]
- **Automation Guide:** [AUTOMATION_GUIDE_URL]
- **Best Practices:** [BEST_PRACTICES_URL]

---

*Last Updated: [DATE]*
*Version: [VERSION]*
*Maintainer: [AUTHOR]* 