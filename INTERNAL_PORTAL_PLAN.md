# GILE Internal Portal — Full Implementation Plan

## Context
The internal org portal shell already exists (shell layout, sidebar, topbar, notifications, role management, member access control). This plan covers building every feature described in the full spec — member-side onboarding experience, admin control plane, and all supporting systems — in 7 sequential phases. Each phase is independently deployable and leaves the system in a working state.

---

## Current State (Already Built)
- Shell: OrgShell, OrgTopbar, OrgSidebar (member/admin views), OrgNotificationBell
- Auth gate: OrgPortalRoute (has_internal_access), AppSwitcher
- Role CRUD: InternalRole model + full admin UI (OrgRoles page)
- Member access: OrgMember model + grant/revoke UI (OrgMembers page)
- Notifications: OrgNotification model + polling bell
- 15+ routes pointing to OrgComingSoon placeholders

---

## Phase 1 — Data Models & Migrations
**Goal:** Lay the entire database schema. No frontend work. Everything else builds on this.

### New Django Models (all in `org_portal/models.py`)

**Department**
```
name, description, head (FK CustomUser, null), parent (FK self, null), created_at
```

**OrgMember additions**
- Add `department (FK Department, null)`, `buddy (FK OrgMember, null)`, `manager (FK OrgMember, null)`, `employee_id (CharField, blank)`, `skills (JSONField, default=[])`, `emergency_contact_name`, `emergency_contact_phone`, `profile_completion_pct (IntegerField, default=0)`

**OnboardingTemplate**
```
name, description, department (FK, null), created_by (FK User), is_active (bool), created_at
```

**TaskTemplateItem**
```
template (FK OnboardingTemplate), title, description, task_type (info/form/upload/approval/meeting),
order (int), due_offset_days (int), required (bool), approval_required (bool),
assignee_type (new_hire/manager/buddy/hr/it/dept_admin), dependencies (M2M self)
```

**OnboardingInstance**
```
template (FK OnboardingTemplate, null), user (FK User, unique-ish), assigned_by (FK User),
start_date, due_date, status (pending/active/paused/completed/archived),
buddy (FK OrgMember, null), manager (FK OrgMember, null), created_at
```

**TaskInstance**
```
onboarding (FK OnboardingInstance), template_item (FK TaskTemplateItem, null),
title, description, task_type, due_date, status (not_started/in_progress/completed/overdue/blocked),
completed_at, attachment (FileField, null), notes, created_at
```

**DocumentTemplate**
```
name, category (required/policy/form/certificate), department (FK, null),
file (FileField), version (CharField), is_mandatory (bool),
requires_signature (bool), expiration_months (int, 0=never),
created_by (FK User), created_at
```

**MemberDocument**
```
user (FK User), template (FK DocumentTemplate, null), title, file (FileField),
category (CharField), status (assigned/uploaded/pending_review/approved/rejected),
reviewed_by (FK User, null), uploaded_at (auto), reviewed_at (null),
signed_at (null), expiration_date (null)
```

**TrainingCourse**
```
title, description, department (FK, null), thumbnail (ImageField, null),
is_mandatory (bool), pass_score (int 0-100), created_by (FK User), created_at
```

**TrainingModule** → `course (FK), title, order`

**TrainingLesson**
```
module (FK), title, lesson_type (video/pdf/quiz/assessment/external_link),
content_url (CharField), duration_minutes (int), order
```

**TrainingEnrollment**
```
user (FK), course (FK), enrolled_by (FK), status (enrolled/in_progress/completed/failed),
completion_date (null), score (null), certificate_issued (bool, default=False), enrolled_at (auto)
```

**LessonProgress** → `enrollment (FK), lesson (FK), completed (bool), completed_at (null)`

**Event**
```
title, description, event_type (orientation/welcome/training/webinar/checkin/meeting),
start_dt, end_dt, location (blank), virtual_link (blank), organizer (FK User),
is_recurring (bool), recurrence_rule (CharField, blank), created_by (FK User)
```

**EventAttendance**
```
event (FK), user (FK User), rsvp (accepted/declined/maybe/no_response),
attended (null bool)
```

**Contribution**
```
user (FK OrgMember), title, contribution_type (hours/task/deliverable),
hours (DecimalField, null), description, date, status (pending/approved/rejected),
approved_by (FK User, null), evidence_file (FileField, null), created_at
```

**CheckIn**
```
user (FK OrgMember), period_type (weekly/monthly), period_start, period_end,
responses (JSONField, default={}), submitted_at (auto), reviewed_by (FK User, null), reviewed_at (null)
```

**Resource**
```
title, description, category (handbook/guide/faq/policy/training_material),
file (FileField, null), external_url (blank), created_by (FK User), is_published (bool)
```

**AuditLog**
```
actor (FK User, null on_delete SET_NULL), action (create/update/delete/login/export/approve),
module (CharField), record_id (IntegerField, null), record_repr (CharField),
changes (JSONField, default={}), ip_address (GenericIPAddressField, null), created_at (auto)
Meta: ordering = ['-created_at'], db_index on (module, action, created_at)
```

### Migrations
- `0003_departments_and_onboarding.py` — Department, OnboardingTemplate, TaskTemplateItem, OnboardingInstance, TaskInstance, OrgMember additions
- `0004_documents_training.py` — DocumentTemplate, MemberDocument, TrainingCourse, TrainingModule, TrainingLesson, TrainingEnrollment, LessonProgress
- `0005_events_contributions_checkins.py` — Event, EventAttendance, Contribution, CheckIn
- `0006_resources_auditlog.py` — Resource, AuditLog

### Media / Storage
- `MEDIA_ROOT` already set in settings.py — confirm FileField upload paths:
  - `org_documents/` for MemberDocument.file
  - `doc_templates/` for DocumentTemplate.file
  - `training/` for lesson content
  - `evidence/` for Contribution.evidence_file

### Files to touch
- `org_portal/models.py` — add all models above
- `org_portal/admin.py` — register all new models
- `org_portal/migrations/0003–0006` (4 migration files)
- `mentor_platform/settings.py` — confirm MEDIA_ROOT / MEDIA_URL if not set

---

## Phase 2 — Departments & Enhanced Member Management
**Goal:** Admin can manage departments and view/edit enriched member profiles. Unlocks org-structure context for all later phases.

### Backend
New endpoints in `org_portal/api_views.py` + `org_portal/api_urls.py`:

| Method | URL | Purpose |
|--------|-----|---------|
| GET, POST | `/api/org/departments/` | List / Create |
| PATCH, DELETE | `/api/org/departments/<pk>/` | Update / Delete |
| GET | `/api/org/members/<pk>/profile/` | Extended member profile |
| PATCH | `/api/org/members/<pk>/profile/` | Update skills, buddy, manager, dept |

New serializers: `DepartmentSerializer` (with member count, sub-department count), `OrgMemberProfileSerializer`

Extend existing `OrgMemberSerializer` to include `department_name`.

### Frontend
**`OrgDepartments`** page (replaces OrgComingSoon at `/org/departments`):
- Department hierarchy list with expand/collapse
- Card per department: name, head, member count, sub-departments
- Create/edit modal (name, description, head search, parent department dropdown)
- Delete with guard (cannot delete if has members)

**`OrgMembers` enhancements:**
- Add department column + filter by department
- Side drawer for extended member profile (skills, buddy, manager, emergency contact)
- Bulk assign department action

### Notifications
- Add type `department_assigned` to OrgNotification choices and TYPE_COLOR/EMOJI maps in OrgNotificationBell.tsx

### Files to touch
- `org_portal/models.py` — already done in Phase 1
- `org_portal/serializers.py` — DepartmentSerializer, extended OrgMemberSerializer
- `org_portal/api_views.py` — DepartmentListView, DepartmentDetailView, MemberProfileView
- `org_portal/api_urls.py` — new patterns
- `frontend/src/internal/pages/OrgDepartments.tsx` — new page
- `frontend/src/internal/pages/OrgMembers.tsx` — enhancements
- `frontend/src/internal/api/orgApi.ts` — new API functions

---

## Phase 3 — Onboarding System (Core Feature)
**Goal:** Full onboarding pipeline. Admin builds templates → creates instances → member works through tasks.

### Backend

**Task Templates API** (`/api/org/task-templates/`):
- CRUD for OnboardingTemplate
- Nested CRUD for TaskTemplateItem (order, dependencies)
- `POST /api/org/task-templates/<pk>/clone/` — duplicate template
- `GET /api/org/task-templates/<pk>/preview/` — ordered task list

**Onboarding Instances API** (`/api/org/onboardings/`):
- `POST /` — create instance (select template, user, dates, buddy, manager)
- `GET /` — list all instances (admin) or own instance (member)
- `GET /<pk>/` — instance detail with all TaskInstances
- `PATCH /<pk>/` — pause / resume / complete / archive
- `GET /<pk>/tasks/` — ordered task list for the instance
- `PATCH /<pk>/tasks/<task_pk>/` — update task status, add attachment, notes
- Signal: auto-create TaskInstances when OnboardingInstance is created from template
- Signal: fire `checkin_due` OrgNotification when onboarding starts

**Stats endpoint:**
- `GET /api/org/onboardings/stats/` — counts by status (admin only)

### Frontend

**Admin: `OrgOnboardingMgmt`** (replaces OrgComingSoon at `/org/onboarding-mgmt`):
- Table of all onboarding instances
- Columns: Member, Template, Status (pill), Progress %, Start Date, Due Date, Manager, Actions
- Filter by status, department, template
- Create Onboarding modal:
  1. Select user (search box reusing `/api/org/search-users/`)
  2. Select template (dropdown)
  3. Set start_date, due_date, buddy, manager
- Click row → instance detail side drawer showing tasks with statuses
- Pause / Resume / Archive actions per instance

**Admin: `OrgTaskTemplates`** (replaces OrgComingSoon at `/org/task-templates`):
- Template cards: name, department, task count, created by
- Create/edit template modal
- Template detail view: ordered task list
- Add/edit/delete/reorder tasks (drag-handle reorder, saves order field)
- Task form: title, description, type dropdown, due_offset_days, required toggle, approval toggle, assignee_type

**Member: `OrgMyOnboarding`** (replaces existing placeholder):
- Stage progress bar at top: Profile → Documents → Training → Team Introduction → Completion
- Below: ordered task checklist grouped by stage
- Each task card: title, description, due date, status badge, type icon
- Task actions by type:
  - Info task: Mark as read button
  - Upload task: File upload with drag-drop
  - Form task: Embedded simple form fields
  - Approval task: Shows pending/approved/rejected state
  - Meeting task: Shows meeting details + join link

### Files to touch
- `org_portal/models.py` — (Phase 1 models used here)
- `org_portal/serializers.py` — OnboardingTemplateSerializer, TaskTemplateItemSerializer, OnboardingInstanceSerializer, TaskInstanceSerializer
- `org_portal/api_views.py` — all onboarding views + signals
- `org_portal/api_urls.py` — new URL patterns
- `frontend/src/internal/pages/OrgTaskTemplates.tsx` — new page
- `frontend/src/internal/pages/OrgOnboardingMgmt.tsx` — new page
- `frontend/src/internal/pages/OrgMyOnboarding.tsx` — full implementation
- `frontend/src/internal/api/orgApi.ts` — new API functions
- `frontend/src/internal/context/OrgContext.tsx` — expose `myOnboarding` data

---

## Phase 4 — Documents & Training
**Goal:** Document management pipeline and learning center. These often appear as tasks within onboarding.

### Backend — Documents

**Document Templates API** (`/api/org/doc-templates/`):
- CRUD for DocumentTemplate (file upload via multipart)
- `POST /api/org/doc-templates/<pk>/assign/` — assign to user(s) or department

**Member Documents API** (`/api/org/my-documents/`):
- `GET /` — my assigned documents
- `POST /<pk>/upload/` — upload file for an assigned document
- `POST /<pk>/sign/` — mark as signed (sets signed_at)
- Admin: `GET /api/org/documents/` — all documents with filters
- Admin: `PATCH /api/org/documents/<pk>/review/` — approve/reject with reviewer note

### Backend — Training

**Courses API** (`/api/org/courses/`):
- CRUD for TrainingCourse + nested modules + nested lessons
- `POST /api/org/courses/<pk>/enroll/` — enroll user(s)
- `POST /api/org/courses/<pk>/enroll-dept/` — enroll entire department

**Progress API:**
- `GET /api/org/my-training/` — enrolled courses with completion %
- `PATCH /api/org/my-training/<enrollment_pk>/lessons/<lesson_pk>/` — mark lesson complete
- Auto-complete enrollment when all lessons done; issue certificate flag

### Frontend

**Admin: `OrgDocTemplates`** (replaces OrgComingSoon at `/org/doc-templates`):
- Document template list: name, category, department, mandatory badge, version
- Upload modal (file drag-drop, category, department, mandatory toggle)
- Assign modal: search users or select department
- Version history panel per template

**Member: `OrgDocuments`** (replaces OrgComingSoon at `/org/documents`):
- Tabs: Required Documents | Uploaded Documents | Signed Documents
- Each document card: title, category, status badge, due date
- Upload button → file picker with validation
- Sign button → confirmation dialog (sets signed_at)
- Preview button → opens file in new tab
- Status badges: Assigned (gray), Uploaded (blue), Pending Review (amber), Approved (green), Rejected (red)

**Admin: `OrgTraining`** (replaces OrgComingSoon at `/org/training`):
- Course list: title, dept, enrolled count, completion %, mandatory badge
- Create course modal
- Course detail: modules accordion, add/edit/delete lessons per module
- Enroll users modal: search users or pick department
- Analytics tab: enrolled/completed/failed counts, average score

**Member: `OrgLearning`** (replaces OrgComingSoon at `/org/learning`):
- Tabs: All Courses | In Progress | Completed
- Course card: thumbnail, title, progress bar, status
- Course detail page: modules sidebar + lesson viewer (iframe/video embed)
- Lesson types: video (embed), PDF (iframe), quiz (multiple-choice form)
- Progress auto-saved on lesson completion
- Certificate download button when completed

### Files to touch
- `org_portal/serializers.py` — document + training serializers
- `org_portal/api_views.py` — DocumentTemplateView, MemberDocumentView, CourseView, EnrollmentView, ProgressView
- `org_portal/api_urls.py` — new patterns
- `frontend/src/internal/pages/OrgDocTemplates.tsx` — new
- `frontend/src/internal/pages/OrgDocuments.tsx` — new
- `frontend/src/internal/pages/OrgTraining.tsx` — new
- `frontend/src/internal/pages/OrgLearning.tsx` — new
- `frontend/src/internal/api/orgApi.ts` — additions

---

## Phase 5 — Events, Contributions & Check-ins
**Goal:** Member engagement features. Scheduling, contribution logging, and periodic reflections.

### Backend — Events

**Events API** (`/api/org/events/`):
- CRUD for Event (admin only for create/edit/delete)
- `GET /` — list (both admin and member see, filter by type/date)
- `POST /<pk>/rsvp/` — set RSVP status (member action)
- `PATCH /<pk>/attendance/` — mark attended (admin action)
- Signal: fire OrgNotification `checkin_due` type when event created and attendees assigned

### Backend — Contributions

**Contributions API** (`/api/org/contributions/`):
- `GET /` — member sees own; admin with `can_view_all_contributions` sees all
- `POST /` — member submits contribution
- `PATCH /<pk>/review/` — admin approves/rejects (fires `contribution_approved` notification)
- Stats endpoint: `GET /api/org/contributions/summary/` — total hours, projects, milestones

### Backend — Check-ins

**Check-ins API** (`/api/org/checkins/`):
- `GET /` — member sees own; admin sees all
- `POST /` — member submits check-in (period_type, responses JSON)
- `PATCH /<pk>/review/` — admin marks reviewed

### Frontend

**Admin + Member: `OrgEvents`** (replaces OrgComingSoon at `/org/events`):
- Calendar view (week/month toggle using simple grid, no external calendar lib)
- Event list below calendar: title, type badge, date, time, attendee count
- Admin only: Create Event button → modal (title, type, date/time/duration, location, virtual link, assign users/dept)
- Member: RSVP buttons (Accept / Decline / Maybe) per event card
- Event detail drawer: description, organizer, join link, attendee list

**Member: `OrgContributions`** (replaces existing placeholder):
- Log form at top: activity type, hours, title, description, date, optional file upload
- Contribution history table: date, activity, hours, status badge
- Impact summary cards: total hours, total projects

**Admin: Contributions tab on OrgMembers or separate view**: see all submissions, approve/reject

**Member: `OrgCheckins`** (replaces existing placeholder):
- Weekly/monthly toggle
- Form with structured questions:
  - What went well this week?
  - What challenges did you face?
  - What support do you need?
  - Any feedback to share?
- Past check-ins list: period, submitted date, reviewed status
- Monthly check-in: expanded form with additional questions

### Files to touch
- `org_portal/serializers.py` — Event, EventAttendance, Contribution, CheckIn serializers
- `org_portal/api_views.py` — EventView, ContributionView, CheckInView
- `org_portal/api_urls.py` — new patterns
- `frontend/src/internal/pages/OrgEvents.tsx` — new
- `frontend/src/internal/pages/OrgContributions.tsx` — full implementation
- `frontend/src/internal/pages/OrgCheckins.tsx` — full implementation
- `frontend/src/internal/api/orgApi.ts` — additions

---

## Phase 6 — Dashboards, Profile & Team Directory
**Goal:** Fill in the two most-visited pages (dashboards) and self-service member experience.

### Backend

**Admin Dashboard Stats** (`GET /api/org/admin-stats/`):
```json
{
  "onboarding": {"total": 0, "active": 0, "completed": 0, "overdue": 0, "avg_completion_pct": 0},
  "training": {"completion_pct": 0},
  "documents": {"completion_pct": 0},
  "active_members": 0,
  "funnel": {"invited": 0, "profile_completed": 0, ...},
  "overdue_tasks": [...],
  "upcoming_events": [...],
  "recent_joiners": [...]
}
```

**Member Dashboard Stats** (`GET /api/org/my-stats/`):
```json
{
  "progress_pct": 0,
  "tasks": {"completed": 0, "total": 0},
  "documents": {"completed": 0, "total": 0},
  "trainings": {"completed": 0, "total": 0},
  "due_today": {"tasks": [...], "documents": [...], "trainings": [...]},
  "upcoming_events": [...],
  "upcoming_deadlines": [...]
}
```

**Profile API** (`/api/org/my-profile/`):
- GET: returns OrgMember extended profile + CustomUser fields
- PATCH: update skills, interests, emergency contact, employee_id

**Directory API** (`GET /api/org/directory/`):
- Returns all active OrgMembers: name, role, department, avatar
- Query param: `?q=` search, `?dept=` filter

**My Team API** (`GET /api/org/my-team/`):
- Returns: manager OrgMember, buddy OrgMember, same-dept members list

### Frontend

**Admin: `OrgDashboard`** (replaces existing placeholder):
- Top row: 5 KPI stat cards (Total Onboardings, Active, Completed, Overdue, Avg Completion %)
- Onboarding funnel: horizontal progress stages with counts
- Two-column grid: Overdue Tasks table + Upcoming Events list
- Recent Joiners list
- Quick Action buttons: Create Onboarding, Add User, Schedule Event

**Member: `OrgDashboard`** (same route, different view based on `isSuperadmin || canManageMembers`):
- My Progress: circular progress widget + 3 completion bars (tasks/docs/trainings)
- Today's Actions: tasks due today, meetings today, docs awaiting signature
- Upcoming Deadlines: table with task name, due date, days remaining
- Upcoming Events: next 3 events with join links
- Quick Actions: Continue Onboarding, Upload Document, Start Training, Submit Reflection

**Member: `OrgProfile`** (replaces OrgComingSoon at `/org/settings` → actually separate route `/org/profile`):
- Two-column layout: avatar + basic info left | form right
- Personal: name (read-only from platform), email, phone, emergency contact
- Professional: department (read-only), role (read-only), start date
- Skills/interests: tag input
- Profile completion % bar
- Save button with success toast

**Member: `OrgDirectory`** (replaces OrgComingSoon at `/org/directory`):
- Search bar at top
- Department filter pills
- Member cards: avatar, name, role, department, email link

**Member: Team section** — simple cards on the Dashboard or My Onboarding page showing manager + buddy contact cards

### Files to touch
- `org_portal/api_views.py` — AdminStatsView, MyStatsView, MyProfileView, DirectoryView, MyTeamView
- `org_portal/serializers.py` — stats + profile serializers
- `org_portal/api_urls.py` — new patterns
- `frontend/src/internal/pages/OrgDashboard.tsx` — full implementation (admin + member views)
- `frontend/src/internal/pages/OrgProfile.tsx` — new page
- `frontend/src/internal/pages/OrgDirectory.tsx` — new page
- `frontend/src/router/AppRouter.tsx` — add `/org/profile` route
- `frontend/src/internal/layout/OrgSidebar.tsx` — replace `/org/settings` with `/org/profile` in MEMBER_NAV if needed
- `frontend/src/internal/api/orgApi.ts` — additions

---

## Phase 7 — Reports, Audit Logs, Resources & Polish
**Goal:** Admin analytics, compliance trail, and knowledge hub. Finishes the spec.

### Backend — Reports

**Reports API** (`/api/org/reports/`):
- `GET /onboarding/` — CSV/JSON of all onboarding instances with status breakdowns
- `GET /training/` — enrollment + completion + scores
- `GET /documents/` — uploaded/signed/missing per user
- `GET /department/` — per-department completion rates
- All endpoints accept `?format=csv` to stream downloadable CSV

### Backend — Audit Logging

**Auto-logging via Django signals:**
- On every `save()` and `delete()` of key models, write an AuditLog entry
- Capture: actor from request (middleware passes to signal), action, module name, record_id, JSON diff of changed fields
- `AuditLogMiddleware` — stores current user in thread-local so signals can read it

**Audit API** (`/api/org/audit/`):
- `GET /` — paginated list (superadmin only), filters: user, action, module, date range
- Returns: timestamp, actor, action, module, record, ip

### Backend — Resources

**Resources API** (`/api/org/resources/`):
- CRUD (admin manages), GET list (all internal members read)
- `GET /?search=` — full-text search on title + description

### Frontend

**Admin: `OrgAnalytics`** (replaces OrgComingSoon at `/org/analytics`):
- Report selector tabs: Onboarding | Training | Documents | Department
- Each tab: summary stat cards + table of records
- Export button (CSV download via `?format=csv`)
- Date range filter

**Admin: `OrgAudit`** (replaces OrgComingSoon at `/org/audit`):
- Table: Timestamp | Actor | Action | Module | Record | IP
- Filters: actor search, action dropdown, module dropdown, date range pickers
- Rows are read-only (no delete/edit)
- Export to CSV button

**Member + Admin: `OrgResources`** (replaces OrgComingSoon at `/org/help`):
- Search bar
- Category filter pills: Handbook | Guide | FAQ | Policy | Training Material
- Resource cards: title, description, category badge, download/open button

**Admin: `OrgSettings`** (replaces OrgComingSoon at `/org/settings`):
- Org Name, Logo upload
- Timezone, Date Format dropdowns
- Notification reminder rules (toggle defaults)
- Custom onboarding checklist questions (for check-ins)
- Backed by a simple `OrgSettings` singleton model: `GET/PATCH /api/org/settings/`

**Admin: `OrgIntegrations`** (replaces OrgComingSoon at `/org/integrations`):
- Static page listing integration categories (Identity, HRIS, Docs, Communication)
- Each integration: logo, name, status badge (Connected / Not Connected)
- "Coming Soon" state for all — no active implementation; this page is a UI stub

### Files to touch
- `org_portal/models.py` — OrgSettings singleton model
- `org_portal/middleware.py` — AuditLogMiddleware (new file)
- `org_portal/signals.py` — audit logging signals (new file)
- `org_portal/api_views.py` — ReportViews, AuditLogView, ResourceView, SettingsView
- `org_portal/api_urls.py` — new patterns
- `mentor_platform/settings.py` — add middleware
- `frontend/src/internal/pages/OrgAnalytics.tsx` — new
- `frontend/src/internal/pages/OrgAudit.tsx` — new
- `frontend/src/internal/pages/OrgResources.tsx` — new
- `frontend/src/internal/pages/OrgSettings.tsx` — new
- `frontend/src/internal/pages/OrgIntegrations.tsx` — stub page
- `frontend/src/internal/api/orgApi.ts` — additions

---

## Cross-Cutting Concerns (apply from Phase 2 onward)

### OrgNotification — new types to add each phase
| Phase | New Type | Trigger |
|-------|----------|---------|
| 2 | `department_assigned` | User added to a department |
| 3 | `onboarding_started` | Onboarding instance created for user |
| 3 | `task_assigned` | New task added to user's onboarding |
| 3 | `task_overdue` | Task passes due_date without completion |
| 4 | `document_approved` | Admin approves uploaded document |
| 4 | `document_rejected` | Admin rejects document |
| 4 | `training_assigned` | User enrolled in course |
| 5 | `event_scheduled` | User assigned to new event |
| 5 | `contribution_approved` | Contribution approved |
| 5 | `checkin_due` | Weekly/monthly check-in period starts |

Update `OrgNotificationBell.tsx` TYPE_COLOR and TYPE_EMOJI maps each phase.

### Pagination
All list endpoints that can grow (members, contributions, check-ins, audit logs, events) should use DRF's `PageNumberPagination` with `page_size=20`. Frontend uses infinite scroll or "Load more" button.

### File Upload
Use Django's default file storage. Accept: PDF, DOCX, PNG, JPG for documents. Accept: MP4, PDF for training lessons. Validate MIME type server-side. Max size: 20 MB.

### Error Handling Pattern (Frontend)
All new pages follow the existing pattern from OrgMembers:
- `loading` state → skeleton shimmer
- `error` state → inline error card with retry button
- Empty state → centered icon + message

---

## Verification Plan

### Phase 1 (DB)
- Run `python manage.py makemigrations && migrate` — zero errors
- Run `python manage.py shell` → import all new models, create test instances

### Phase 2 (Departments)
- Django admin → create department, assign head → verify member count computed
- Frontend `/org/departments` → create, edit, delete department
- OrgMembers page → filter by department

### Phase 3 (Onboarding)
- Admin: create template with 3 tasks of different types → create onboarding instance for a test user
- Member: log in as that test user → see tasks in My Onboarding → complete upload task → check status updates
- Verify OrgNotification fired on instance creation

### Phase 4 (Docs + Training)
- Admin: upload document template → assign to test user
- Member: see it in Documents → upload file → admin reviews → member sees Approved badge
- Admin: create course → add module → add 2 lessons → enroll test user
- Member: complete lessons → verify enrollment status = completed

### Phase 5 (Events + Contributions + Checkins)
- Admin: create event → assign users
- Member: RSVP → see in calendar
- Member: submit contribution → admin approves → notification fires
- Member: submit weekly check-in → verify stored in DB

### Phase 6 (Dashboards)
- Admin dashboard: verify all 5 KPI numbers match DB counts
- Member dashboard: verify progress % matches actual task completions
- Directory: search by name + filter by department

### Phase 7 (Reports + Audit)
- Admin: generate onboarding report → download CSV → verify correct columns
- Perform a create + update action on OrgMember → check AuditLog entry in DB and UI
- Resource: admin creates resource → member searches for it → finds it
