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
    
    def is_email_verified(self, user):
        return user.emailaddress_set.filter(verified=True).exists()
    
    def authenticate(self, request, **credentials):
        user = super().authenticate(request, **credentials)
        if user and not self.is_email_verified(user):
            return None
        return user