
document.addEventListener('DOMContentLoaded', function(){
    const scrollContainer = document.querySelector('.inner_content')
    const scrollLeftBtn = document.getElementById('leftScroll')
    const scrollRightBtn = document.getElementById('rightScroll')

    function updateButtonStates() {
        const scrollLeft = scrollContainer.scrollLeft
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth

        scrollLeftBtn.disabled = scrollLeft == 0
        scrollRightBtn.disabled = scrollLeft >= maxScrollLeft
    }

    scrollLeftBtn.addEventListener('click', function(){
        scrollContainer.scrollBy({left: -900, behavior: 'smooth'})
    })

    scrollRightBtn.addEventListener('click', function(){
        scrollContainer.scrollBy({left: 900, behavior: 'smooth'})
    })

    updateButtonStates()

    scrollContainer.addEventListener('scroll', updateButtonStates)
})

document.addEventListener('DOMContentLoaded', function(){

    document.querySelectorAll('.menu').forEach(function(button){
        button.addEventListener('click', function(event){
            event.stopPropagation()
            expandMenu(this)
        })
    })

})

document.getElementById('hamburger-menu').addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar-container');
    sidebar.classList.toggle('active');
});

window.addEventListener('click', function(event){
    document.querySelectorAll('.select').forEach(function(menu){
        if(menu.style.display === 'block'){
            menu.style.display = 'none'
        }
    })
})


function expandMenu(buttonElement) {
    const menuId = buttonElement.getAttribute('data-menuid')
    const menuContent = document.getElementById(menuId)

    if (menuContent.style.display == 'none'|| menuContent.style.display === ''){
        menuContent.style.display = 'block'
    }
    else {
        menuContent.style.display = 'none'
    }
}


function setupUpcomingModel(modalId, buttonElement){
    var modal = document.getElementById(modalId);
    console.log('setupmodec current')
    modal.style.display = "block";

    var formInternalHTML = ``

    var currentDate = buttonElement.getAttribute('data-current-date')
    console.log('Current Date: ', currentDate)
    

    var dateParts = currentDate.split('-'); 
    var day = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[1], 10) - 1; 
    var year = parseInt(dateParts[2], 10);

    
    if (year < 100) {
        year += 2000;
    }

    var parsedDate = new Date(year, month, day);
    console.log('Parsed Date:', parsedDate);

    if (isNaN(parsedDate.getTime())) {
        console.error('Invalid Date Format');
    } else {
        
        var timezoneOffset = parsedDate.getTimezoneOffset() * 60000; 
        var adjustedDate = new Date(parsedDate.getTime() - timezoneOffset);

        
        var formattedDate = adjustedDate.toISOString().slice(0, 10);
        console.log('Formatted Date:', formattedDate);
    }

    formInternalHTML = `
    <div class="form-group">
        
        <input type="text" name="task_name" maxlength="200" class="task-name-class" placeholder="Task Name" required="" id="id_task_name">
    </div>
    <div class="form-group">
        
        <textarea name="description" cols="40" rows="4" class="description-class" placeholder="Description" id="id_description"></textarea>
    </div>
    <div class="form-group">
        
        <input type="date" name="due_date" class="due-date-class" placeholder="Due Date" id="id_due_date" value="${formattedDate}">
    </div>
    `

    $('#addCurrentFormDiv').html(formInternalHTML)

    var span = modal.getElementsByClassName("close")[0]

    span.onclick = function() {
        modal.style.display = "none"
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

}


function setupModal(modalId, isEdit, buttonElement) {
    var modal = document.getElementById(modalId);

    console.log(document.getElementById(modalId))
    console.log(modalId)

    modal.style.display = "block";

    if(isEdit){
        console.log('In edit mode')

        var taskId = buttonElement.getAttribute('data-task-id')
        var taskName = buttonElement.getAttribute('data-task-name')
        var description = buttonElement.getAttribute('data-task-description')
        var dueDate = buttonElement.getAttribute('data-due-date')
        var parsedDate = new Date(dueDate)

        var timezoneOffset = parsedDate.getTimezoneOffset() * 60000; // Convert offset to milliseconds
        var adjustedDate = new Date(parsedDate.getTime() - timezoneOffset);

        var formattedDate = adjustedDate.toISOString().slice(0, 10);
        
        console.log('Due Date:', dueDate)
        console.log('Parsed Date:',parsedDate)
        console.log('Formatted Date:', formattedDate)

        // console.log(taskName)
        // console.log(description)

        // console.log('code population start')
        var formInternalHTML = `
            <div class="form-group">
                <input 
                    type="text" 
                    name="task_name" 
                    maxlength="200" 
                    class="task-name-class" 
                    placeholder="Task Name" 
                    required="" 
                    id="id_task_name" 
                    value="${taskName}">
            </div>

            <div class="form-group">
                <textarea 
                    name="description" 
                    cols="40" 
                    rows="10" 
                    class="description-class" 
                    placeholder="Description" 
                    id="id_description">${description}</textarea>
            </div>

            <div class="form-group">
                <input 
                    type="date" 
                    name="due_date" 
                    class="due-date-class" 
                    placeholder="Due Date" 
                    id="id_due_date" 
                    value="${formattedDate}">
            </div>

           
            <button 
                type="submit" 
                id="editTask" 
                class="submit-btn"
                value="${taskId}">
                Edit Task
            </button>
            
        `

        $('#editFormDiv').html(formInternalHTML)

    }
    else {
        console.log('In Add mode')
    }

    var span = modal.getElementsByClassName("close")[0];

    span.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function updateTaskStatus(checkbox) {
    taskId = checkbox.id.replace("task_", "")
    var csrftoken = getCookie('csrftoken');
    var checkbox = document.getElementById('task_' + taskId);
    var completed = checkbox.checked ? 'True' : 'False';

    // jQuery AJAX request
    $.ajax({
        url: '/update-task-status/',
        type: 'POST',
        data: {
            'task_id': taskId,
            'completed': completed,
            'csrfmiddlewaretoken': csrftoken
        },
        success: function(response) {
            // Handle successful response
            console.log("Task status updated.");
            window.location.reload(true)
        },
        error: function(error) {
            // Handle error
            console.error("Error updating task status.");
        }
    });

}



$(document).ready(function(){
    $('#addTask').click(function(){
        $.ajax({
            type: 'POST',
            url: '/add-task/',
            data: {
                'task_name': $('#id_task_name').val(),
                'description': $('#id_description').val(),
                'due_date': $('#id_due_date').val(),
                'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(response){
                console.log(response.message)
            },
            error: function(response){
                console.log(response.error)
            }

        })
    })
})

$(document).ready(function(){
    $('#editInternal').on('submit', function(e){
        e.preventDefault()

        var formData = $(this).serialize()
        var taskId = $('#editTask').val()

        $.ajax({
            type: 'POST',
            url: '/edit-task/' + taskId + '/',
            data: formData,
            success: function(response){
                console.log("Successfully updated")
                window.location.reload(true)
            },
            error: function(response){
                alert("Error updating the task, please try again.")
            }

        })
    })
})


$(document).ready(function(){
    $('#addCurrentInternal').on('submit', function(e){
        e.preventDefault()

        var formData = $(this).serialize()
        // var taskId = $('#editTask').val()

        $.ajax({
            type: 'POST',
            url: '/add-task/',
            data: formData,
            success: function(response){
                console.log("Successfully updated")
                window.location.reload(true)
            },
            error: function(response){
                alert("Error updating the task, please try again.")
            }

        })
    })
})

function deleteTask(buttonElement){

    if(!window.confirm('Are you sure you wnat to delete the task?')){
        return
    }

    var csrfToken = buttonElement.getAttribute('data-csrf')
    var taskId = buttonElement.getAttribute('data-task-id')
    
    $.ajax({
        type: 'POST',
        url: '/delete-task/' + taskId + '/',
        data: {
            'csrfmiddlewaretoken': csrfToken
        },
        success: function(response){
            console.log('successfully deleted')
            window.location.reload()
        },
        error: function(response){
            console.log(response.error)
        }
    })


}

function logOut(buttonElement){

    if(!window.confirm('Are you sure you wnat to logout?')){
        return
    }

    var csrfToken = buttonElement.getAttribute('data-csrf')
    
    $.ajax({
        type: 'POST',
        url: '/logout/',
        data: {
            'csrfmiddlewaretoken': csrfToken
        },
        success: function(response){
            console.log('successfully deleted')
            window.location.reload()
        },
        error: function(response){
            console.log(response.error)
        }
    })


}


var collapseButtons = document.querySelectorAll('.collapseButton')

collapseButtons.forEach(function(button){
    button.addEventListener('click', function(){
        var contentId = this.getAttribute('data-target')
        var content = document.getElementById(contentId)


        collapseButtons.forEach(function(otherButton){
            if(otherButton !== button){
                var otherContentId = otherButton.getAttribute('data-target')
                var otherContent = document.getElementById(otherContentId)
                otherContent.style.display = 'none'

                otherButton.innerHTML = `
                    <svg width="24" height="24">
                        <path fill="none" stroke="currentColor" transform="rotate(-90 12 12)" d="m16 10-4 4-4-4"></path>
                    </svg>
                `
            }
        })


        if(content.style.display == 'none'){
            content.style.display = 'flex'
            this.innerHTML = `
                <svg width="24" height="24"><path fill="none" stroke="currentColor" d="m16 10-4 4-4-4"></path></svg>
            `
        } else {
            content.style.display = 'none'
            this.innerHTML = `
                <svg width="24" height="24">
                    <path fill="none" stroke="currentColor" transform="rotate(-90 12 12)" d="m16 10-4 4-4-4"></path>
                </svg>
            `
        }
    })
})