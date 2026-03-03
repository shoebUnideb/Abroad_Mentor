from django.urls import path
from . import api_views

urlpatterns = [
    # Profiles
    path('student/profile/',          api_views.student_profile_me,         name='api_student_profile'),
    path('mentor/profile/',           api_views.mentor_profile_me,          name='api_mentor_profile'),
    path('mentor/students/',          api_views.mentor_students,            name='api_mentor_students'),
    path('mentor/students/<int:student_id>/', api_views.mentor_student_detail, name='api_mentor_student_detail'),

    # Assignments
    path('assignments/',              api_views.assignment_list,            name='api_assignment_list'),
    path('assignments/<int:pk>/',     api_views.assignment_detail,          name='api_assignment_detail'),

    # Applications
    path('applications/',             api_views.application_list,           name='api_application_list'),
    path('applications/<int:pk>/',    api_views.application_detail,         name='api_application_detail'),
    path('applications/<int:pk>/comments/',  api_views.application_comment_add,  name='api_application_comment'),
    path('applications/<int:pk>/documents/', api_views.application_document_upload, name='api_application_doc'),
    path('applications/<int:app_pk>/steps/', api_views.step_add,            name='api_step_add'),

    # Steps
    path('steps/<int:pk>/',           api_views.step_detail,                name='api_step_detail'),
    path('steps/<int:pk>/submit/',    api_views.step_submit,                name='api_step_submit'),
    path('steps/<int:pk>/review/',    api_views.step_review,                name='api_step_review'),
    path('steps/<int:pk>/comments/',  api_views.step_comment_add,           name='api_step_comment'),
    path('steps/<int:pk>/documents/', api_views.step_document_upload,       name='api_step_doc'),

    # Documents
    path('documents/<int:pk>/',       api_views.document_delete,            name='api_document_delete'),

    # Messages
    path('messages/',                 api_views.message_thread,             name='api_message_thread'),
    path('messages/send/',            api_views.message_send,               name='api_message_send'),
    path('messages/inbox/',           api_views.message_inbox,              name='api_message_inbox'),
]
