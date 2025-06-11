from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('muckd', '0006_alter_post_image_alter_profile_profile_image_comment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='location',
            field=models.CharField(max_length=100, null=True, blank=True, default=None),
        ),
    ] 