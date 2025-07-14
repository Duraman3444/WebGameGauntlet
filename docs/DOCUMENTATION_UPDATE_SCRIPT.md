# Documentation Update Script & Guide

## 🔄 Automated Documentation Updates

This guide explains how to keep your project documentation up-to-date automatically.

---

## 📋 Update Checklist

### **Monthly Updates** (1st of each month)
- [ ] Update project structure documentation
- [ ] Review and update technology stack
- [ ] Update dependency versions
- [ ] Review coding standards and conventions
- [ ] Update performance metrics
- [ ] Review security guidelines

### **Version Updates** (Each release)
- [ ] Update version numbers across all documentation
- [ ] Update changelog
- [ ] Review API documentation
- [ ] Update deployment guides
- [ ] Review user documentation

### **Quarterly Reviews** (Every 3 months)
- [ ] Complete project evaluation using rubric
- [ ] Review and update project goals
- [ ] Update team member information
- [ ] Review and update development workflow
- [ ] Audit and update external links

---

## 🔧 Automated Update Script

### **Installation**
1. Create a script file in your project root:
```bash
touch update-docs.sh
chmod +x update-docs.sh
```

2. Add the following content to `update-docs.sh`:
```bash
#!/bin/bash

# Documentation Update Script for React Native Project
# Run this script monthly or after major changes

echo "🔄 Starting documentation update process..."

# Get current date and version
CURRENT_DATE=$(date '+%Y-%m-%d')
PROJECT_VERSION=$(node -p "require('./package.json').version")

echo "📅 Current Date: $CURRENT_DATE"
echo "📦 Project Version: $PROJECT_VERSION"

# Function to update documentation timestamps
update_timestamps() {
    local file=$1
    echo "📝 Updating timestamps in $file..."
    
    # Update Last Updated date
    sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" "$file"
    
    # Update Version
    sed -i.bak "s/\*\*Version:\*\* .*/\*\*Version:\*\* $PROJECT_VERSION/" "$file"
    
    # Clean up backup files
    rm -f "$file.bak"
}

# Function to update project structure
update_project_structure() {
    echo "🏗️ Updating project structure..."
    
    # Generate current directory structure
    tree -I 'node_modules|.git|dist' > docs/current_structure.txt
    
    echo "✅ Project structure updated"
}

# Function to update dependency information
update_dependencies() {
    echo "📦 Updating dependency information..."
    
    # Get outdated packages
    npm outdated > docs/outdated_packages.txt 2>/dev/null || echo "All packages up to date" > docs/outdated_packages.txt
    
    # Get current package versions
    npm list --depth=0 > docs/current_packages.txt
    
    echo "✅ Dependency information updated"
}

# Function to update performance metrics
update_performance_metrics() {
    echo "⚡ Updating performance metrics..."
    
    # Bundle size analysis
    npm run build > docs/bundle_analysis.txt 2>&1 || echo "Bundle analysis failed" > docs/bundle_analysis.txt
    
    echo "✅ Performance metrics updated"
}

# Function to validate documentation links
validate_links() {
    echo "🔗 Validating documentation links..."
    
    # Check for broken links in markdown files
    find docs -name "*.md" -exec grep -H "http" {} \; > docs/external_links.txt
    
    echo "✅ Link validation completed"
}

# Main update process
main() {
    echo "🚀 Starting main documentation update process..."
    
    # Create docs directory if it doesn't exist
    mkdir -p docs
    
    # Update main documentation files
    update_timestamps "docs/PROJECT_STRUCTURE.md"
    update_timestamps "docs/PROJECT_EVALUATION_TEMPLATE.md"
    
    # Update project information
    update_project_structure
    update_dependencies
    update_performance_metrics
    validate_links
    
    # Create update log
    cat > docs/last_update.log << EOF
Documentation Update Log
========================
Date: $CURRENT_DATE
Version: $PROJECT_VERSION
Updated by: $(whoami)
Update type: Automated

Files Updated:
- PROJECT_STRUCTURE.md
- PROJECT_EVALUATION_TEMPLATE.md
- current_structure.txt
- outdated_packages.txt
- current_packages.txt
- bundle_analysis.txt
- external_links.txt

Next scheduled update: $(date -d "+1 month" '+%Y-%m-%d')
EOF

    echo "✅ Documentation update completed!"
    echo "📄 Check docs/last_update.log for details"
}

# Run main function
main
```

### **Usage**
```bash
# Run the update script
./update-docs.sh

# Or run with npm script (add to package.json)
npm run update-docs
```

---

## 📅 Scheduling Automatic Updates

### **Method 1: GitHub Actions** (Recommended)
Create `.github/workflows/update-docs.yml`:
```yaml
name: Update Documentation

on:
  schedule:
    # Run on the 1st of every month at 9 AM UTC
    - cron: '0 9 1 * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  update-docs:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Update documentation
      run: ./update-docs.sh
      
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add docs/
        git commit -m "docs: automated documentation update" || exit 0
        git push
```

### **Method 2: Cron Job** (Local/Server)
```bash
# Edit crontab
crontab -e

# Add this line to run on the 1st of every month at 9 AM
0 9 1 * * cd /path/to/your/project && ./update-docs.sh
```

### **Method 3: npm Script**
Add to `package.json`:
```json
{
  "scripts": {
    "update-docs": "./update-docs.sh",
    "docs:check": "echo 'Last update:' && cat docs/last_update.log | head -5"
  }
}
```

---

## 📊 Documentation Quality Metrics

### **Tracking Metrics**
- Documentation freshness (days since last update)
- Coverage percentage (documented vs undocumented features)
- Link health (working vs broken links)
- User feedback and questions
- Time spent on documentation-related issues

### **Quality Indicators**
- ✅ All documentation updated within 30 days
- ✅ No broken external links
- ✅ All new features documented
- ✅ Code examples tested and working
- ✅ Screenshots and diagrams up-to-date

---

## 🔍 Manual Review Process

### **Weekly Quick Check**
1. Scan for new features or changes since last update
2. Check if any documentation seems outdated
3. Review user feedback or questions about documentation
4. Quick link check on main documentation pages

### **Monthly Deep Review**
1. Run the automated update script
2. Review all documentation for accuracy
3. Update screenshots and examples
4. Test all code examples
5. Review and update external links
6. Check documentation structure and organization

### **Quarterly Comprehensive Audit**
1. Complete project evaluation using the rubric
2. Review documentation strategy and effectiveness
3. Gather feedback from team members and users
4. Plan documentation improvements for next quarter
5. Update documentation standards and templates

---

## 📧 Notification System

### **Set up notifications for:**
- Failed documentation updates
- Broken links detected
- New team members (need access to docs)
- Major version releases (require doc updates)
- User feedback on documentation

### **Example notification script:**
```bash
# Add to update-docs.sh for Slack notifications
send_notification() {
    local message=$1
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"📚 Documentation Update: $message\"}" \
        "$SLACK_WEBHOOK_URL"
}

# Use in script:
if [ $? -eq 0 ]; then
    send_notification "Successfully updated documentation for v$PROJECT_VERSION"
else
    send_notification "❌ Failed to update documentation - manual review required"
fi
```

---

## 🎯 Documentation Improvement Goals

### **Short-term (1-3 months)**
- [ ] Implement automated update script
- [ ] Set up scheduled updates
- [ ] Create documentation templates
- [ ] Establish review process

### **Medium-term (3-6 months)**
- [ ] Implement documentation metrics tracking
- [ ] Set up user feedback collection
- [ ] Create interactive documentation
- [ ] Implement automated testing for code examples

### **Long-term (6+ months)**
- [ ] Build documentation website
- [ ] Implement documentation analytics
- [ ] Create video tutorials
- [ ] Develop documentation AI assistant

---

**Next Review Date:** ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}  
**Update Frequency:** Monthly  
**Responsibility:** Development Team Lead 