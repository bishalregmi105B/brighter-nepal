# Push & Deploy Commands

## How It Works

```
Your PC                     GitHub                      VPS Server
(local code)                (cloud)                     (163.47.151.249)
    │                          │                            │
    │  git push ──────────►    │                            │
    │                          │                            │
    │                          │    ◄────── git pull        │
    │                          │       (redeploy.sh does    │
    │                          │        this automatically) │
```

**You do NOT manually upload files to the server.**

1. You `git push` your code to GitHub (from your local PC)
2. The `redeploy.sh` script runs `git pull` on the VPS to download the latest code from GitHub
3. Then it installs dependencies, rebuilds, and restarts the service

That's why you only need two steps: **push** then **redeploy**.

---

## Step 1: Push Code to GitHub (from your local PC)

### Push Frontend
```bash
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal"
git add -A
git commit -m "your commit message"
git push
```

### Push API (only if you changed API code)
```bash
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-api"
git add -A
git commit -m "your commit message"
git push
```

### Push Chat (only if you changed chat code)
```bash
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-chat"
git add -A
git commit -m "your commit message"
git push
```

---

## Step 2: Redeploy on VPS

### Option A: SSH in, then run redeploy
```bash
ssh root@163.47.151.249
bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh all
```

### Option B: One-liner from your local PC (no need to SSH separately)
```bash
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh all"
```

### Redeploy only what you changed
```bash
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh frontend"
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh api"
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh chat"
```

---

## What redeploy.sh Does Automatically

| Step | Frontend | API | Chat |
|------|----------|-----|------|
| 1 | `git pull` | `git pull` | `git pull` |
| 2 | `npm install` | `pip install -r requirements.txt` | `pip install -r requirements.txt` |
| 3 | `npm run build` | — | — |
| 4 | Copy static assets | — | — |
| 5 | `systemctl restart bn-frontend` | `systemctl restart bn-api` | `systemctl restart bn-chat` |

---

## Check Status After Deploy
```bash
ssh root@163.47.151.249 "systemctl status bn-api bn-chat bn-frontend --no-pager"
```

## View Logs If Something Fails
```bash
ssh root@163.47.151.249 "journalctl -u bn-frontend --no-pager -n 30"
ssh root@163.47.151.249 "journalctl -u bn-api --no-pager -n 30"
ssh root@163.47.151.249 "journalctl -u bn-chat --no-pager -n 30"
```
