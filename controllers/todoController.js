angular.module('todoApp').controller('TodoController', function($scope, TodoService, AuthService) {
    $scope.tasks = [];
    $scope.editingTask = null;
    $scope.currentUser = AuthService.getCurrentUser();
    
    // Filter properties
    $scope.searchQuery = '';
    $scope.statusFilter = 'all';
    $scope.priorityFilter = 'all';
    $scope.sortBy = '-createdAt';

    // Load tasks from the service
    function loadTasks() {
        TodoService.getTasks().then(function(tasks) {
            $scope.tasks = tasks;
        });
    }

    // Initialize new task template
    function resetNewTask() {
        $scope.newTask = {
            title: '',
            description: '',
            dueDate: '',
            priority: 'low',
            tags: '',
            completed: false,
            isRecurring: false,
            recurrence: 'daily',
            subtasks: [],
            createdAt: new Date()
        };
    }

    // Add task using service
    $scope.addTask = function() {
        if ($scope.newTask.title) {
            // Set default values for recurring task if not provided
            if ($scope.newTask.isRecurring) {
                $scope.newTask.recurrence = $scope.newTask.recurrence || 'daily';
            } else {
                $scope.newTask.recurrence = null;
            }
            
            TodoService.addTask($scope.newTask).then(function(addedTask) {
                $scope.tasks.push(addedTask);
                resetNewTask();
            });
        }
    };

    // Edit task: open modal
    $scope.editTask = function(task) {
        $scope.editingTask = angular.copy(task);
        // Convert dueDate to the correct format for datetime-local input
        if ($scope.editingTask.dueDate) {
            $scope.editingTask.dueDate = new Date($scope.editingTask.dueDate).toISOString().slice(0, 16);
        }
        // Show the modal using Bootstrap's modal API
        const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        modal.show();
    };

    // Update task using service
    $scope.updateTask = function() {
        if ($scope.editingTask) {
            // Convert the dueDate back to a Date object
            if ($scope.editingTask.dueDate) {
                $scope.editingTask.dueDate = new Date($scope.editingTask.dueDate);
            }
            
            // Handle recurring task settings
            if (!$scope.editingTask.isRecurring) {
                $scope.editingTask.recurrence = null;
            }
            
            TodoService.updateTask($scope.editingTask)
                .then(function(response) {
                    // Update the task in the local tasks array
                    const index = $scope.tasks.findIndex(t => t.id === $scope.editingTask.id);
                    if (index !== -1) {
                        $scope.tasks[index] = angular.copy($scope.editingTask);
                    }
                    
                    // Close the modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
                    modal.hide();
                    
                    // Clear the editing task
                    $scope.editingTask = null;
                })
                .catch(function(error) {
                    console.error('Error updating task:', error);
                });
        }
    };

    // Delete task using service
    $scope.deleteTask = function(task) {
        if (confirm('Are you sure you want to delete this task?')) {
            TodoService.deleteTask(task.id).then(function() {
                const index = $scope.tasks.findIndex(t => t.id === task.id);
                if (index !== -1) {
                    $scope.tasks.splice(index, 1);
                }
            }).catch(function(error) {
                alert(error);
            });
        }
    };

    // Toggle completion using local scope + service update
    $scope.toggleComplete = function(task) {
        task.completed = !task.completed;
        TodoService.updateTask(task);
    };

    // Filter functions
    $scope.filterByStatus = function(task) {
        if ($scope.statusFilter === 'all') return true;
        if ($scope.statusFilter === 'completed') return task.completed;
        if ($scope.statusFilter === 'pending') return !task.completed;
        return true;
    };

    $scope.filterByPriority = function(task) {
        if ($scope.priorityFilter === 'all') return true;
        return task.priority === $scope.priorityFilter;
    };

    // Sort functions
    $scope.sortTasks = function(sortField) {
        if ($scope.sortBy === sortField) {
            $scope.sortBy = '-' + sortField;
        } else {
            $scope.sortBy = sortField;
        }
    };

    // Init
    resetNewTask();
    loadTasks();
});
