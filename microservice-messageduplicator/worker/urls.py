from django.urls import include, path

from . import views

urlpatterns = [
    path('work', views.work, name='work'),
    path('', views.index, name='index'),
]