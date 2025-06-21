angular.module('todoApp').service('TodoService', function($http, $q, AuthService) {

    this.getTasks = function() {
        const deferred = $q.defer();
        const currentUser  = AuthService.getCurrentUser ();
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const userTasks = allTasks.filter(task => task.userId === currentUser .id);
        deferred.resolve(userTasks);
        return deferred.promise;
    };

    this.addTask = function(task) {
        const deferred = $q.defer();
        const currentUser  = AuthService.getCurrentUser ();
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const newTask = {
            ...task,
            id: Date.now(),
            userId: currentUser .id, // Ensure userId is set
            createdAt: new Date(),
            completed: false
        };
        allTasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(allTasks));
        deferred.resolve(newTask);
        return deferred.promise;
    };

    this.updateTask = function(task) {
        const deferred = $q.defer();
        const currentUser = AuthService.getCurrentUser();
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
        const taskIndex = allTasks.findIndex(t => t.id === task.id && t.userId === currentUser.id);
        
        if (taskIndex !== -1) {
            // Ensure userId and createdAt are preserved if not passed back in update
            task.userId = allTasks[taskIndex].userId;
            task.createdAt = allTasks[taskIndex].createdAt;
    
            allTasks[taskIndex] = task;
            localStorage.setItem('tasks', JSON.stringify(allTasks));
            deferred.resolve(task);
        } else {
            deferred.reject('Task not found or unauthorized');
        }
        
        return deferred.promise;
    };
    
    this.deleteTask = function(taskId) {
        const deferred = $q.defer();
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            allTasks.splice(taskIndex, 1);
            localStorage.setItem('tasks', JSON.stringify(allTasks));
            deferred.resolve();
        } else {
            deferred.reject('Task not found');
        }
        return deferred.promise;
    };
});