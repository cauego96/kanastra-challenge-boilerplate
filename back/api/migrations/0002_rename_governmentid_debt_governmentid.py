# Generated by Django 5.0.6 on 2024-06-08 15:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='debt',
            old_name='governmentId',
            new_name='governmentID',
        ),
    ]
