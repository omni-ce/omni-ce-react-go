#!/bin/bash

### Questions

# Project
while true; do
  read -p "Project Code? [react-go]          : " projectCode
  if [ -z "$projectCode" ]; then
    break
  fi
  if [[ ! "$projectCode" =~ ^[a-z0-9-]+$ ]]; then
    echo "⚠️  Error: Project Code harus berupa huruf kecil, angka, dan strip (-). Tidak boleh ada spasi atau karakter spesial. Contoh: react-go123"
  else
    break
  fi
done

# User
while true; do
  read -p "User: Username? [admin]           : " username
  if [ -z "$username" ]; then
    break
  fi
  if [[ ! "$username" =~ ^[a-z0-9-]+$ ]]; then
    echo "⚠️  Error: Username harus berupa huruf kecil, angka, dan strip (-). Tidak boleh ada spasi atau karakter spesial. Contoh: admin"
  else
    break
  fi
done
while true; do
  read -p "User: Password? [admin123]        : " password
  if [ -z "$password" ]; then
    break
  fi
  if [[ ${#password} -lt 8 || ! "$password" =~ [A-Z] || ! "$password" =~ [a-z] || ! "$password" =~ [0-9] || ! "$password" =~ [^a-zA-Z0-9] ]]; then
    echo "⚠️  Error: Password minimal 8 karakter, serta harus mengandung kombinasi huruf besar, huruf kecil, angka, dan karakter spesial minimal masing-masing 1 karakter."
  else
    break
  fi
done

# Server
read -p "Server Name? [ReactGO]            : " serverName

# HTML
read -p "HTML Title? [title | mini-detail] : " htmlTitle
read -p "HTML Description?                 : " htmlDescription

echo "Start Process ..."

# Remove git repository
rm -rf .git

# Install dependencies
echo "Install dependencies ..."
bun i
go mod tidy

# Replace variables in application.variable.go
echo "Replace variables ..."
if [ ! -z "$htmlTitle" ]; then
  escTitle=$(printf '%s' "$htmlTitle" | sed -e 's/[\/&]/\\&/g')
  sed -i '' "s/AppHtmlHeadTitle       = \".*\"/AppHtmlHeadTitle       = \"$escTitle\"/" variable/application.variable.go
fi
if [ ! -z "$htmlDescription" ]; then
  escDesc=$(printf '%s' "$htmlDescription" | sed -e 's/[\/&]/\\&/g')
  sed -i '' "s/AppHtmlHeadDescription = \".*\"/AppHtmlHeadDescription = \"$escDesc\"/" variable/application.variable.go
fi

# Replace server name in variable server.variable.go
if [ ! -z "$serverName" ]; then
  escServerName=$(printf '%s' "$serverName" | sed -e 's/[\/&]/\\&/g')
  sed -i '' "s/ServerName = \".*\"/ServerName = \"$escServerName\"/" variable/server.variable.go
fi

# Replace user credentials in user.model.go
if [ ! -z "$username" ]; then
  sed -i '' "s/Username: \"admin\"/Username: \"$username\"/" modules/user/model/user.model.go
fi
if [ ! -z "$password" ]; then
  sed -i '' "s/Password: function.EncryptPassword(\"admin123\")/Password: function.EncryptPassword(\"$password\")/" modules/user/model/user.model.go
fi

# Replace project code globally (except .git, node_modules, and this script)
export LC_ALL=C
if [ ! -z "$projectCode" ] && [ "$projectCode" != "react-go" ]; then
  find . -type d \( -name .git -o -name node_modules \) -prune -false -o -type f -not -name 'initialize.sh' -not -name 'apocalypse.sh' | while read -r file; do
    if grep -q 'react-go' "$file" 2>/dev/null; then
      sed -i '' "s/react-go/$projectCode/g" "$file"
      echo "Replace file: $file"
    fi
  done
fi

# Build frontend
echo "Build frontend ..."
bun run build

# Build backend
echo "Build backend ..."
go build -o $projectCode main.go

echo "Done ..."
rm -rf $projectCode
