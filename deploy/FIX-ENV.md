# Fix .env File

The .env at `/opt/brighternepal/.env` has two problems:
- First 4 lines use `:` instead of `=`
- DATABASE_URI is truncated (ends with `>`)

## Fix it

```bash
nano /opt/brighternepal/.env
```

Make sure the file looks exactly like this (use `=` everywhere, DATABASE_URI on one full line):

```env
SECRET_KEY=e8d6895d2dcf7963a383824ffdbf8a6480070b1b7d108825b6215d92dceaa157
JWT_SECRET_KEY=6adaaa6e3b57e5211f17ee430ac74703c19e4259edd9ccfc0196821b1f97cebf
URL_CIPHER_KEY=d02f253d7a84274d
DB_PASSWORD=gopXcevYRHZbdyP69iip6lG2043Tdab
DATABASE_URI=postgresql://brighternepal:gopXcevYRHZbdyP69iip6lG2043Tdab@127.0.0.1:5432/brighternepal

DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800

FRONTEND_URL=https://brighternepal.com
NEXT_PUBLIC_API_URL=https://api.brighternepal.com
NEXT_PUBLIC_CHAT_URL=https://chat.brighternepal.com

USE_REDIS_CACHE=true
REDIS_URL=redis://127.0.0.1:6379/0
```

Save: `Ctrl+X` → `Y` → `Enter`

## Set PostgreSQL password to match

```bash
sudo -u postgres psql -c "ALTER USER brighternepal PASSWORD 'gopXcevYRHZbdyP69iip6lG2043Tdab';"
```

## Restart all services

```bash
systemctl restart bn-api bn-frontend
```

## Verify

```bash
systemctl status bn-api bn-frontend --no-pager
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://127.0.0.1:3000
curl -s http://127.0.0.1:5000/api/health
```

Expected:
- `Frontend: HTTP 200`
- JSON response from API
