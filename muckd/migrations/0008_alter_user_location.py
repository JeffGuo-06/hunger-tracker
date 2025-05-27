from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('muckd', '0008a_clean_location_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='location',
            field=models.JSONField(blank=True, null=True),
        ),
    ] 