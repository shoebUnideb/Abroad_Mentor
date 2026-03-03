from django.contrib import admin
from .models import (
    StudentProfile, MentorProfile,
    Assignment, Application,
    Step, Comment, Document, Message,
)


# ---------------------------------------------------------------------------
# Inlines
# ---------------------------------------------------------------------------

class StepInline(admin.TabularInline):
    model = Step
    extra = 1
    fields = ('order', 'title', 'status', 'due_date')
    ordering = ('order',)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ('author', 'text', 'created_at')
    readonly_fields = ('created_at',)


class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0
    fields = ('title', 'file', 'uploaded_by', 'created_at')
    readonly_fields = ('created_at',)


# ---------------------------------------------------------------------------
# StudentProfile
# ---------------------------------------------------------------------------

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'get_email', 'phone', 'get_mentor', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone')
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email

    @admin.display(description='Assigned Mentor')
    def get_mentor(self, obj):
        if hasattr(obj, 'assignment') and obj.assignment.mentor:
            return obj.assignment.mentor.user.username
        return '—'


# ---------------------------------------------------------------------------
# MentorProfile
# ---------------------------------------------------------------------------

@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'get_email', 'expertise', 'get_student_count', 'created_at')
    search_fields = ('user__username', 'user__email', 'expertise')
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email

    @admin.display(description='Students Assigned')
    def get_student_count(self, obj):
        return obj.assignments.filter(is_active=True).count()


# ---------------------------------------------------------------------------
# Assignment
# ---------------------------------------------------------------------------

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display  = ('student', 'mentor', 'is_active', 'assigned_by', 'assigned_at')
    list_filter   = ('is_active', 'mentor')
    search_fields = (
        'student__user__username',
        'mentor__user__username',
    )
    autocomplete_fields = []
    readonly_fields = ('assigned_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        """Auto-fill assigned_by with the current superadmin."""
        if not obj.assigned_by_id:
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display  = ('title', 'student', 'status', 'created_at', 'updated_at')
    list_filter   = ('status',)
    search_fields = ('title', 'student__user__username')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [StepInline, CommentInline, DocumentInline]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Mentors should not have admin access; this guard is belt-and-braces
        if request.user.is_superuser or getattr(request.user, 'role', '') == 'superadmin':
            return qs
        return qs.none()


# ---------------------------------------------------------------------------
# Step
# ---------------------------------------------------------------------------

@admin.register(Step)
class StepAdmin(admin.ModelAdmin):
    list_display  = ('title', 'application', 'order', 'status', 'due_date')
    list_filter   = ('status',)
    search_fields = ('title', 'application__title')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CommentInline, DocumentInline]


# ---------------------------------------------------------------------------
# Comment
# ---------------------------------------------------------------------------

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display  = ('author', 'short_text', 'step', 'application', 'created_at')
    list_filter   = ('author',)
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description='Text')
    def short_text(self, obj):
        return obj.text[:60] + ('…' if len(obj.text) > 60 else '')


# ---------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ('title', 'uploaded_by', 'step', 'application', 'created_at')
    list_filter   = ('uploaded_by',)
    readonly_fields = ('created_at',)


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ('sender', 'receiver', 'body_preview', 'timestamp', 'is_read')
    list_filter   = ('is_read',)
    readonly_fields = ('sender', 'receiver', 'body', 'timestamp')

    def body_preview(self, obj):
        return obj.body[:60]
    body_preview.short_description = 'Message'
