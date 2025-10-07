#!/bin/bash
cd /home/user/webapp

# Get all local branches except main
branches=$(git branch | grep -v "main" | sed 's/^ *//')

for branch in $branches; do
    echo "Processing branch: $branch"
    
    # Checkout branch
    git checkout "$branch" 2>/dev/null
    
    # Check if .github directory exists
    if [ -d ".github" ]; then
        echo "  Removing .github directory from $branch"
        rm -rf .github
        git add .
        git commit -m "Remove GitHub workflows for compatibility" 2>/dev/null || echo "  Nothing to commit in $branch"
    fi
    
    # Push branch
    echo "  Pushing branch: $branch"
    git push -u origin "$branch" 2>&1 | grep -E "(remote rejected|error|Everything up-to-date|new branch)" || echo "  Push completed for $branch"
    
    echo "  ---"
done

# Return to main branch
git checkout main
echo "All branches processed!"
