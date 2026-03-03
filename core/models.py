from django.db import models
from django.conf import settings


# ---------------------------------------------------------------------------
# 1. StudentProfile
# ---------------------------------------------------------------------------

class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        limit_choices_to={'role': 'student'},
    )
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    linkedin_url = models.URLField(blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/students/', blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.username}"

    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        ordering = ['user__username']


# ---------------------------------------------------------------------------
# 2. MentorProfile
# ---------------------------------------------------------------------------

class MentorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentor_profile',
        limit_choices_to={'role': 'mentor'},
    )
    bio = models.TextField(blank=True)
    expertise = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    linkedin_url = models.URLField(blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/mentors/', blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mentor: {self.user.username}"

    class Meta:
        verbose_name = 'Mentor Profile'
        verbose_name_plural = 'Mentor Profiles'
        ordering = ['user__username']


# ---------------------------------------------------------------------------
# 3. Assignment  (student ↔ mentor, created by superadmin)
# ---------------------------------------------------------------------------

class Assignment(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='assignment',
    )
    mentor = models.ForeignKey(
        MentorProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assignments',
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assignments_made',
        limit_choices_to={'role': 'superadmin'},
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        mentor_name = self.mentor.user.username if self.mentor else "Unassigned"
        return f"{self.student.user.username} → {mentor_name}"

    class Meta:
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        ordering = ['-assigned_at']


# ---------------------------------------------------------------------------
# 4. Application
# ---------------------------------------------------------------------------

class Application(models.Model):
    STATUS_PENDING  = 'pending'
    STATUS_REVIEW   = 'under_review'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = (
        (STATUS_PENDING,  'Pending'),
        (STATUS_REVIEW,   'Under Review'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    )

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.get_status_display()}] {self.title} – {self.student.user.username}"

    class Meta:
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
        ordering = ['-created_at']


# ---------------------------------------------------------------------------
# 5. Step
# ---------------------------------------------------------------------------

class Step(models.Model):
    STATUS_TODO          = 'todo'
    STATUS_SUBMITTED     = 'submitted'
    STATUS_APPROVED      = 'approved'
    STATUS_NEEDS_REVISION = 'needs_revision'
    STATUS_CHOICES = (
        (STATUS_TODO,           'To Do'),
        (STATUS_SUBMITTED,      'Submitted'),
        (STATUS_APPROVED,       'Approved'),
        (STATUS_NEEDS_REVISION, 'Needs Revision'),
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='steps',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Step {self.order}: {self.title} ({self.application.title})"

    class Meta:
        verbose_name = 'Step'
        verbose_name_plural = 'Steps'
        ordering = ['application', 'order']


# ---------------------------------------------------------------------------
# 6. Comment
# ---------------------------------------------------------------------------

class Comment(models.Model):
    # A comment can be on a Step OR directly on an Application
    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='comments',
    )
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='comments',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        target = f"Step: {self.step}" if self.step else f"Application: {self.application}"
        return f"Comment by {self.author.username} on {target}"

    class Meta:
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        ordering = ['created_at']


# ---------------------------------------------------------------------------
# 7. Document
# ---------------------------------------------------------------------------

class Document(models.Model):
    # A document can be attached to a Step OR directly to an Application
    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='documents',
    )
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='documents',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = f"Step: {self.step}" if self.step else f"Application: {self.application}"
        return f"{self.title} (uploaded by {self.uploaded_by.username} on {target})"

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']


# ---------------------------------------------------------------------------
# 8. Message  (mentor ↔ superadmin direct chat)
# ---------------------------------------------------------------------------

class Message(models.Model):
    sender   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages',
    )
    body      = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read   = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}: {self.body[:40]}"

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['timestamp']
