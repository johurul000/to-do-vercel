from django.urls import path
from .import views

urlpatterns = [
    path('', views.TodayView, name='today'),
    path('inbox/', views.InboxView, name='inbox'),
    path('upcoming/', views.UpcomingView, name='upcoming'),


    path('home/', views.Home, name='home'),
    path('signup/', views.SignUp, name='signup'),
    path('login/', views.LogIn, name='login'),
    path('login/', views.LogIn, name='login'),
    path('logout/', views.logOut, name='logout'),
    path('temp/', views.TempView, name='temp'),
    path('special/', views.specialPage, name='special-page'),


    path('add-task/', views.addTask, name='addTask'),
    path('edit-task/<int:task_id>/', views.editTask, name='editTask'),
    path('delete-task/<int:task_id>/', views.deleteTask, name='deleteTask'),
    path('update-task-status/', views.updateTaskStatus, name='update_task_status'),

]