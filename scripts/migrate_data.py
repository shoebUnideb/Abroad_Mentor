#!/usr/bin/env python3
"""
migrate_data.py — Copy data from the monolith (mentor_platform_db) into the
three new split databases (gile_auth, gile_public, gile_internal).

Strategy:
  1. Dump relevant tables from the monolith using pg_dump --data-only.
  2. Before loading, TRUNCATE target tables with CASCADE + RESTART IDENTITY
     so sequences reset and there are no duplicate-key conflicts.
  3. Load the dump via psql.
  4. Reset all sequences to the max ID so future inserts don't collide.

Key insight — django_content_type:
  gile_public and gile_internal were migrated fresh, so their content_type
  IDs may differ from the monolith's. We copy the monolith's
  django_content_type + auth_permission into every target DB first, which
  keeps GenericFK references (e.g. core_notification.content_type_id) valid.
"""

import subprocess
import sys

SOURCE = 'mentor_platform_db'
DATABASES = {
    'auth':     'gile_auth',
    'public':   'gile_public',
    'internal': 'gile_internal',
}

# ── Table groups ──────────────────────────────────────────────────────────────

# Shared infrastructure tables that every DB needs (copied from monolith)
INFRA = [
    'django_content_type',
    'auth_group',
    'auth_group_permissions',
    'auth_permission',
]

# Accounts tables (accounts_ssocode is new — not in monolith, skip)
ACCOUNTS = [
    'accounts_customuser',
    'accounts_customuser_groups',
    'accounts_customuser_user_permissions',
]

TOKEN = [
    'token_blacklist_outstandingtoken',
    'token_blacklist_blacklistedtoken',
]

SESSION = ['django_session']

CORE = [
    'core_studentprofile',
    'core_mentorprofile',
    'core_assignment',
    'core_message',
    'core_contactrequest',
    'core_block',
    'core_post',
    'core_postcomment',
    'core_postreaction',
    'core_postbookmark',
    'core_profileview',
    'core_notification',
    'core_mentorrating',
    'core_mentoravailabilityslot',
    'core_session',
    'core_personaltask',
    'core_workspace',
    'core_workspacemembership',
    'core_workspacementor',
    'core_workspaceonboardingquestion',
    'core_workspaceonboardinganswer',
    'core_workspaceresource',
    'core_workspaceevent',
    'core_workspacechatchannel',
    'core_workspacechatmessage',
    'core_workspacechatreaction',
    'core_workspacedmmessage',
    'core_workspacepoll',
    'core_workspacepolloption',
    'core_workspacepolloption_voters',
    'core_workspacetask',
    'core_workspacetask_assigned_members',
    'core_workspacetaskdeliverable',
    'core_workspacetaskdeliverablecheck',
    'core_workspacetaskdocument',
    'core_workspacetaskcomment',
    'core_workspacetaskmentornote',
    'core_workspacetaskstatusevent',
    'core_workspacetasksubmission',
    'core_workspacetaskprerequisite',
    'core_workspacetaskrubriccriteria',
    'core_workspacetaskrubricscore',
    'core_workspacetasksection',
    'core_workspacetaskselfassessquestion',
    'core_workspacetaskselfassessresponse',
    'core_workspacetaskpeerreview',
    'core_workspacetaskpeerreviewscore',
    'core_documentinlinecomment',
]

ORG = [
    'org_portal_internalrole',
    'org_portal_department',
    'org_portal_orgsettings',
    'org_portal_orgmember',
    'org_portal_orgnotification',
    'org_portal_onboardingtemplate',
    'org_portal_tasktemplateitem',
    'org_portal_tasktemplateitem_dependencies',
    'org_portal_onboardinginstance',
    'org_portal_taskinstance',
    'org_portal_templateformfield',
    'org_portal_taskformfield',
    'org_portal_taskformresponse',
    'org_portal_taskcomment',
    'org_portal_documenttemplate',
    'org_portal_memberdocument',
    'org_portal_memberagreementsignature',
    'org_portal_orgagreement',
    'org_portal_standaloneform',
    'org_portal_standaloneformfield',
    'org_portal_standaloneformresponse',
    'org_portal_formdistribution',
    'org_portal_formdistribution_members',
    'org_portal_formsubmission',
    'org_portal_trainingcourse',
    'org_portal_trainingmodule',
    'org_portal_traininglesson',
    'org_portal_trainingenrollment',
    'org_portal_lessonprogress',
    'org_portal_lessonsubmission',
    'org_portal_quizquestion',
    'org_portal_quizoption',
    'org_portal_event',
    'org_portal_event_assigned_members',
    'org_portal_eventattendance',
    'org_portal_eventsettings',
    'org_portal_eventtypeconfig',
    'org_portal_orgchatchannel',
    'org_portal_orgchatchannelmember',
    'org_portal_orgchatmessage',
    'org_portal_orgchatpoll',
    'org_portal_orgchatpolloption',
    'org_portal_orgchatpolloption_voters',
    'org_portal_orgchatreaction',
    'org_portal_orgdmmessage',
    'org_portal_contribution',
    'org_portal_checkin',
    'org_portal_recruitmentrequest',
    'org_portal_accessrequest',
    'org_portal_extensionrequest',
    'org_portal_resource',
    'org_portal_auditlog',
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def run(cmd, input_data=None, check=True):
    result = subprocess.run(
        cmd, shell=True, input=input_data,
        capture_output=True, text=True,
    )
    if check and result.returncode != 0:
        print(f'\n  ERROR running: {cmd}')
        print(f'  stderr: {result.stderr[:500]}')
        sys.exit(1)
    return result


def tables_in_db(db):
    """Return set of tables that actually exist in the given database."""
    r = run(f"psql -d {db} -t -c \"SELECT tablename FROM pg_tables WHERE schemaname='public';\"")
    return {t.strip() for t in r.stdout.splitlines() if t.strip()}


def dump_tables(src_db, tables):
    """pg_dump --data-only for the given tables. Returns SQL bytes."""
    existing = tables_in_db(src_db)
    to_dump = [t for t in tables if t in existing]
    if not to_dump:
        return b''
    flags = ' '.join(f'-t {t}' for t in to_dump)
    cmd = f'pg_dump {src_db} --data-only --no-acl --no-owner --disable-triggers {flags}'
    r = run(cmd)
    return r.stdout.encode()


def truncate(db, tables):
    """TRUNCATE all tables in reverse-dependency order using CASCADE."""
    existing = tables_in_db(db)
    to_trunc = [t for t in tables if t in existing]
    if not to_trunc:
        return
    # Truncate all at once with CASCADE so FK deps are handled
    joined = ', '.join(to_trunc)
    sql = f'TRUNCATE {joined} RESTART IDENTITY CASCADE;'
    run(f"psql -d {db} -c \"{sql}\"")


def load(db, sql_bytes):
    if not sql_bytes:
        return
    run(f'psql -d {db} --quiet', input_data=sql_bytes.decode())


def reset_sequences(db):
    """Set all sequences to max(id)+1 in their owning table."""
    sql = """
DO $$
DECLARE
  r RECORD;
  max_val BIGINT;
  seq_name TEXT;
BEGIN
  FOR r IN
    SELECT s.relname AS seq, t.relname AS tbl, a.attname AS col
    FROM pg_class s
    JOIN pg_depend d ON d.objid = s.oid AND d.classid = 'pg_class'::regclass
    JOIN pg_class t  ON d.refobjid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    WHERE s.relkind = 'S' AND t.relkind = 'r'
  LOOP
    EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', r.col, r.tbl) INTO max_val;
    EXECUTE format('SELECT setval(%L, GREATEST(%s, 1))', r.seq, max_val);
  END LOOP;
END
$$;
"""
    run(f"psql -d {db}", input_data=sql)


# ── Main migration ────────────────────────────────────────────────────────────

def migrate_auth():
    db = DATABASES['auth']
    tables = INFRA + ACCOUNTS + TOKEN + SESSION
    print(f'\n=== {db}: truncating {len(tables)} tables ===')
    truncate(db, tables)
    print(f'    dumping from {SOURCE}...')
    sql = dump_tables(SOURCE, tables)
    print(f'    loading {len(sql):,} bytes...')
    load(db, sql)
    reset_sequences(db)
    print(f'    done.')


def migrate_public():
    db = DATABASES['public']
    # infra + accounts (shadow) + all core tables
    tables = INFRA + ACCOUNTS + CORE
    print(f'\n=== {db}: truncating {len(tables)} tables ===')
    truncate(db, tables)
    print(f'    dumping from {SOURCE}...')
    sql = dump_tables(SOURCE, tables)
    print(f'    loading {len(sql):,} bytes...')
    load(db, sql)
    reset_sequences(db)
    print(f'    done.')


def migrate_internal():
    db = DATABASES['internal']
    # infra + accounts (shadow) + all org_portal tables
    tables = INFRA + ACCOUNTS + ORG
    print(f'\n=== {db}: truncating {len(tables)} tables ===')
    truncate(db, tables)
    print(f'    dumping from {SOURCE}...')
    sql = dump_tables(SOURCE, tables)
    print(f'    loading {len(sql):,} bytes...')
    load(db, sql)
    reset_sequences(db)
    print(f'    done.')


if __name__ == '__main__':
    print('Starting data migration from mentor_platform_db → split databases')
    print('=' * 65)
    migrate_auth()
    migrate_public()
    migrate_internal()
    print('\n✓ All done. Verify with: psql -d <db> -c "SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC;"')
