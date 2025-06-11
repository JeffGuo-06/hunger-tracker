from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('muckd', '0012_add_location_sharing_settings'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='display_location',
            field=models.CharField(blank=True, max_length=100),
        ),
    ] 