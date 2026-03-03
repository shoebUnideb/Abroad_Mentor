from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # ── Profiles
    path('profile/student/',                  views.student_profile_view,      name='student_profile'),
    path('profile/mentor/',                   views.mentor_profile_view,       name='mentor_profile'),
    path('students/<int:student_id>/profile/', views.mentor_view_student,      name='view_student_profile'),

    # ── Applications
    path('applications/',                     views.application_list,          name='application_list'),
    path('applications/create/',              views.application_create,        name='application_create'),
    path('applications/<int:pk>/',            views.application_detail,        name='application_detail'),
    path('applications/<int:pk>/comment/',    views.application_comment_add,   name='application_comment_add'),
    path('applications/<int:pk>/document/',   views.application_document_upload, name='application_document_upload'),

    # ── Steps
    path('applications/<int:app_pk>/steps/add/', views.step_add,              name='step_add'),
    path('steps/<int:pk>/',                   views.step_detail,               name='step_detail'),
    path('steps/<int:pk>/edit/',              views.step_edit,                 name='step_edit'),
    path('steps/<int:pk>/submit/',            views.step_submit,               name='step_submit'),
    path('steps/<int:pk>/review/',            views.step_review,               name='step_review'),
    path('steps/<int:pk>/comment/',           views.step_comment_add,          name='step_comment_add'),
    path('steps/<int:pk>/document/',          views.step_document_upload,      name='step_document_upload'),

    # ── Documents
    path('documents/<int:pk>/delete/',        views.document_delete,           name='document_delete'),

    # ── Chat (Mentor ↔ Admin)
    path('chat/',                             views.chat_with_admin,           name='chat_with_admin'),
    path('chat/inbox/',                       views.chat_inbox,                name='chat_inbox'),
    path('chat/<int:mentor_id>/',             views.chat_thread_admin,         name='chat_thread_admin'),
]
