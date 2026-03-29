# Fix bn-frontend and bn-api

## Problem 1: bn-frontend — server.js not found

The Next.js build was never run after fresh clone. Run the build now:

```bash
cd /opt/brighternepal/brighter-nepal
npm install
NEXT_PUBLIC_API_URL=https://api.brighternepal.com NEXT_PUBLIC_CHAT_URL=https://chat.brighternepal.com npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
chown -R brighternepal:brighternepal /opt/brighternepal
systemctl restart bn-frontend
```

Check it worked:

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

Check it worked:

```bash
systemctl status bn-api --no-pager
curl -s http://127.0.0.1:5000/api/health
# Expected: JSON response
```

---

## Verify all services after fixing

```bash
systemctl status bn-api bn-chat bn-frontend nginx --no-pager
```

All 4 should show **active (running)**.
