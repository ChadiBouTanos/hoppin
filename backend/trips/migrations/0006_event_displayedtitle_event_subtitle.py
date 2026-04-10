from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0005_event_eventregistration'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='displayedTitle',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='event',
            name='subtitle',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
