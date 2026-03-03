from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import StudentProfile, MentorProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_profile(sender, instance, created, **kwargs):
    """
    Automatically create a StudentProfile or MentorProfile
    when a user with the corresponding role is saved.
    """
    if instance.role == 'student':
        StudentProfile.objects.get_or_create(user=instance)
    elif instance.role == 'mentor':
        MentorProfile.objects.get_or_create(user=instance)
