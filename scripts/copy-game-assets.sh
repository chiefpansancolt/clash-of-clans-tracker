#!/bin/bash
# Copies image assets from clash-of-clans-data package to public/
# Run automatically via postinstall or manually as needed

PACKAGE_DIR="node_modules/clash-of-clans-data"
TARGET_DIR="public/images"

rm -rf "$TARGET_DIR"

cp -r "$PACKAGE_DIR/images" "$TARGET_DIR"

echo "Copied game assets from clash-of-clans-data to public/images/"