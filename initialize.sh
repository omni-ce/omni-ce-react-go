#!/bin/bash

# Questions
read -p "Project Code? [react-go]          : " projectCode
read -p "HTML Title? [title | mini-detail] : " htmlTitle
read -p "HTML Description?                 : " htmlDescription

# Remove git repository
# rm -rf .git

# Install dependencies
bun i

# Build frontend
bun run build

# Replace variables in application.variable.go
if [ ! -z "$htmlTitle" ]; then
  escTitle=$(printf '%s' "$htmlTitle" | sed -e 's/[\/&]/\\&/g')
  sed -i '' "s/AppHtmlHeadTitle       = \".*\"/AppHtmlHeadTitle       = \"$escTitle\"/" variable/application.variable.go
fi
if [ ! -z "$htmlDescription" ]; then
  escDesc=$(printf '%s' "$htmlDescription" | sed -e 's/[\/&]/\\&/g')
  sed -i '' "s/AppHtmlHeadDescription = \".*\"/AppHtmlHeadDescription = \"$escDesc\"/" variable/application.variable.go
fi

# Replace project code globally (except .git, node_modules, and this script)
export LC_ALL=C
if [ ! -z "$projectCode" ] && [ "$projectCode" != "react-go" ]; then
  find . -type d \( -name .git -o -name node_modules \) -prune -false -o -type f -not -name 'initialize.sh' -not -name 'apocalypse.sh' | while read -r file; do
    if grep -q 'react-go' "$file" 2>/dev/null; then
      sed -i '' "s/react-go/$projectCode/g" "$file"
    fi
  done
fi
