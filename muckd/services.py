import random
from django.conf import settings
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

def generate_verification_code():
    return ''.join(random.choices('0123456789', k=6))

def send_verification_sms(phone_number, verification_code):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f'Your verification code is: {verification_code}',
            from_=settings.TWILIO_PHONE_NUMBER,
            to=str(phone_number)
        )
        return True
    except TwilioRestException as e:
        print(f"Twilio error: {e}")
        return False 