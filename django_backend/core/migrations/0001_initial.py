# Generated by Django 5.2.1 on 2025-05-20 22:32

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='WebhookEventLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('event_type', models.CharField(max_length=255)),
                ('payload', models.JSONField()),
                ('status', models.CharField(choices=[('success', 'Success'), ('failed', 'Failed'), ('pending', 'Pending')], max_length=50)),
                ('error_message', models.TextField(blank=True, null=True)),
                ('processed_entity_id', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('github_id', models.CharField(db_index=True, max_length=255, unique=True)),
                ('username', models.CharField(max_length=255, unique=True)),
                ('email', models.EmailField(blank=True, max_length=255, null=True, unique=True)),
                ('is_admin', models.BooleanField(default=False)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('github_access_token', models.TextField(blank=True, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Repository',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('github_native_id', models.IntegerField(blank=True, db_index=True, null=True, unique=True)),
                ('repo_name', models.CharField(max_length=255)),
                ('repo_url', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('coding_standards', models.JSONField(blank=True, null=True)),
                ('code_metrics', models.JSONField(blank=True, null=True)),
                ('llm_preference', models.CharField(blank=True, max_length=255, null=True)),
                ('webhook_url', models.CharField(blank=True, max_length=255, null=True)),
                ('webhook_secret', models.CharField(blank=True, max_length=255, null=True)),
                ('webhook_last_event_at', models.DateTimeField(blank=True, null=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repositories', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Repositories',
                'unique_together': {('owner', 'repo_name')},
            },
        ),
        migrations.CreateModel(
            name='PullRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('pr_github_id', models.IntegerField(unique=True)),
                ('pr_number', models.IntegerField()),
                ('title', models.CharField(max_length=255)),
                ('author_github_id', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('open', 'Open'), ('closed', 'Closed'), ('merged', 'Merged')], max_length=50)),
                ('url', models.CharField(max_length=255)),
                ('body', models.TextField(blank=True, null=True)),
                ('head_sha', models.CharField(blank=True, max_length=255, null=True)),
                ('base_sha', models.CharField(blank=True, max_length=255, null=True)),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pull_requests', to='core.repository')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Commit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('commit_hash', models.CharField(max_length=255)),
                ('author_github_id', models.CharField(blank=True, max_length=255, null=True)),
                ('committer_github_id', models.CharField(blank=True, max_length=255, null=True)),
                ('message', models.TextField()),
                ('url', models.CharField(blank=True, max_length=255, null=True)),
                ('timestamp', models.DateTimeField(blank=True, null=True)),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commits', to='core.repository')),
            ],
            options={
                'unique_together': {('repository', 'commit_hash')},
            },
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('failed', 'Failed'), ('processing', 'Processing'), ('pending_analysis', 'Pending Analysis')], max_length=50)),
                ('review_data', models.JSONField(blank=True, null=True)),
                ('commit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='core.commit')),
                ('parent_review', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='child_reviews', to='core.review')),
                ('pull_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='core.pullrequest')),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='core.repository')),
            ],
        ),
        migrations.CreateModel(
            name='LLMUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('llm_model', models.CharField(max_length=255)),
                ('input_tokens', models.IntegerField()),
                ('output_tokens', models.IntegerField()),
                ('cost', models.FloatField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='llm_usages', to=settings.AUTH_USER_MODEL)),
                ('review', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='llm_usages', to='core.review')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ReviewFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('rating', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('feedback', models.TextField()),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feedbacks', to='core.review')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='review_feedbacks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Thread',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(default='open', max_length=20)),
                ('langgraph_thread_id', models.CharField(blank=True, max_length=255, null=True)),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='threads', to='core.review')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('comment', models.TextField()),
                ('comment_data', models.JSONField(blank=True, null=True)),
                ('type', models.CharField(choices=[('request', 'Request'), ('response', 'Response'), ('note', 'Note')], max_length=50)),
                ('parent_comment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='replies', to='core.comment')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL)),
                ('thread', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='core.thread')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RepoCollaborator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('role', models.CharField(choices=[('owner', 'Owner'), ('contributor', 'Contributor'), ('member', 'Member'), ('admin', 'Admin'), ('pull', 'Pull'), ('push', 'Push')], max_length=50)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repo_collaborations', to=settings.AUTH_USER_MODEL)),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaborators', to='core.repository')),
            ],
            options={
                'unique_together': {('repository', 'user')},
            },
        ),
        migrations.AddConstraint(
            model_name='review',
            constraint=models.CheckConstraint(condition=models.Q(('pull_request__isnull', False), ('commit__isnull', False), _connector='OR'), name='check_review_context'),
        ),
    ]
