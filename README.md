# Mentor Platform – Phase 1

## Setup Instructions

### 1. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate       # macOS / Linux
# venv\Scripts\activate        # Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your PostgreSQL credentials
```

### 4. Create the PostgreSQL database
```sql
CREATE DATABASE mentor_platform_db;
```

### 5. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a superadmin
```bash
python manage.py createsuperuser
# When prompted, set a username and password.
# Then log into /admin and set role=superadmin, is_approved=True for this user.
```
> **Tip:** You can also run this one-liner after setting up the DB:
> ```bash
> python manage.py shell -c "
> from accounts.models import CustomUser
> u = CustomUser.objects.create_superuser('admin', 'admin@example.com', 'admin123')
> u.role = 'superadmin'
> u.is_approved = True
> u.save()
> print('Superadmin created')
> "
> ```

### 7. Create a mentor (via Django Admin)
1. Go to `http://127.0.0.1:8000/admin/`
2. Log in with the superadmin account
3. Click **Accounts → Custom users → Add**
4. Set **role = Mentor** and **is_approved = True**
5. Set a username and password

### 8. Run the development server
```bash
python manage.py runserver
```

### URLs
| URL | Description |
|-----|-------------|
| `/` | Redirects to login |
| `/accounts/login/` | Login page (all roles) |
| `/accounts/logout/` | Log out |
| `/accounts/register/` | Student self-registration |
| `/accounts/dashboard/` | Role-aware dashboard redirect |
| `/accounts/dashboard/admin/` | Superadmin dashboard |
| `/accounts/dashboard/mentor/` | Mentor dashboard |
| `/accounts/dashboard/student/` | Student dashboard |
| `/admin/` | Django admin panel |

---

## Role Logic Summary

| Role | Registration | Login | Access |
|------|-------------|-------|--------|
| Superadmin | `createsuperuser` + set role | ✔ | All dashboards, Django admin |
| Mentor | Created by Superadmin in admin | Only if `is_approved=True` | Mentor dashboard only |
| Student | Self-register via `/accounts/register/` | ✔ (auto-approved) | Student dashboard only |



commands:   1. python3 manage.py runserver      Runs at: http://127.0.0.1:8000
            2. npm run dev                      Runs at: http://localhost:5173
            3. django admin panel               Runs at: http://127.0.0.1:8000/admin/
# Gile
