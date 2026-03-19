#!/bin/bash
#usage ./scripts/setupScratch.sh <scratch-org-alias>
set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/setupScratch.sh <scratch-org-alias>"
  exit 1
fi

ORG_ALIAS="$1"

echo "Step 0: Marking existing scratch org for deletion"
sf org delete scratch --target-org "$ORG_ALIAS" --no-prompt || true

echo "Step 1: Create a scratch org"
sf org create scratch -a "$ORG_ALIAS" -d -f ./config/project-scratch-def.json -y 30 -v practice-dev-ed

echo "Step 2: Deploy metadata"
sf project deploy start -o "$ORG_ALIAS"

echo "Step 3: Import data"
sf data tree import --plan ./data/seed-plan.json -o "$ORG_ALIAS"

echo "Step 4: Open org"
sf org open -u "$ORG_ALIAS"

echo "Step 5: Run tests"
sf apex run test --test-level RunLocalTests --wait 30 --code-coverage --result-format human

read -p "Press enter to exit..."