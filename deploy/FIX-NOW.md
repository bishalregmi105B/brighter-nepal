# Fix bn-frontend and bn-api

## Problem 1: bn-frontend — standalone/server.js not generated

Root cause: `next.config.mjs` (empty file) was overriding `next.config.ts` and blocking `output: 'standalone'`.

### Run this on the VPS:

```bash
# Fix git ownership error
git config --global --add safe.directory /opt/brighternepal/brighter-nepal
git config --global --add safe.directory /opt/brighternepal/brighter-nepal-api
git config --global --add safe.directory /opt/brighternepal/brighter-nepal-chat

cd /opt/brighternepal/brighter-nepal

# Delete the conflicting config file
rm -f next.config.mjs

# Pull latest code (which also removes it cleanly)
git pull

# Rebuild — this time standalone/ will be generated
npm run build

# Copy static assets into standalone
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Fix ownership and restart
chown -R brighternepal:brighternepal /opt/brighternepal
systemctl restart bn-frontend
```

### Verify:

```bash
systemctl status bn-frontend --no-pager
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000
# Expected: HTTP 200
```

---

## Problem 2: bn-api — database "brig>" does not exist

The DATABASE_URI in .env is corrupted/truncated. Fix it:

```bash
nano /opt/brighternepal/.env
```

Find the DATABASE_URI line and make sure it looks exactly like this (one line, no breaks):

```
DATABASE_URI=postgresql://brighternepal:YOUR_DB_PASSWORD@127.0.0.1:5432/brighternepal
```

Replace `YOUR_DB_PASSWORD` with your actual password. If you don't have one yet, generate and set it:

```bash
# Generate a password
DB_PASS=$(openssl rand -base64 24 | tr -d '=/+' | head -c 32)
echo "Password: $DB_PASS"

# Set it in PostgreSQL
sudo -u postgres psql -c "ALTER USER brighternepal PASSWORD '$DB_PASS';"

# Then paste it into .env
nano /opt/brighternepal/.env
# Set: DATABASE_URI=postgresql://brighternepal:<paste DB_PASS here>@127.0.0.1:5432/brighternepal
```

Save with Ctrl+X → Y → Enter. Then restart:

```bash
systemctl restart bn-api
journalctl -u bn-api --no-pager -n 20
```

### Verify:

```bash
systemctl status bn-api --no-pager
curl -s http://127.0.0.1:5000/api/health
# Expected: JSON response
```

---

## Final check — all 4 services running

```bash
systemctl status bn-api bn-chat bn-frontend nginx --no-pager
```

All 4 should show **active (running)** in green.
