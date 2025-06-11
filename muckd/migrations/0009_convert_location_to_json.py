from django.db import migrations
import json

def convert_location_to_json(apps, schema_editor):
    User = apps.get_model('muckd', 'User')
    for user in User.objects.all():
        if user.location is None or user.location == "unset location":
            user.location = None
        elif isinstance(user.location, str):
            # Try to parse as JSON, otherwise wrap as {"address": ...}
            try:
                user.location = json.loads(user.location)
            except Exception:
                user.location = {"address": user.location}
        user.save()

def convert_json_to_location(apps, schema_editor):
    User = apps.get_model('muckd', 'User')
    for user in User.objects.all():
        if user.location is None:
            user.location = "unset location"
        else:
            # Convert the JSON object back to a string
            user.location = user.location.get("address", "unset location")
        user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('muckd', '0008_alter_user_location'),
    ]

    operations = [
        migrations.RunPython(convert_location_to_json, convert_json_to_location),
    ] 