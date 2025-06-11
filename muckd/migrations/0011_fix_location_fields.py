from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('muckd', '0010_merge_20250526_2257'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='location',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_location_update',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ] 