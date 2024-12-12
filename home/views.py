from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from home.models import Task
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.utils.dateformat import DateFormat
from datetime import timedelta
from home.forms import TaskForm
from collections import defaultdict




# Create your views here.

def SignUp(request):
    if request.method =='POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password01 = request.POST.get('password01')
        password02 = request.POST.get('password02')

        if User.objects.filter(username=username).exists():
            context ={
                'username': username,
                'email': email,
                'message':'Username already exists.'
            }
            return render(request,'home/signup.html',context)
        elif password01 != password02:
            context = {
                'username': username,
                'email': email,
                'password01': password01,
                "message": "Passwords do not match."
            }
            return render(request,"home/signup.html",context)
        
        user = User.objects.create_user(username=username, password=password01, email=email)
        user.save()
        return redirect('/login')
    
    return render(request, 'home/signup.html')

def LogIn(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('today')
        else:
            context = {
                'username': username,
                'password': password,
                'message': 'Invalid username or password'
            }
            return render(request, 'home/login.html', context)

            # messages.error(request, "")
    return render(request, 'home/login.html')

@login_required(login_url='login')
def Home(request):

    form = TaskForm()


    # Example: Get tasks that are not completed and due before a specific date
    # due_date = date(2024, 1, 31)  # Just an example date
    # remaining_tasks = Task.objects.filter(completed=False, due_date__lt=due_date)


    # Example: Get tasks that are not completed and are due after a specific date
    # upcoming_tasks = Task.objects.filter(completed=False, due_date__gt=due_date)


    remaining_tasks = Task.objects.filter(completed=False)
    completed_tasks = Task.objects.filter(completed=True)
    context = {
        'form': form,
        'remaining_tasks': remaining_tasks,
        'completed_tasks': completed_tasks
    }
    return render(request, 'home/home.html', context)

@login_required(login_url='login')
def addTask(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()
            return JsonResponse({'message': 'Task Added succesfully'})
        else:
            return JsonResponse({'error': form.errors}, status=400)
        
    return JsonResponse({'error': 'Invalid Request'}, status=400)


@login_required(login_url='login')
def editTask(request, task_id):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        task = get_object_or_404(Task, id=task_id)

        if task.user != request.user:
            return JsonResponse({'Error': 'Permission denied'}, status=403)
        form = TaskForm(request.POST, instance=task)

        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()
            return JsonResponse({'message': 'Task successfuly updated'})
        else:
            return JsonResponse({'error': form.errors}, status=400)
        
    else:
        return JsonResponse({'error': 'Invalid Request'}, status=400)


@login_required(login_url='login')
@require_POST
def deleteTask(request, task_id):
    task = get_object_or_404(Task, id=task_id)

    if task.user != request.user:
        return JsonResponse({'error': 'permission denied'})
    task.delete()
    return JsonResponse({'Success':'Task successfully deleted'})


@csrf_exempt
def updateTaskStatus(request):
    if request.method == 'POST':
        task_id = request.POST.get('task_id')
        completed = request.POST.get('completed') == 'True'

        task = Task.objects.get(id=task_id)
        task.completed = completed
        task.save()

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error'})


@login_required(login_url='login')
def TodayView(request):
    user = request.user

    today = timezone.localdate()

    form = TaskForm()
    remaining_tasks = Task.objects.filter(user=user, completed=False, due_date=today)

    context = {
        'form': form,
        'remaining_tasks': remaining_tasks,
        'username': user.username
    }

    return render(request, 'home/today.html', context)

@login_required(login_url='login')
def InboxView(request):
    user = request.user

    today = timezone.localdate()
    form = TaskForm()

    remaining_tasks = Task.objects.filter(user=user, completed=False, due_date__gte=today)
    overdue_tasks = Task.objects.filter(user=user, completed=False, due_date__lt=today)
    completed_tasks = Task.objects.filter(user=user, completed=True)



    context = {
        'form': form,
        'username': user.username,
        'remaining_tasks': remaining_tasks,
        'overdue_tasks': overdue_tasks,
        'completed_tasks': completed_tasks,
        'today': today,
    }

    return render(request, 'home/inbox.html', context)

@login_required(login_url='login')
def UpcomingView(request):

    user = request.user

    today = timezone.localdate()
    thirty_days_later = today + timedelta(days=10)
    datewise_tasks =  defaultdict(list)
    current_date = today

    form = TaskForm()

    while current_date <= thirty_days_later:
        due_date_str = DateFormat(current_date).format('d-m-y')
        datewise_tasks[due_date_str] = []
        current_date += timedelta(days=1)

    # datewise_tasks = Task.objects.filter(user=user, completed=False, due_date__gte=today)
    overdue_tasks = Task.objects.filter(user=user, completed=False, due_date__lt=today)
    completed_tasks = Task.objects.filter(user=user, completed=True)
    tasks =Task.objects.filter(user=user, completed=False, due_date__gte=today, due_date__lte=thirty_days_later)

    for task in tasks:

        due_date_str = DateFormat(task.due_date).format('d-m-y')

        datewise_tasks[due_date_str].append(task)

    

    # # print(datewise_tasks)
    # for date, tasks in datewise_tasks.items():
    #     print(f'Date: {date}')
    #     for task in tasks:
    #         print(task.name)
        

    # print(datewise_tasks)
    




    context = {
        'form': form,
        'username': user.username,
        'datewise_tasks': dict(datewise_tasks),
        'overdue_tasks': overdue_tasks,
        'completed_tasks': completed_tasks,
        'today': today,
    }

    return render(request, 'home/upcoming.html',context)


def logOut(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        logout(request)

        return JsonResponse({'message': 'logout successfull'})

def TempView(request):
    return render(request, 'home/temp2.html')

def specialPage(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print('username & pass: ', username, password)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('today')
        else:
            context = {
                'username': username,
                'password': password,
                'message': 'Invalid username or password'
            }
            return render(request, 'home/login.html', context)
    return render(request, 'home/special-page.html')