#!/bin/bash
# Script per trovare tutti i file con mock data

echo "Cercando tutti i file con mock/simulate data..."

grep -r "mock\|Mock\|MOCK\|simulate\|Simulate\|SIMULATE" app/api --include="*.ts" | grep -v "node_modules" | wc -l

echo "File trovati con mock data:"
grep -rl "mock\|Mock\|MOCK\|simulate\|Simulate\|SIMULATE" app/api --include="*.ts" | grep -v "node_modules"
