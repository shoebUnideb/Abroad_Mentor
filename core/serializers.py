from rest_framework import serializers
from .models import StudentProfile, MentorProfile, Assignment, Application, Step, Comment, Document, Message
from accounts.serializers import UserSerializer


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'bio', 'phone', 'linkedin_url', 'profile_picture', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MentorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MentorProfile
        fields = ['id', 'user', 'bio', 'expertise', 'phone', 'linkedin_url', 'profile_picture', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AssignmentSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    mentor  = MentorProfileSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=StudentProfile.objects.all(), source='student', write_only=True
    )
    mentor_id = serializers.PrimaryKeyRelatedField(
        queryset=MentorProfile.objects.all(), source='mentor', write_only=True
    )

    class Meta:
        model = Assignment
        fields = [
            'id', 'student', 'mentor', 'assigned_by', 'notes', 'is_active', 'assigned_at', 'updated_at',
            'student_id', 'mentor_id',
        ]
        read_only_fields = ['id', 'student', 'mentor', 'assigned_by', 'assigned_at', 'updated_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'created_at', 'step', 'application']
        read_only_fields = ['id', 'author', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id', 'uploaded_by', 'title', 'file', 'file_url', 'created_at', 'step', 'application']
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'file_url', 'step', 'application']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class StepSerializer(serializers.ModelSerializer):
    comments  = CommentSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Step
        fields = [
            'id', 'application', 'title', 'description', 'order', 'status',
            'due_date', 'created_at', 'updated_at', 'comments', 'documents',
        ]
        read_only_fields = ['id', 'application', 'status', 'created_at', 'updated_at', 'comments', 'documents']


class ApplicationSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    steps   = StepSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'student', 'title', 'description', 'status',
            'created_at', 'updated_at', 'steps',
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at', 'steps']


class ApplicationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['title', 'description']


class MessageSerializer(serializers.ModelSerializer):
    sender   = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'body', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'receiver', 'timestamp', 'is_read']
