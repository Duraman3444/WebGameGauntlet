#!/bin/bash

# Documentation Template Initialization Script
# This script sets up a complete documentation template system for any project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR"
TARGET_DIR="$PROJECT_ROOT/docs"

# Template variables
TEMPLATE_VARS=(
    "PROJECT_NAME"
    "TECH_STACK"
    "PLATFORM"
    "TEAM_SIZE"
    "CONTACT_EMAIL"
    "REPOSITORY_URL"
    "DEPLOYMENT_URL"
    "API_BASE_URL"
    "DATABASE_TYPE"
    "HOSTING_PROVIDER"
    "BRAINLIFT_DOCUMENT_LINK"
    "BRAINLIFT_DESCRIPTION"
)

# Template files
TEMPLATE_FILES=(
    "DOCUMENTATION_TEMPLATE.md"
    "PROJECT_STRUCTURE_TEMPLATE.md"
    "PROJECT_EVALUATION_TEMPLATE.md"
    "LOGGING_GUIDE_TEMPLATE.md"
    "README_TEMPLATE.md"
    "DOCUMENTATION_UPDATE_SCRIPT_TEMPLATE.md"
    "RUBRIC_EVALUATION_TEMPLATE.md"
    "BRAINLIFT_EXAMPLE.md"
)

# Criteria template files
CRITERIA_TEMPLATE_FILES=(
    "criteria/USER_PERSONAS_TEMPLATE.md"
    "criteria/WIREFRAMES_UI_TEMPLATE.md"
    "criteria/MVP_FOCUS_TEMPLATE.md"
    "criteria/TECHNICAL_DOCUMENTATION_TEMPLATE.md"
    "criteria/INDUSTRY_CONTEXT_TEMPLATE.md"
    "criteria/AI_ML_INTEGRATION_TEMPLATE.md"
    "criteria/DEMO_WALKTHROUGH_TEMPLATE.md"
    "criteria/USER_DOCUMENTATION_TEMPLATE.md"
    "criteria/PLATFORM_INTEGRATION_TEMPLATE.md"
    "criteria/INNOVATION_TEMPLATE.md"
    "criteria/ACCESSIBILITY_FEEDBACK_TEMPLATE.md"
    "criteria/REALTIME_SUGGESTIONS_TEMPLATE.md"
)

# All template files combined
ALL_TEMPLATE_FILES=("${TEMPLATE_FILES[@]}" "${CRITERIA_TEMPLATE_FILES[@]}")

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print header
print_header() {
    echo
    print_color $BLUE "======================================"
    print_color $BLUE "$1"
    print_color $BLUE "======================================"
    echo
}

# Function to print success
print_success() {
    print_color $GREEN "✓ $1"
}

# Function to print warning
print_warning() {
    print_color $YELLOW "⚠ $1"
}

# Function to print error
print_error() {
    print_color $RED "✗ $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for user input
prompt_input() {
    local var_name=$1
    local prompt_text=$2
    local default_value=$3
    
    if [ -n "$default_value" ]; then
        read -p "$prompt_text [$default_value]: " input
        if [ -z "$input" ]; then
            input=$default_value
        fi
    else
        read -p "$prompt_text: " input
    fi
    
    echo "$input"
}

# Function to detect project type
detect_project_type() {
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        if grep -q "vite" "$PROJECT_ROOT/package.json"; then
    echo "React Web App"
elif grep -q "react-dom" "$PROJECT_ROOT/package.json"; then
    echo "React Web"
        elif grep -q "react" "$PROJECT_ROOT/package.json"; then
            echo "React"
        elif grep -q "next" "$PROJECT_ROOT/package.json"; then
            echo "Next.js"
        elif grep -q "vue" "$PROJECT_ROOT/package.json"; then
            echo "Vue.js"
        else
            echo "Node.js"
        fi
    elif [ -f "$PROJECT_ROOT/pom.xml" ]; then
        echo "Java/Maven"
    elif [ -f "$PROJECT_ROOT/build.gradle" ]; then
        echo "Java/Gradle"
    elif [ -f "$PROJECT_ROOT/requirements.txt" ] || [ -f "$PROJECT_ROOT/setup.py" ]; then
        echo "Python"
    elif [ -f "$PROJECT_ROOT/Cargo.toml" ]; then
        echo "Rust"
    elif [ -f "$PROJECT_ROOT/go.mod" ]; then
        echo "Go"
    elif [ -f "$PROJECT_ROOT/composer.json" ]; then
        echo "PHP"
    elif [ -f "$PROJECT_ROOT/Gemfile" ]; then
        echo "Ruby"
    else
        echo "Unknown"
    fi
}

# Function to get git repository URL
get_git_url() {
    if command_exists git && [ -d "$PROJECT_ROOT/.git" ]; then
        git -C "$PROJECT_ROOT" remote get-url origin 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# Function to get project name from directory or git
get_project_name() {
    local git_url=$(get_git_url)
    if [ -n "$git_url" ]; then
        basename "$git_url" .git
    else
        basename "$PROJECT_ROOT"
    fi
}

# Function to create directory if it doesn't exist
create_directory() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    fi
}

# Function to collect template variables interactively
collect_variables_interactive() {
    print_header "Project Information Collection"
    
    local detected_name=$(get_project_name)
    local detected_type=$(detect_project_type)
    local detected_git_url=$(get_git_url)
    
    print_color $BLUE "Detected project information:"
    echo "  Name: $detected_name"
    echo "  Type: $detected_type"
    if [ -n "$detected_git_url" ]; then
        echo "  Git URL: $detected_git_url"
    fi
    echo
    
    # Collect variables
    PROJECT_NAME=$(prompt_input "PROJECT_NAME" "Project Name" "$detected_name")
    TECH_STACK=$(prompt_input "TECH_STACK" "Technology Stack" "$detected_type")
    PLATFORM=$(prompt_input "PLATFORM" "Platform (mobile/web/desktop)" "mobile")
    TEAM_SIZE=$(prompt_input "TEAM_SIZE" "Team Size" "3-5 developers")
    CONTACT_EMAIL=$(prompt_input "CONTACT_EMAIL" "Contact Email" "team@company.com")
    REPOSITORY_URL=$(prompt_input "REPOSITORY_URL" "Repository URL" "$detected_git_url")
    DEPLOYMENT_URL=$(prompt_input "DEPLOYMENT_URL" "Deployment URL" "https://app.example.com")
    API_BASE_URL=$(prompt_input "API_BASE_URL" "API Base URL" "https://api.example.com")
    DATABASE_TYPE=$(prompt_input "DATABASE_TYPE" "Database Type" "PostgreSQL")
    HOSTING_PROVIDER=$(prompt_input "HOSTING_PROVIDER" "Hosting Provider" "AWS")
    BRAINLIFT_DOCUMENT_LINK=$(prompt_input "BRAINLIFT_DOCUMENT_LINK" "Brainlift Document Link" "https://docs.example.com/brainlift")
    BRAINLIFT_DESCRIPTION=$(prompt_input "BRAINLIFT_DESCRIPTION" "Brainlift Description" "the comprehensive evaluation rubric and AI workflow enhancement guide")
}

# Function to collect template variables from command line
collect_variables_cli() {
    local detected_name=$(get_project_name)
    local detected_type=$(detect_project_type)
    local detected_git_url=$(get_git_url)
    
    PROJECT_NAME=${PROJECT_NAME:-$detected_name}
    TECH_STACK=${TECH_STACK:-$detected_type}
    PLATFORM=${PLATFORM:-"mobile"}
    TEAM_SIZE=${TEAM_SIZE:-"3-5 developers"}
    CONTACT_EMAIL=${CONTACT_EMAIL:-"team@company.com"}
    REPOSITORY_URL=${REPOSITORY_URL:-$detected_git_url}
    DEPLOYMENT_URL=${DEPLOYMENT_URL:-"https://app.example.com"}
    API_BASE_URL=${API_BASE_URL:-"https://api.example.com"}
    DATABASE_TYPE=${DATABASE_TYPE:-"PostgreSQL"}
    HOSTING_PROVIDER=${HOSTING_PROVIDER:-"AWS"}
    BRAINLIFT_DOCUMENT_LINK=${BRAINLIFT_DOCUMENT_LINK:-"https://docs.example.com/brainlift"}
    BRAINLIFT_DESCRIPTION=${BRAINLIFT_DESCRIPTION:-"the comprehensive evaluation rubric and AI workflow enhancement guide"}
}

# Function to replace template variables in content
replace_variables() {
    local content="$1"
    
    content="${content//\[PROJECT_NAME\]/$PROJECT_NAME}"
    content="${content//\[TECH_STACK\]/$TECH_STACK}"
    content="${content//\[PLATFORM\]/$PLATFORM}"
    content="${content//\[TEAM_SIZE\]/$TEAM_SIZE}"
    content="${content//\[CONTACT_EMAIL\]/$CONTACT_EMAIL}"
    content="${content//\[REPOSITORY_URL\]/$REPOSITORY_URL}"
    content="${content//\[DEPLOYMENT_URL\]/$DEPLOYMENT_URL}"
    content="${content//\[API_BASE_URL\]/$API_BASE_URL}"
    content="${content//\[DATABASE_TYPE\]/$DATABASE_TYPE}"
    content="${content//\[HOSTING_PROVIDER\]/$HOSTING_PROVIDER}"
    content="${content//\[BRAINLIFT_DOCUMENT_LINK\]/$BRAINLIFT_DOCUMENT_LINK}"
    content="${content//\[BRAINLIFT_DESCRIPTION\]/$BRAINLIFT_DESCRIPTION}"
    content="${content//\[DATE\]/$(date +%Y-%m-%d)}"
    content="${content//\[YEAR\]/$(date +%Y)}"
    content="${content//\[MONTH\]/$(date +%B)}"
    
    echo "$content"
}

# Function to process template file
process_template() {
    local template_file=$1
    local source_path="$TEMPLATES_DIR/$template_file"
    local target_path="$TARGET_DIR/${template_file//_TEMPLATE/}"
    
    if [ ! -f "$source_path" ]; then
        print_error "Template file not found: $source_path"
        return 1
    fi
    
    # Create target directory if needed
    local target_dir=$(dirname "$target_path")
    create_directory "$target_dir"
    
    # Read template content
    local content=$(cat "$source_path")
    
    # Replace variables
    content=$(replace_variables "$content")
    
    # Write to target file
    echo "$content" > "$target_path"
    print_success "Generated: $target_path"
}

# Function to show help
show_help() {
    cat << EOF
Documentation Template Initialization Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -h, --help              Show this help message
    -i, --interactive       Run in interactive mode (default)
    -q, --quiet            Run in quiet mode with minimal output
    --project-name NAME     Set project name
    --tech-stack STACK      Set technology stack
    --platform PLATFORM    Set platform type
    --team-size SIZE        Set team size
    --contact-email EMAIL   Set contact email
    --repository-url URL    Set repository URL
    --deployment-url URL    Set deployment URL
    --api-base-url URL      Set API base URL
    --database-type TYPE    Set database type
    --hosting-provider PROVIDER Set hosting provider
    --brainlift-document-link URL Set brainlift document link
    --brainlift-description DESC Set brainlift description

EXAMPLES:
    # Interactive mode (default)
    $0

    # Quiet mode with all parameters
    $0 --quiet --project-name "My App" --tech-stack "React Native" --platform "mobile"

    # Set specific parameters and prompt for others
    $0 --project-name "My App" --tech-stack "React Native"

TEMPLATE FILES:
    Core Templates:
    - DOCUMENTATION_TEMPLATE.md
    - PROJECT_STRUCTURE_TEMPLATE.md
    - PROJECT_EVALUATION_TEMPLATE.md
    - LOGGING_GUIDE_TEMPLATE.md
    - README_TEMPLATE.md
    - DOCUMENTATION_UPDATE_SCRIPT_TEMPLATE.md
    - RUBRIC_EVALUATION_TEMPLATE.md

    Criteria Templates:
    - USER_PERSONAS_TEMPLATE.md
    - WIREFRAMES_UI_TEMPLATE.md
    - MVP_FOCUS_TEMPLATE.md
    - TECHNICAL_DOCUMENTATION_TEMPLATE.md
    - INDUSTRY_CONTEXT_TEMPLATE.md
    - AI_ML_INTEGRATION_TEMPLATE.md
    - DEMO_WALKTHROUGH_TEMPLATE.md
    - USER_DOCUMENTATION_TEMPLATE.md
    - PLATFORM_INTEGRATION_TEMPLATE.md
    - INNOVATION_TEMPLATE.md
    - ACCESSIBILITY_FEEDBACK_TEMPLATE.md
    - REALTIME_SUGGESTIONS_TEMPLATE.md

GENERATED FILES:
    The script will generate corresponding files without the "_TEMPLATE" suffix
    in the project's docs/ directory.

EOF
}

# Function to show summary
show_summary() {
    print_header "Template Generation Summary"
    
    echo "Project Configuration:"
    echo "  Name: $PROJECT_NAME"
    echo "  Tech Stack: $TECH_STACK"
    echo "  Platform: $PLATFORM"
    echo "  Team Size: $TEAM_SIZE"
    echo "  Contact: $CONTACT_EMAIL"
    echo "  Repository: $REPOSITORY_URL"
    echo "  Deployment: $DEPLOYMENT_URL"
    echo "  API: $API_BASE_URL"
    echo "  Database: $DATABASE_TYPE"
    echo "  Hosting: $HOSTING_PROVIDER"
    echo
    
    echo "Generated Files:"
    for template_file in "${ALL_TEMPLATE_FILES[@]}"; do
        local target_file="${template_file//_TEMPLATE/}"
        echo "  ✓ docs/$target_file"
    done
    echo
    
    print_color $GREEN "Documentation templates generated successfully!"
    print_color $BLUE "Total files: $(( ${#TEMPLATE_FILES[@]} + ${#CRITERIA_TEMPLATE_FILES[@]} ))"
    print_color $BLUE "Next steps:"
    echo "  1. Review and customize the generated documentation"
    echo "  2. Replace remaining placeholder values with actual content"
    echo "  3. Set up documentation update processes"
    echo "  4. Share with your team and stakeholders"
}

# Main function
main() {
    local interactive_mode=true
    local quiet_mode=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -i|--interactive)
                interactive_mode=true
                shift
                ;;
            -q|--quiet)
                quiet_mode=true
                interactive_mode=false
                shift
                ;;
            --project-name)
                PROJECT_NAME="$2"
                shift 2
                ;;
            --tech-stack)
                TECH_STACK="$2"
                shift 2
                ;;
            --platform)
                PLATFORM="$2"
                shift 2
                ;;
            --team-size)
                TEAM_SIZE="$2"
                shift 2
                ;;
            --contact-email)
                CONTACT_EMAIL="$2"
                shift 2
                ;;
            --repository-url)
                REPOSITORY_URL="$2"
                shift 2
                ;;
            --deployment-url)
                DEPLOYMENT_URL="$2"
                shift 2
                ;;
            --api-base-url)
                API_BASE_URL="$2"
                shift 2
                ;;
            --database-type)
                DATABASE_TYPE="$2"
                shift 2
                ;;
            --hosting-provider)
                HOSTING_PROVIDER="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    if [ "$quiet_mode" = false ]; then
        print_header "Documentation Template Initialization"
        echo "This script will generate comprehensive documentation templates for your project."
        echo "Templates include project documentation, evaluation rubrics, and specialized criteria guides."
        echo
    fi
    
    # Collect variables
    if [ "$interactive_mode" = true ]; then
        collect_variables_interactive
    else
        collect_variables_cli
    fi
    
    if [ "$quiet_mode" = false ]; then
        print_header "Generating Documentation Templates"
    fi
    
    # Create target directory structure
    create_directory "$TARGET_DIR"
    create_directory "$TARGET_DIR/criteria"
    
    # Process all template files
    local success_count=0
    local total_count=${#ALL_TEMPLATE_FILES[@]}
    
    for template_file in "${ALL_TEMPLATE_FILES[@]}"; do
        if process_template "$template_file"; then
            ((success_count++))
        fi
    done
    
    if [ "$quiet_mode" = false ]; then
        echo
        show_summary
    else
        print_success "Generated $success_count/$total_count documentation templates"
    fi
    
    # Check for any failures
    if [ $success_count -ne $total_count ]; then
        print_warning "Some template files could not be processed"
        exit 1
    fi
}

# Run main function
main "$@" 