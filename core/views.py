from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import Http404

from accounts.decorators import student_required, mentor_required, approved_required
from accounts.models import CustomUser
from .models import StudentProfile, MentorProfile, Assignment, Application, Step, Comment, Document, Message
from .forms import (
    StudentProfileForm, MentorProfileForm,
    ApplicationForm, StepForm, CommentForm, DocumentForm, MessageForm,
)


# ─────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────

def _get_mentor_profile(user):
    try:
        return user.mentor_profile
    except MentorProfile.DoesNotExist:
        return None


def _get_student_profile(user):
    try:
        return user.student_profile
    except StudentProfile.DoesNotExist:
        return None


def _mentor_can_access_app(mentor_profile, application):
    """True if this application belongs to a student assigned to this mentor."""
    return Assignment.objects.filter(
        mentor=mentor_profile,
        student=application.student,
        is_active=True,
    ).exists()


def _mentor_can_access_step(mentor_profile, step):
    return _mentor_can_access_app(mentor_profile, step.application)


# ─────────────────────────────────────────────
#  Step A — Profile Views
# ─────────────────────────────────────────────

@login_required
@approved_required
@student_required
def student_profile_view(request):
    profile = get_object_or_404(StudentProfile, user=request.user)

    if request.method == 'POST':
        form = StudentProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated.")
            return redirect('core:student_profile')
    else:
        form = StudentProfileForm(instance=profile)

    assignment   = getattr(profile, 'assignment', None)
    applications = Application.objects.filter(student=profile).prefetch_related('steps').order_by('-created_at')

    return render(request, 'core/student_profile.html', {
        'form': form,
        'profile': profile,
        'assignment': assignment,
        'applications': applications,
    })


@login_required
@approved_required
@mentor_required
def mentor_profile_view(request):
    profile = get_object_or_404(MentorProfile, user=request.user)

    if request.method == 'POST':
        form = MentorProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated.")
            return redirect('core:mentor_profile')
    else:
        form = MentorProfileForm(instance=profile)

    assigned_students = Assignment.objects.filter(
        mentor=profile, is_active=True
    ).select_related('student__user')

    return render(request, 'core/mentor_profile.html', {
        'form': form,
        'profile': profile,
        'assigned_students': assigned_students,
    })


@login_required
@approved_required
@mentor_required
def mentor_view_student(request, student_id):
    """Mentor views a single assigned student's full profile."""
    mentor_profile = _get_mentor_profile(request.user)
    student_profile = get_object_or_404(StudentProfile, pk=student_id)

    if not Assignment.objects.filter(mentor=mentor_profile, student=student_profile, is_active=True).exists():
        messages.error(request, "You can only view profiles of your assigned students.")
        return redirect('core:mentor_profile')

    applications = Application.objects.filter(student=student_profile).prefetch_related('steps').order_by('-created_at')

    return render(request, 'core/mentor_view_student.html', {
        'student_profile': student_profile,
        'applications': applications,
    })


# ─────────────────────────────────────────────
#  Step B — Application
# ─────────────────────────────────────────────

@login_required
@approved_required
def application_list(request):
    user = request.user

    if user.is_student:
        profile = _get_student_profile(user)
        apps = Application.objects.filter(student=profile).order_by('-created_at') if profile else []
        return render(request, 'core/application_list.html', {'applications': apps, 'role': 'student'})

    if user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        student_ids = Assignment.objects.filter(mentor=mentor_profile, is_active=True).values_list('student_id', flat=True)
        apps = Application.objects.filter(student__id__in=student_ids).select_related('student__user').order_by('-created_at')
        return render(request, 'core/application_list.html', {'applications': apps, 'role': 'mentor'})

    if user.is_superadmin:
        apps = Application.objects.all().select_related('student__user').order_by('-created_at')
        return render(request, 'core/application_list.html', {'applications': apps, 'role': 'superadmin'})

    raise Http404


@login_required
@approved_required
@student_required
def application_create(request):
    profile = get_object_or_404(StudentProfile, user=request.user)

    if request.method == 'POST':
        form = ApplicationForm(request.POST)
        if form.is_valid():
            app = form.save(commit=False)
            app.student = profile
            app.save()
            messages.success(request, "Application created.")
            return redirect('core:application_detail', pk=app.pk)
    else:
        form = ApplicationForm()

    return render(request, 'core/application_form.html', {'form': form, 'action': 'Create'})


@login_required
@approved_required
def application_detail(request, pk):
    application = get_object_or_404(Application, pk=pk)
    user = request.user

    # ── access control ──
    if user.is_student:
        if application.student.user != user:
            messages.error(request, "Access denied.")
            return redirect('core:application_list')
    elif user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        if not _mentor_can_access_app(mentor_profile, application):
            messages.error(request, "You can only view applications of your assigned students.")
            return redirect('core:application_list')
    # superadmin: full access

    steps    = application.steps.order_by('order')
    comments = application.comments.select_related('author').order_by('created_at')
    documents = application.documents.select_related('uploaded_by').order_by('-created_at')

    comment_form  = CommentForm()
    document_form = DocumentForm()

    return render(request, 'core/application_detail.html', {
        'application': application,
        'steps': steps,
        'comments': comments,
        'documents': documents,
        'comment_form': comment_form,
        'document_form': document_form,
    })


@login_required
@approved_required
def application_comment_add(request, pk):
    application = get_object_or_404(Application, pk=pk)
    user = request.user

    if user.is_student and application.student.user != user:
        messages.error(request, "Access denied.")
        return redirect('core:application_list')
    if user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        if not _mentor_can_access_app(mentor_profile, application):
            messages.error(request, "Access denied.")
            return redirect('core:application_list')

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            c = form.save(commit=False)
            c.application = application
            c.author = user
            c.save()

    return redirect('core:application_detail', pk=pk)


@login_required
@approved_required
def application_document_upload(request, pk):
    application = get_object_or_404(Application, pk=pk)
    user = request.user

    if user.is_student and application.student.user != user:
        messages.error(request, "Access denied.")
        return redirect('core:application_list')
    if user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        if not _mentor_can_access_app(mentor_profile, application):
            messages.error(request, "Access denied.")
            return redirect('core:application_list')

    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            doc = form.save(commit=False)
            doc.application = application
            doc.uploaded_by = user
            doc.save()
            messages.success(request, "Document uploaded.")
        else:
            for field_errors in form.errors.values():
                for err in field_errors:
                    messages.error(request, err)

    return redirect('core:application_detail', pk=pk)


# ─────────────────────────────────────────────
#  Step C — Steps
# ─────────────────────────────────────────────

@login_required
@approved_required
@mentor_required
def step_add(request, app_pk):
    application = get_object_or_404(Application, pk=app_pk)
    mentor_profile = _get_mentor_profile(request.user)

    if not _mentor_can_access_app(mentor_profile, application):
        messages.error(request, "You can only add steps to your assigned students' applications.")
        return redirect('core:application_list')

    if request.method == 'POST':
        form = StepForm(request.POST)
        if form.is_valid():
            step = form.save(commit=False)
            step.application = application
            step.status = Step.STATUS_TODO
            step.save()
            messages.success(request, f"Step '{step.title}' added.")
            return redirect('core:application_detail', pk=app_pk)
    else:
        next_order = application.steps.count() + 1
        form = StepForm(initial={'order': next_order})

    return render(request, 'core/step_form.html', {
        'form': form,
        'application': application,
        'action': 'Add',
    })


@login_required
@approved_required
@mentor_required
def step_edit(request, pk):
    step = get_object_or_404(Step, pk=pk)
    mentor_profile = _get_mentor_profile(request.user)

    if not _mentor_can_access_step(mentor_profile, step):
        messages.error(request, "Access denied.")
        return redirect('core:application_list')

    if request.method == 'POST':
        form = StepForm(request.POST, instance=step)
        if form.is_valid():
            form.save()
            messages.success(request, "Step updated.")
            return redirect('core:application_detail', pk=step.application_id)
    else:
        form = StepForm(instance=step)

    return render(request, 'core/step_form.html', {
        'form': form,
        'application': step.application,
        'action': 'Edit',
    })


@login_required
@approved_required
@student_required
def step_submit(request, pk):
    """Student marks a step as submitted."""
    step = get_object_or_404(Step, pk=pk)
    if step.application.student.user != request.user:
        messages.error(request, "Access denied.")
        return redirect('core:application_list')

    if request.method == 'POST':
        if step.status in (Step.STATUS_TODO, Step.STATUS_NEEDS_REVISION):
            step.status = Step.STATUS_SUBMITTED
            step.save()
            messages.success(request, f"Step '{step.title}' marked as submitted.")
        else:
            messages.warning(request, "This step cannot be submitted in its current state.")

    return redirect('core:application_detail', pk=step.application_id)


@login_required
@approved_required
@mentor_required
def step_review(request, pk):
    """Mentor approves or marks a step as needing revision."""
    step = get_object_or_404(Step, pk=pk)
    mentor_profile = _get_mentor_profile(request.user)

    if not _mentor_can_access_step(mentor_profile, step):
        messages.error(request, "Access denied.")
        return redirect('core:application_list')

    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'approve' and step.status == Step.STATUS_SUBMITTED:
            step.status = Step.STATUS_APPROVED
            step.save()
            messages.success(request, f"Step '{step.title}' approved.")
        elif action == 'needs_revision' and step.status == Step.STATUS_SUBMITTED:
            step.status = Step.STATUS_NEEDS_REVISION
            step.save()
            messages.info(request, f"Step '{step.title}' marked as needing revision.")
        else:
            messages.warning(request, "Invalid action or step is not in Submitted state.")

    return redirect('core:application_detail', pk=step.application_id)


# ─────────────────────────────────────────────
#  Step D — Comments on Steps
# ─────────────────────────────────────────────

@login_required
@approved_required
def step_comment_add(request, pk):
    step = get_object_or_404(Step, pk=pk)
    user = request.user

    # Access check
    if user.is_student:
        if step.application.student.user != user:
            messages.error(request, "Access denied.")
            return redirect('core:application_list')
    elif user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        if not _mentor_can_access_step(mentor_profile, step):
            messages.error(request, "Access denied.")
            return redirect('core:application_list')

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            c = form.save(commit=False)
            c.step = step
            c.author = user
            c.save()

    return redirect('core:step_detail', pk=pk)


# ─────────────────────────────────────────────
#  Step E — Documents on Steps
# ─────────────────────────────────────────────

@login_required
@approved_required
def step_document_upload(request, pk):
    step = get_object_or_404(Step, pk=pk)
    user = request.user

    # Access check
    if user.is_student:
        if step.application.student.user != user:
            messages.error(request, "Access denied.")
            return redirect('core:application_list')
    elif user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        if not _mentor_can_access_step(mentor_profile, step):
            messages.error(request, "Access denied.")
            return redirect('core:application_list')

    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            doc = form.save(commit=False)
            doc.step = step
            doc.uploaded_by = user
            doc.save()
            messages.success(request, "Document uploaded.")
        else:
            for field_errors in form.errors.values():
                for err in field_errors:
                    messages.error(request, err)

    return redirect('core:step_detail', pk=pk)


@login_required
@approved_required
def document_delete(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    if doc.uploaded_by != request.user:
        messages.error(request, "You can only delete documents you uploaded.")
    elif request.method == 'POST':
        # Determine where to redirect before deleting
        if doc.step:
            redirect_url = ('core:step_detail', doc.step.pk)
        else:
            redirect_url = ('core:application_detail', doc.application.pk)
        # Remove file from disk
        if doc.file and doc.file.storage.exists(doc.file.name):
            doc.file.delete(save=False)
        doc.delete()
        messages.success(request, "Document deleted.")
        return redirect(redirect_url[0], pk=redirect_url[1])

    # Fallback: redirect back to wherever the doc belongs
    if doc.step:
        return redirect('core:step_detail', pk=doc.step.pk)
    return redirect('core:application_detail', pk=doc.application.pk)


@login_required
@approved_required
def step_detail(request, pk):
    step = get_object_or_404(Step, pk=pk)
    user = request.user

    if user.is_student:
        if step.application.student.user != user:
            raise Http404
    elif user.is_mentor:
        mentor_profile = _get_mentor_profile(user)
        if not _mentor_can_access_step(mentor_profile, step):
            raise Http404

    comments  = step.comments.select_related('author').order_by('created_at')
    documents = step.documents.select_related('uploaded_by').order_by('-created_at')

    return render(request, 'core/step_detail.html', {
        'step': step,
        'comments': comments,
        'documents': documents,
        'comment_form': CommentForm(),
        'document_form': DocumentForm(),
    })


# ─────────────────────────────────────────────
#  Chat: Mentor ↔ Superadmin
# ─────────────────────────────────────────────

@login_required
def chat_with_admin(request):
    """Mentor-side: opens the thread with the superadmin."""
    if not request.user.role == 'mentor':
        raise Http404

    try:
        admin_user = CustomUser.objects.filter(role='superadmin').first()
    except CustomUser.DoesNotExist:
        admin_user = None

    messages_qs = Message.objects.none()
    if admin_user:
        messages_qs = Message.objects.filter(
            sender=request.user, receiver=admin_user
        ) | Message.objects.filter(
            sender=admin_user, receiver=request.user
        )
        messages_qs = messages_qs.order_by('timestamp')
        # mark admin's messages as read
        messages_qs.filter(receiver=request.user, is_read=False).update(is_read=True)

    form = MessageForm()
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid() and admin_user:
            msg = form.save(commit=False)
            msg.sender   = request.user
            msg.receiver = admin_user
            msg.save()
            return redirect('core:chat_with_admin')

    return render(request, 'core/chat_thread.html', {
        'chat_messages': messages_qs,
        'form': form,
        'other_user': admin_user,
        'is_mentor_view': True,
    })


@login_required
def chat_inbox(request):
    """Superadmin-side: list of mentors who have messaged."""
    if not request.user.role == 'superadmin':
        raise Http404

    mentor_users = CustomUser.objects.filter(role='mentor')
    inbox = []
    for mentor in mentor_users:
        thread_exists = Message.objects.filter(
            sender=mentor, receiver=request.user
        ).exists() or Message.objects.filter(
            sender=request.user, receiver=mentor
        ).exists()
        if thread_exists:
            unread = Message.objects.filter(sender=mentor, receiver=request.user, is_read=False).count()
            last_msg = Message.objects.filter(
                sender=mentor, receiver=request.user
            ).union(
                Message.objects.filter(sender=request.user, receiver=mentor)
            ).order_by('-timestamp').first()
            inbox.append({'mentor': mentor, 'unread': unread, 'last_msg': last_msg})

    return render(request, 'core/chat_inbox.html', {'inbox': inbox})


@login_required
def chat_thread_admin(request, mentor_id):
    """Superadmin-side: view & reply in a thread with a specific mentor."""
    if not request.user.role == 'superadmin':
        raise Http404

    mentor_user = get_object_or_404(CustomUser, pk=mentor_id, role='mentor')
    messages_qs = (
        Message.objects.filter(sender=request.user, receiver=mentor_user) |
        Message.objects.filter(sender=mentor_user, receiver=request.user)
    ).order_by('timestamp')
    # mark mentor's messages as read
    messages_qs.filter(receiver=request.user, is_read=False).update(is_read=True)

    form = MessageForm()
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            msg = form.save(commit=False)
            msg.sender   = request.user
            msg.receiver = mentor_user
            msg.save()
            return redirect('core:chat_thread_admin', mentor_id=mentor_id)

    return render(request, 'core/chat_thread.html', {
        'chat_messages': messages_qs,
        'form': form,
        'other_user': mentor_user,
        'is_mentor_view': False,
        'mentor_id': mentor_id,
    })

