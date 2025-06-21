angular.module('todoApp', ['ngRoute', 'ngAnimate', 'ngAria', 'ngMessages', 'ui.sortable'])
    .filter('capitalize', function() {
        return function(input) {
            if (input) {
                return input.charAt(0).toUpperCase() + input.slice(1);
            }
            return input;
        };
    })
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/tasks'
            })
            .when('/tasks', {
                templateUrl: 'views/tasks.html',
                controller: 'TodoController',
                resolve: {
                    auth: function(AuthService) {
                        return AuthService.isAuthenticated();
                    }
                }
            })
            .when('/profile', {
                templateUrl: 'views/profile.html',
                controller: 'ProfileController',
                resolve: {
                    auth: function(AuthService) {
                        return AuthService.isAuthenticated();
                    }
                }
            })
            .otherwise({
                redirectTo: '/tasks'
            });
    })
    .run(function($rootScope) {
        $rootScope.isDarkMode = false;
    
        $rootScope.toggleDarkMode = function () {
            $rootScope.isDarkMode = !$rootScope.isDarkMode;
            localStorage.setItem('darkMode', $rootScope.isDarkMode);
        };
    
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            $rootScope.isDarkMode = JSON.parse(savedMode);
        }
    });