from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        user = emailconfirmation.email_address.user
        activate_url = f"{settings.FRONTEND_URL}/verify-email?key={emailconfirmation.key}"
        ctx = {
            "user": user,
            "activate_url": activate_url,
            "key": emailconfirmation.key,
        }
        message = render_to_string("account/email/email_confirmation_message.txt", ctx)
        subject = render_to_string("account/email/email_confirmation_subject.txt", ctx).strip()
        email = EmailMessage(subject, message, to=[user.email])
        email.send()
    
    def is_email_verified(self, request, email):
        """Check if email is verified"""
        from allauth.account.models import EmailAddress
        try:
            email_address = EmailAddress.objects.get(email=email)
            return email_address.verified
        except EmailAddress.DoesNotExist:
            return False