# Fix: API URL Falls Back to localhost

`NEXT_PUBLIC_*` variables are baked into the JS bundle **at build time**.  
Next.js only reads them from a `.env*` file in the **project root** — not from the systemd `EnvironmentFile`.  
Without them, the build defaults to `localhost:5000` → CORS error in production.

## Fix (run once on VPS)

```bash
# 1. Write NEXT_PUBLIC vars into project root so Next.js reads them at build time
grep "^NEXT_PUBLIC_" /opt/brighternepal/.env > /opt/brighternepal/brighter-nepal/.env.production.local

# 2. Verify (should show 3 lines)
cat /opt/brighternepal/brighter-nepal/.env.production.local

# 3. Rebuild
cd /opt/brighternepal/brighter-nepal
npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
chmod -R o+rX public

# 4. Restart
systemctl restart bn-frontend
sleep 3
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://127.0.0.1:3000
```

The `.env.production.local` file should contain:
```
NEXT_PUBLIC_API_URL=https://api.brighternepal.com
NEXT_PUBLIC_CHAT_URL=https://chat.brighternepal.com
NEXT_PUBLIC_URL_CIPHER_KEY=d02f253d7a84274d
```

## Already fixed in redeploy.sh

`redeploy.sh` now runs `grep "^NEXT_PUBLIC_" ...` automatically before every frontend build — so this is a one-time manual fix only.

## Rule

Any time you add a new `NEXT_PUBLIC_*` variable:
1. Add it to `/opt/brighternepal/.env` on the VPS
2. Re-run `redeploy.sh frontend` (which will re-extract and rebuild)
