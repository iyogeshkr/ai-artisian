#!/usr/bin/env bash
set -euo pipefail

echo "AI Artisan: cleanup and migration helper"

echo "1) Rotate leaked keys immediately in provider consoles."
echo "2) After rotating, remove secrets from git history (example using BFG):"
echo "   bfg --delete-files functions/.env"
echo "   git reflog expire --expire=now --all && git gc --prune=now --aggressive"

echo "3) Push Clerk-first Supabase schema with supabase CLI:" 
echo "   supabase db push --file supabase/clerk_schema.sql"

echo "4) CI: add a preflight check to fail on tracked .env files."

echo "This script only prints recommended steps. Run commands carefully with appropriate access."
