# CRITICAL: Security Remediation Guide

## IMMEDIATE ACTIONS REQUIRED (Within 24 hours)

### 1. Rotate Exposed API Keys

**Status**: 🔴 CRITICAL - These keys were exposed in git repository and likely indexed

#### Supabase Service Role Key
- **Current Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Risk**: Full database access, bypasses all row-level security
- **Action**:
  1. Go to Supabase Dashboard → Project → Settings → API Keys
  2. Under "SERVICE_ROLE_KEY", click "Rotate"
  3. Confirm rotation
  4. Copy new key to secure location

#### Hugging Face API Key(done)
- **Current Key**: `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`
- **Risk**: API billing abuse, unlimited image generation
- **Action**:
  1. Go to HuggingFace → Settings → Access Tokens
  2. Delete current token
  3. Generate new token with "read" access only
  4. Copy to secure location

#### Supabase URL
- **Project ID**: `ernojzrljjctdusndxrp`
- **Risk**: Combined with service role key = full breach
- **Note**: URL itself is less sensitive, but monitor for unauthorized access

### 2. Update Vercel Environment Variables

```bash
# In Vercel Dashboard:
# 1. Go to Project Settings → Environment Variables
# 2. Update these variables (copy from rotated keys):

SUPABASE_SERVICE_ROLE_KEY=<NEW_KEY_FROM_STEP_1>
HUGGING_FACE_API_KEY=<NEW_KEY_FROM_STEP_1>

# Redeploy to propagate:
git push origin main
# (This will trigger automatic redeploy on Vercel)
```

### 3. Remove Secret from Git History

```bash
# Option A: Simple (keeps old commits in history but removes file):
cd /path/to/ai_artisian_fixed
echo "functions/.env" >> .gitignore
git rm --cached functions/.env
git add .gitignore
git commit -m "chore: remove .env from version control"
git push origin main

# Option B: Complete (removes from all history - DESTRUCTIVE):
# Only do this if you want to purge entirely from GitHub
git filter-branch --tree-filter 'rm -f functions/.env' HEAD
git push origin --force-with-lease
# WARNING: This rewrites history. All team members need to re-clone.
```

### 4. Monitor for Unauthorized Access

```bash
# Check Supabase logs for suspicious activity:
# Dashboard → Logs → Database
# Look for unexpected DELETE, UPDATE, or INSERT operations

# Check HuggingFace usage:
# Settings → Usage
# Look for spikes in inference usage or billing

# Check Vercel logs:
# Deployment → Function Logs
# Look for 401/403 errors (indicates old key attempts)
```

### 5. Validate Fixes Are Working

```bash
# Test with new keys:
1. Deploy functions with new HF key
2. Test image generation: Visit /artisan/onboarding → Generate Design
3. Test Supabase access: Signup as new user
4. Check both succeed without 401/403 errors
```

---

## Environment Variable Setup for Team

### Development (.env.local - Git ignored)
```
VITE_SUPABASE_URL=https://ernojzrljjctdusndxrp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<get from Supabase>
VITE_API_PROXY_TARGET=http://127.0.0.1:5001/ai-artisan/us-central1/api
```

### Functions (functions/.env - Git ignored)
```
SUPABASE_URL=https://ernojzrljjctdusndxrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<NEW ROTATED KEY>
HUGGING_FACE_API_KEY=<NEW ROTATED KEY>
ALLOWED_ORIGINS=http://localhost:3000,https://aiartisan.vercel.app
NODE_ENV=development
```

### Vercel Production Environment
```
SUPABASE_SERVICE_ROLE_KEY: <NEW ROTATED KEY>
HUGGING_FACE_API_KEY: <NEW ROTATED KEY>
HF_API_KEY: <NEW ROTATED KEY>
```

---

## Security Hardening Checklist

- [ ] Rotate Supabase service role key
- [ ] Rotate HuggingFace API key
- [ ] Remove .env from git history
- [ ] Update .gitignore
- [ ] Update Vercel environment variables
- [ ] Redeploy application
- [ ] Monitor logs for 24 hours
- [ ] Document incident in security log
- [ ] Team security training (secrets management)
- [ ] Setup automatic secret scanning in CI/CD

---

## Prevention Going Forward

### GitHub Security Features
```bash
# Enable Secret Scanning:
1. Go to GitHub Repo → Settings → Security & Analysis
2. Enable "Secret Scanning"
3. Enable "Push Protection" (paid feature)
4. This will block commits with detected secrets
```

### CI/CD Integration
```yaml
# Add to GitHub Actions or Vercel checks:
- Run git-secrets or TruffleHog to detect secrets
- Fail build if secrets found
- Example: git-secrets --install && git-secrets --scan
```

### Team Guidelines
1. **Never commit .env files** - use only Vercel environment variables
2. **Use .env.example** - with placeholder values only
3. **Rotate keys quarterly** - even if not compromised
4. **Don't share keys in Slack/Email** - use secure secret manager
5. **Code review secrets** - if secrets appear in PR, reject immediately

---

## RLS Security Fix

### Previous (Insecure) Policy
```sql
create policy profiles_select_public on public.profiles 
  for select using (true);
  -- ⚠️ EVERYONE can see ALL profiles (including emails, phones)
```

### Fixed Policy
```sql
create policy profiles_select_self_or_admin on public.profiles 
  for select using (auth.uid() = id or public.is_admin());
  -- ✅ Users see only their own, admins see all
```

### Apply Fix
1. Go to Supabase SQL Editor
2. Copy this SQL:
```sql
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;

CREATE POLICY profiles_select_self_or_admin ON public.profiles
  FOR SELECT USING (auth.uid() = id or public.is_admin());
```
3. Run it

---

## Post-Fix Validation

### Test Cases
```javascript
// Test 1: User can see own profile
const ownProfile = await supabase
  .from('profiles')
  .select('*')
  .eq('id', currentUserId)
  .single();
// Should succeed ✅

// Test 2: User CANNOT see other's profile
const otherProfile = await supabase
  .from('profiles')
  .select('*')
  .eq('id', someoneElseId)
  .single();
// Should fail with 403 ✅

// Test 3: Admin can see all
const allProfiles = await supabase
  .from('profiles')
  .select('*');
// Should succeed for admin only ✅
```

---

## Timeline

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Rotate Supabase key | 5 min | CRITICAL |
| Rotate HF key | 5 min | CRITICAL |
| Update Vercel env | 5 min | CRITICAL |
| Test keys work | 10 min | HIGH |
| Remove from git | 10 min | HIGH |
| Apply RLS fix | 5 min | HIGH |
| Monitor logs | 24 hours | HIGH |
| **TOTAL** | **~45 min** | |

---

## Emergency Contacts

If keys are used maliciously:

1. **Supabase Support**: support@supabase.io
2. **HuggingFace**: Include project URL in report
3. **GitHub Security**: Report at github.com/security/advisories
4. **Vercel Support**: Priority support if affected

---

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/self-hosting/security/overview)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

