from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0004_tripmatch'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('image_url', models.URLField(blank=True)),
                ('slug', models.SlugField(max_length=255, unique=True)),
                ('event_dates', models.JSONField(blank=True, default=list, help_text='Lista di date dell\'evento, es. ["2026-05-30", "2026-05-31", "2026-06-01"]')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EventRegistration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('driver', 'Driver'), ('passenger', 'Passenger')], max_length=20)),
                ('contact', models.CharField(help_text='Email o telefono', max_length=255)),
                ('departure_city', models.CharField(max_length=255)),
                ('event_date', models.CharField(blank=True, max_length=50)),
                ('available_seats', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='registrations', to='trips.event')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
