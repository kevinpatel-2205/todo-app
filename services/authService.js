angular.module('todoApp').service('AuthService', function($window, $q) {
    const userStorageKey = 'users';
    const currentUserKey = 'currentUser';

    // Register user (without logging in)
    this.register = function(data) {
        const deferred = $q.defer();
        if (data.name && data.email && data.password) {
            let users = JSON.parse($window.localStorage.getItem(userStorageKey)) || [];

            // Check if user already exists by email
            const existingUser = users.find(u => u.email === data.email);
            if (existingUser) {
                deferred.reject('Email already registered.');
                return deferred.promise;
            }

            const newUser = {
                id: Date.now(),
                name: data.name,
                email: data.email,
                password: data.password,
                createdAt: new Date()
            };

            users.push(newUser);
            $window.localStorage.setItem(userStorageKey, JSON.stringify(users));
            deferred.resolve('Registration successful. Please login.');
        } else {
            deferred.reject('Invalid registration data');
        }
        return deferred.promise;
    };

    // Login and set current user
    this.login = function(data) {
        const deferred = $q.defer();
        const users = JSON.parse($window.localStorage.getItem(userStorageKey)) || [];

        const matchedUser = users.find(u => u.email === data.email && u.password === data.password);
        if (matchedUser) {
            $window.localStorage.setItem(currentUserKey, JSON.stringify(matchedUser));
            deferred.resolve(matchedUser);
        } else {
            deferred.reject('Invalid email or password');
        }

        return deferred.promise;
    };

    // Logout
    this.logout = function() {
        $window.localStorage.removeItem(currentUserKey);
    };

    // Check if logged in
    this.isAuthenticated = function() {
        return !!$window.localStorage.getItem(currentUserKey);
    };

    // Get current logged-in user
    this.getCurrentUser = function() {
        const user = $window.localStorage.getItem(currentUserKey);
        return user ? JSON.parse(user) : null;
    };
});
