from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import CustomUser
from .models import StudentProfile, MentorProfile, Assignment, Application, Step, Comment, Document, Message
from .serializers import (
    StudentProfileSerializer, MentorProfileSerializer,
    AssignmentSerializer, ApplicationSerializer, ApplicationWriteSerializer,
    StepSerializer, CommentSerializer, DocumentSerializer, MessageSerializer,
)


# ── Helpers ────────────────────────────────────

def _student_profile(user):
    return StudentProfile.objects.filter(user=user).first()

def _mentor_profile(user):
    return MentorProfile.objects.filter(user=user).first()

def _mentor_can_access_app(mentor_profile, application):
    return Assignment.objects.filter(
        mentor=mentor_profile, student=application.student, is_active=True
    ).exists()

def _mentor_can_access_step(mentor_profile, step):
    return _mentor_can_access_app(mentor_profile, step.application)


# ── Profiles ───────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def student_profile_me(request):
    profile = get_object_or_404(StudentProfile, user=request.user)
    if request.method == 'GET':
        return Response(StudentProfileSerializer(profile, context={'request': request}).data)
    serializer = StudentProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def mentor_profile_me(request):
    profile = get_object_or_404(MentorProfile, user=request.user)
    if request.method == 'GET':
        return Response(MentorProfileSerializer(profile, context={'request': request}).data)
    serializer = MentorProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mentor_students(request):
    """Return all students assigned to the logged-in mentor."""
    if request.user.role != 'mentor':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    mentor_profile = _mentor_profile(request.user)
    assignments = Assignment.objects.filter(mentor=mentor_profile, is_active=True).select_related('student__user')
    students = [a.student for a in assignments]
    return Response(StudentProfileSerializer(students, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mentor_student_detail(request, student_id):
    """Mentor views a specific assigned student."""
    if request.user.role != 'mentor':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    mentor_profile = _mentor_profile(request.user)
    student_profile = get_object_or_404(StudentProfile, pk=student_id)
    if not Assignment.objects.filter(mentor=mentor_profile, student=student_profile, is_active=True).exists():
        return Response({'detail': 'Not your assigned student.'}, status=status.HTTP_403_FORBIDDEN)
    return Response(StudentProfileSerializer(student_profile, context={'request': request}).data)


# ── Assignments ────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assignment_list(request):
    if request.user.role != 'superadmin':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if request.method == 'GET':
        qs = Assignment.objects.select_related(
            'student__user', 'mentor__user', 'assigned_by'
        ).all()
        return Response(AssignmentSerializer(qs, many=True, context={'request': request}).data)
    # POST: create new assignment — frontend sends User IDs, not Profile PKs
    data = request.data
    try:
        student_profile = StudentProfile.objects.get(user_id=data.get('student_id'))
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Student profile not found for that user.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        mentor_profile = MentorProfile.objects.get(user_id=data.get('mentor_id'))
    except MentorProfile.DoesNotExist:
        return Response({'detail': 'Mentor profile not found for that user.'}, status=status.HTTP_400_BAD_REQUEST)
    assignment = Assignment.objects.create(
        student=student_profile,
        mentor=mentor_profile,
        assigned_by=request.user,
        notes=data.get('notes', ''),
    )
    return Response(AssignmentSerializer(assignment, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def assignment_detail(request, pk):
    if request.user.role != 'superadmin':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    assignment = get_object_or_404(Assignment, pk=pk)
    if request.method == 'PATCH':
        serializer = AssignmentSerializer(assignment, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    # DELETE → deactivate
    assignment.is_active = False
    assignment.save()
    return Response({'detail': 'Deactivated.'})


# ── Applications ───────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def application_list(request):
    user = request.user
    if user.role == 'student':
        profile = _student_profile(user)
        qs = Application.objects.filter(student=profile).prefetch_related('steps').order_by('-created_at')
    elif user.role == 'mentor':
        mentor_profile = _mentor_profile(user)
        student_ids = Assignment.objects.filter(mentor=mentor_profile, is_active=True).values_list('student_id', flat=True)
        qs = Application.objects.filter(student__id__in=student_ids).prefetch_related('steps').order_by('-created_at')
    else:  # superadmin
        qs = Application.objects.all().prefetch_related('steps').order_by('-created_at')

    if request.method == 'GET':
        return Response(ApplicationSerializer(qs, many=True, context={'request': request}).data)

    # POST — students only
    if user.role != 'student':
        return Response({'detail': 'Only students can create applications.'}, status=status.HTTP_403_FORBIDDEN)
    profile = _student_profile(user)
    write_ser = ApplicationWriteSerializer(data=request.data)
    write_ser.is_valid(raise_exception=True)
    app = write_ser.save(student=profile)
    return Response(ApplicationSerializer(app, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def application_detail(request, pk):
    application = get_object_or_404(Application, pk=pk)
    user = request.user

    # Access control
    if user.role == 'student' and application.student.user != user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'mentor':
        mentor_profile = _mentor_profile(user)
        if not _mentor_can_access_app(mentor_profile, application):
            return Response({'detail': 'Not your assigned student.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(ApplicationSerializer(application, context={'request': request}).data)

    # PATCH — superadmin/mentor can update status
    if user.role == 'student':
        return Response({'detail': 'Students cannot update application status.'}, status=status.HTTP_403_FORBIDDEN)
    allowed = ['status']
    data = {k: v for k, v in request.data.items() if k in allowed}
    for attr, value in data.items():
        setattr(application, attr, value)
    application.save()
    return Response(ApplicationSerializer(application, context={'request': request}).data)


# ── Comments ───────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def application_comment_add(request, pk):
    application = get_object_or_404(Application, pk=pk)
    user = request.user
    if user.role == 'student' and application.student.user != user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'mentor':
        if not _mentor_can_access_app(_mentor_profile(user), application):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = CommentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(author=user, application=application)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def step_comment_add(request, pk):
    step = get_object_or_404(Step, pk=pk)
    user = request.user
    if user.role == 'student' and step.application.student.user != user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'mentor':
        if not _mentor_can_access_step(_mentor_profile(user), step):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = CommentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(author=user, step=step)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Documents ──────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def application_document_upload(request, pk):
    application = get_object_or_404(Application, pk=pk)
    user = request.user
    if user.role == 'student' and application.student.user != user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'mentor':
        if not _mentor_can_access_app(_mentor_profile(user), application):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    uploaded_file = request.FILES.get('file')
    if uploaded_file and uploaded_file.size > 1_048_576:
        return Response({'detail': 'File size must not exceed 1 MB.'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = DocumentSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(uploaded_by=user, application=application)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def step_document_upload(request, pk):
    step = get_object_or_404(Step, pk=pk)
    user = request.user
    if user.role == 'student' and step.application.student.user != user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'mentor':
        if not _mentor_can_access_step(_mentor_profile(user), step):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    uploaded_file = request.FILES.get('file')
    if uploaded_file and uploaded_file.size > 1_048_576:
        return Response({'detail': 'File size must not exceed 1 MB.'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = DocumentSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(uploaded_by=user, step=step)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def document_delete(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    if doc.uploaded_by != request.user:
        return Response({'detail': 'You can only delete your own documents.'}, status=status.HTTP_403_FORBIDDEN)
    if doc.file and doc.file.storage.exists(doc.file.name):
        doc.file.delete(save=False)
    doc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Steps ──────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def step_add(request, app_pk):
    application = get_object_or_404(Application, pk=app_pk)
    if request.user.role != 'mentor':
        return Response({'detail': 'Only mentors can add steps.'}, status=status.HTTP_403_FORBIDDEN)
    mentor_profile = _mentor_profile(request.user)
    if not _mentor_can_access_app(mentor_profile, application):
        return Response({'detail': 'Not your assigned student.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = StepSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(application=application, status=Step.STATUS_TODO)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def step_detail(request, pk):
    step = get_object_or_404(Step, pk=pk)
    user = request.user
    if user.role == 'student' and step.application.student.user != user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'mentor' and not _mentor_can_access_step(_mentor_profile(user), step):
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if request.method == 'GET':
        return Response(StepSerializer(step, context={'request': request}).data)
    # PATCH — mentor only (title, description, order, due_date)
    if user.role != 'mentor':
        return Response({'detail': 'Only mentors can edit steps.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = StepSerializer(step, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def step_submit(request, pk):
    """Student marks a step as submitted."""
    step = get_object_or_404(Step, pk=pk)
    if request.user.role != 'student' or step.application.student.user != request.user:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    if step.status not in (Step.STATUS_TODO, Step.STATUS_NEEDS_REVISION):
        return Response({'detail': 'Step cannot be submitted in its current state.'}, status=status.HTTP_400_BAD_REQUEST)
    step.status = Step.STATUS_SUBMITTED
    step.save()
    return Response(StepSerializer(step).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def step_review(request, pk):
    """Mentor approves or marks step as needing revision. Body: { "action": "approve" | "needs_revision" }"""
    step = get_object_or_404(Step, pk=pk)
    if request.user.role != 'mentor':
        return Response({'detail': 'Only mentors can review steps.'}, status=status.HTTP_403_FORBIDDEN)
    if not _mentor_can_access_step(_mentor_profile(request.user), step):
        return Response({'detail': 'Not your assigned student.'}, status=status.HTTP_403_FORBIDDEN)
    if step.status != Step.STATUS_SUBMITTED:
        return Response({'detail': 'Step is not in Submitted state.'}, status=status.HTTP_400_BAD_REQUEST)
    action = request.data.get('action')
    if action == 'approve':
        step.status = Step.STATUS_APPROVED
    elif action == 'needs_revision':
        step.status = Step.STATUS_NEEDS_REVISION
    else:
        return Response({'detail': 'action must be "approve" or "needs_revision".'}, status=status.HTTP_400_BAD_REQUEST)
    step.save()
    return Response(StepSerializer(step).data)


# ── Messages ───────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_thread(request):
    """
    For mentor: returns thread with superadmin.
    For superadmin: requires ?mentor_id= query param.
    """
    user = request.user
    if user.role == 'mentor':
        other = CustomUser.objects.filter(role='superadmin').first()
    elif user.role == 'superadmin':
        mentor_id = request.query_params.get('mentor_id')
        if not mentor_id:
            return Response({'detail': 'mentor_id query param required.'}, status=status.HTTP_400_BAD_REQUEST)
        other = get_object_or_404(CustomUser, pk=mentor_id, role='mentor')
    else:
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    if not other:
        return Response([], status=status.HTTP_200_OK)

    messages = (
        Message.objects.filter(sender=user, receiver=other) |
        Message.objects.filter(sender=other, receiver=user)
    ).order_by('timestamp')
    # Mark messages from other as read
    messages.filter(receiver=user, is_read=False).update(is_read=True)
    return Response(MessageSerializer(messages, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_inbox(request):
    """Superadmin: returns list of mentors with message threads."""
    if request.user.role != 'superadmin':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    mentors = CustomUser.objects.filter(role='mentor')
    inbox = []
    for mentor in mentors:
        has_thread = (
            Message.objects.filter(sender=mentor, receiver=request.user).exists() or
            Message.objects.filter(sender=request.user, receiver=mentor).exists()
        )
        if has_thread:
            unread = Message.objects.filter(sender=mentor, receiver=request.user, is_read=False).count()
            from accounts.serializers import UserSerializer
            inbox.append({
                'mentor': UserSerializer(mentor).data,
                'unread': unread,
            })
    return Response(inbox)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def message_send(request):
    """
    Body: { "body": "...", "receiver_id": <int> }
    Only mentor→superadmin or superadmin→mentor.
    """
    user = request.user
    if user.role not in ('mentor', 'superadmin'):
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    receiver_id = request.data.get('receiver_id')
    body = request.data.get('body', '').strip()
    if not body:
        return Response({'detail': 'body is required.'}, status=status.HTTP_400_BAD_REQUEST)

    receiver = get_object_or_404(CustomUser, pk=receiver_id)
    # Validate the receiver role is the opposite
    if user.role == 'mentor' and receiver.role != 'superadmin':
        return Response({'detail': 'Mentors can only message the superadmin.'}, status=status.HTTP_400_BAD_REQUEST)
    if user.role == 'superadmin' and receiver.role != 'mentor':
        return Response({'detail': 'Admins can only message mentors here.'}, status=status.HTTP_400_BAD_REQUEST)

    msg = Message.objects.create(sender=user, receiver=receiver, body=body)
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
