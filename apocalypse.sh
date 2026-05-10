#!/bin/bash

read -p "Apakah Anda yakin ingin menghancurkan project ini? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Penghancuran project dibatalkan."
  exit 0
fi

rm -rf *
rm -rf .agent .air.toml .dockerignore .git .github .gitignore
rm -rf ./*

git clone https://github.com/jefripunza/react-go.git .
