# Fix Public Directory 403 Forbidden

Nginx can't read `public/` files because the `www-data` worker lacks execute permission on the directories.

## Fix

```bash
chmod -R o+rX /opt/brighternepal/brighter-nepal/public
chmod o+rx /opt/brighternepal /opt/brighternepal/brighter-nepal
```

## Verify

```bash
curl -s -o /dev/null -w "csPlayer.css: HTTP %{http_code}\n" https://brighternepal.com/csPlayer.css
curl -s -o /dev/null -w "csPlayer.js:  HTTP %{http_code}\n" https://brighternepal.com/csPlayer.js
curl -s -o /dev/null -w "icons css:    HTTP %{http_code}\n" https://brighternepal.com/icons/tabler-icons.min.css
```

Expected: all `HTTP 200`

> **Note:** After each `git pull` / redeploy, re-run the `chmod` commands since new files may be created with restricted permissions.
