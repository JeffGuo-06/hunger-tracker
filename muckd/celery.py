import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'muckd.settings.production')

app = Celery('muckd')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Configure Celery to use Redis as the message broker
app.conf.broker_url = 'redis://muckd-redis.4ikzba.0001.use2.cache.amazonaws.com:6379/0'
app.conf.result_backend = 'redis://muckd-redis.4ikzba.0001.use2.cache.amazonaws.com:6379/0'

# Configure task settings
app.conf.task_serializer = 'json'
app.conf.accept_content = ['json']
app.conf.result_serializer = 'json'
app.conf.timezone = 'UTC'
app.conf.enable_utc = True

# Task routing
app.conf.task_routes = {
    'muckd.tasks.*': {'queue': 'muckd'},
}

app.conf.worker_concurrency = 1

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r} v3') 