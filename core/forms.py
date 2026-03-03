from django import forms
from .models import StudentProfile, MentorProfile, Application, Step, Comment, Document, Message


class StudentProfileForm(forms.ModelForm):
    class Meta:
        model  = StudentProfile
        fields = ('bio', 'phone', 'linkedin_url', 'profile_picture')
        widgets = {
            'bio': forms.Textarea(attrs={'class': 'form-input', 'rows': 4, 'placeholder': 'Tell us about yourself…'}),
            'phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '+1 234 567 8900'}),
            'linkedin_url': forms.URLInput(attrs={'class': 'form-input', 'placeholder': 'https://linkedin.com/in/…'}),
            'profile_picture': forms.ClearableFileInput(attrs={'class': 'form-input'}),
        }


class MentorProfileForm(forms.ModelForm):
    class Meta:
        model  = MentorProfile
        fields = ('bio', 'expertise', 'phone', 'linkedin_url', 'profile_picture')
        widgets = {
            'bio': forms.Textarea(attrs={'class': 'form-input', 'rows': 4, 'placeholder': 'Your background and approach…'}),
            'expertise': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. Web Development, Data Science'}),
            'phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '+1 234 567 8900'}),
            'linkedin_url': forms.URLInput(attrs={'class': 'form-input', 'placeholder': 'https://linkedin.com/in/…'}),
            'profile_picture': forms.ClearableFileInput(attrs={'class': 'form-input'}),
        }


class ApplicationForm(forms.ModelForm):
    class Meta:
        model  = Application
        fields = ('title', 'description')
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Application title'}),
            'description': forms.Textarea(attrs={'class': 'form-input', 'rows': 5, 'placeholder': 'Describe your application…'}),
        }


class StepForm(forms.ModelForm):
    class Meta:
        model  = Step
        fields = ('title', 'description', 'order', 'due_date')
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Step title'}),
            'description': forms.Textarea(attrs={'class': 'form-input', 'rows': 4, 'placeholder': 'What should the student do?'}),
            'order': forms.NumberInput(attrs={'class': 'form-input', 'min': 0}),
            'due_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
        }


class CommentForm(forms.ModelForm):
    class Meta:
        model   = Comment
        fields  = ('text',)
        widgets = {
            'text': forms.Textarea(attrs={
                'class': 'form-input', 'rows': 2, 'placeholder': 'Type a message…',
                'style': 'resize:none;',
            }),
        }


class DocumentForm(forms.ModelForm):
    class Meta:
        model   = Document
        fields  = ('title', 'file')
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Document name'}),
            'file': forms.ClearableFileInput(attrs={'class': 'form-input'}),
        }

    def clean_file(self):
        f = self.cleaned_data.get('file')
        if f and f.size > 1 * 1024 * 1024:  # 1 MB
            raise forms.ValidationError('File size must not exceed 1 MB.')
        return f


class MessageForm(forms.ModelForm):
    class Meta:
        model   = Message
        fields  = ('body',)
        widgets = {
            'body': forms.Textarea(attrs={
                'class': 'form-input',
                'rows': 3,
                'placeholder': 'Type your message…',
            }),
        }
        labels = {'body': ''}
