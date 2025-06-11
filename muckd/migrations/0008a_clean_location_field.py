from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('muckd', '0007a_alter_user_location_nullable'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                UPDATE muckd_user
                SET location = NULL
                WHERE location IS NOT NULL AND (
                    location LIKE '''%%'
                    OR location LIKE '{%%'
                );
            """,
            reverse_sql="""
                -- No reverse operation
            """
        ),
    ] 