# Fix User Passwords

Delete existing users and re-insert them with correct `pbkdf2:sha256` password hashes.

## Step 1 — Delete old users

```bash
sudo -u postgres psql -d brighternepal -c "DELETE FROM users WHERE email IN ('admin@brighternepal.edu.np', 'aashish.maharjan@gmail.com');"
```

## Step 2 — Re-insert with correct hashes

```bash
cd /opt/brighternepal/brighter-nepal-api && source venv/bin/activate && python3 - << 'EOF'
from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash

app = create_app()
with app.app_context():
    u1 = User(name='Admin', email='admin@brighternepal.edu.np',
              role='admin', plan='paid', status='active', onboarding_completed=True)
    u1.password_hash = generate_password_hash('BrighterAdmin@2081', method='pbkdf2:sha256')
    u1.plain_password = 'BrighterAdmin@2081'
    db.session.add(u1)

    u2 = User(name='Aashish Maharjan', email='aashish.maharjan@gmail.com',
              role='student', plan='paid', status='active', onboarding_completed=True)
    u2.password_hash = generate_password_hash('Student@2081', method='pbkdf2:sha256')
    u2.plain_password = 'Student@2081'
    db.session.add(u2)

    db.session.commit()
    print("Admin check:", check_password_hash(u1.password_hash, 'BrighterAdmin@2081'))
    print("Student check:", check_password_hash(u2.password_hash, 'Student@2081'))
    print("✓ Done")
EOF
```

Expected output:
```
Admin check: True
Student check: True
✓ Done
```

## Step 3 — Restart API and test login

```bash
systemctl restart bn-api && sleep 3
curl -s -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brighternepal.edu.np","password":"BrighterAdmin@2081"}' | python3 -m json.tool
```

Expected: JSON response with `access_token` field.
