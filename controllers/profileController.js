    angular.module('todoApp').service('AuthService', function($window, $q) {
        const storageKey = 'currentUser';

        this.login = function(data) {
            const deferred = $q.defer();
            const registeredUser = JSON.parse($window.localStorage.getItem(storageKey));
            if (
                registeredUser &&
                data.email === registeredUser.email &&
                data.password === registeredUser.password
            ) {
                deferred.resolve(registeredUser);
            } else {
                deferred.reject('Invalid email or password');
            }
            return deferred.promise;
        };

        this.register = function(data) {
            const deferred = $q.defer();
            if (data.name && data.email && data.password) {
                const user = {
                    id: Date.now(),
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    createdAt: new Date(),
                    emailNotifications: true
                };
                $window.localStorage.setItem(storageKey, JSON.stringify(user));
                deferred.resolve(user);
            } else {
                deferred.reject('Invalid registration data');
            }
            return deferred.promise;
        };

        this.logout = function() {
            $window.localStorage.removeItem(storageKey);
        };

        this.isAuthenticated = function() {
            return !!$window.localStorage.getItem(storageKey);
        };

        this.getCurrentUser = function() {
            const user = $window.localStorage.getItem(storageKey);
            return user ? JSON.parse(user) : null;
        };

        this.updateProfile = function(userData) {
            const deferred = $q.defer();
            try {
                if (!userData || !userData.email) {
                    throw new Error('Invalid profile data');
                }

                // Get current user data
                const currentUser = this.getCurrentUser();
                if (!currentUser) {
                    throw new Error('User not found');
                }

                // Update user data
                const updatedUser = {
                    ...currentUser,
                    name: userData.name,
                    email: userData.email,
                    emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : currentUser.emailNotifications
                };

                // Only update password if it was changed
                if (userData.password) {
                    updatedUser.password = userData.password;
                }

                // Save updated user
                $window.localStorage.setItem(storageKey, JSON.stringify(updatedUser));
                deferred.resolve(updatedUser);
            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        };

        this.deleteAccount = function(userId) {
            $window.localStorage.removeItem(storageKey);
            const allTasks = JSON.parse($window.localStorage.getItem('tasks')) || [];
            const updatedTasks = allTasks.filter(task => task.userId !== userId);
            $window.localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        };
    });

angular.module('todoApp').controller('ProfileController', function($scope, AuthService) {
    // Initialize user data
    $scope.currentUser = AuthService.getCurrentUser();
    $scope.isEditing = false;
    $scope.isLoading = false;
    $scope.error = null;
    $scope.success = null;
    $scope.isDarkMode = false;

    // Initialize task statistics
    $scope.taskStats = {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0
    };

    // Start editing profile
    $scope.startEditing = function() {
        $scope.isEditing = true;
        $scope.editedUser = angular.copy($scope.currentUser);
        $scope.editedUser.password = '';
        $scope.editedUser.confirmPassword = '';
        $scope.error = null;
        $scope.success = null;
    };

    // Cancel editing
    $scope.cancelEditing = function() {
        $scope.isEditing = false;
        $scope.editedUser = null;
        $scope.error = null;
        $scope.success = null;
    };

    // Update profile
    $scope.updateProfile = function() {
        $scope.isLoading = true;
        $scope.error = null;
        $scope.success = null;

        // Validate passwords if they are being changed
        if ($scope.editedUser.password) {
            if ($scope.editedUser.password !== $scope.editedUser.confirmPassword) {
                $scope.error = 'Passwords do not match';
                $scope.isLoading = false;
                return;
            }
        }

        // Update user data
        const updatedUser = {
            ...$scope.currentUser,
            name: $scope.editedUser.name,
            email: $scope.editedUser.email
        };

        // Only update password if it was changed
        if ($scope.editedUser.password) {
            updatedUser.password = $scope.editedUser.password;
        }

        AuthService.updateProfile(updatedUser)
            .then(function(response) {
                $scope.currentUser = response;
                $scope.isEditing = false;
                $scope.success = 'Profile updated successfully!';
            })
            .catch(function(error) {
                $scope.error = error.message || 'Failed to update profile';
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Toggle dark mode
    $scope.toggleDarkMode = function() {
        // Save dark mode preference to localStorage
        localStorage.setItem('darkMode', $scope.isDarkMode);
    };

    // Delete account
    $scope.deleteAccount = function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            AuthService.deleteAccount($scope.currentUser.id);
            window.location.href = '/';
        }
    };

    // Load initial dark mode preference
    $scope.isDarkMode = localStorage.getItem('darkMode') === 'true';
});
angular.module('todoApp').service('AuthService', function($window, $q) {
    const storageKey = 'currentUser';

    this.login = function(data) {
        const deferred = $q.defer();
        const registeredUser = JSON.parse($window.localStorage.getItem(storageKey));
        if (
            registeredUser &&
            data.email === registeredUser.email &&
            data.password === registeredUser.password
        ) {
            deferred.resolve(registeredUser);
        } else {
            deferred.reject('Invalid email or password');
        }
        return deferred.promise;
    };

    this.register = function(data) {
        const deferred = $q.defer();
        if (data.name && data.email && data.password) {
            const user = {
                id: Date.now(),
                name: data.name,
                email: data.email,
                password: data.password,
                createdAt: new Date(),
                emailNotifications: true
            };
            $window.localStorage.setItem(storageKey, JSON.stringify(user));
            deferred.resolve(user);
        } else {
            deferred.reject('Invalid registration data');
        }
        return deferred.promise;
    };

    this.logout = function() {
        $window.localStorage.removeItem(storageKey);
    };

    this.isAuthenticated = function() {
        return !!$window.localStorage.getItem(storageKey);
    };

    this.getCurrentUser = function() {
        const user = $window.localStorage.getItem(storageKey);
        return user ? JSON.parse(user) : null;
    };

    this.updateProfile = function(userData) {
        const deferred = $q.defer();
        try {
            if (!userData || !userData.email) {
                throw new Error('Invalid profile data');
            }

            // Get current user data
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not found');
            }

            // Update user data
            const updatedUser = {
                ...currentUser,
                name: userData.name,
                email: userData.email,
                emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : currentUser.emailNotifications
            };

            // Only update password if it was changed
            if (userData.password) {
                updatedUser.password = userData.password;
            }

            // Save updated user
            $window.localStorage.setItem(storageKey, JSON.stringify(updatedUser));
            deferred.resolve(updatedUser);
        } catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    };

    this.deleteAccount = function(userId) {
        $window.localStorage.removeItem(storageKey);
        const allTasks = JSON.parse($window.localStorage.getItem('tasks')) || [];
        const updatedTasks = allTasks.filter(task => task.userId !== userId);
        $window.localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    };
});

angular.module('todoApp').controller('ProfileController', function($scope, AuthService) {
// Initialize user data
$scope.currentUser = AuthService.getCurrentUser();
$scope.isEditing = false;
$scope.isLoading = false;
$scope.error = null;
$scope.success = null;
$scope.isDarkMode = false;

// Initialize task statistics
$scope.taskStats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
};

// Start editing profile
$scope.startEditing = function() {
    $scope.isEditing = true;
    $scope.editedUser = angular.copy($scope.currentUser);
    $scope.editedUser.password = '';
    $scope.editedUser.confirmPassword = '';
    $scope.error = null;
    $scope.success = null;
};

// Cancel editing
$scope.cancelEditing = function() {
    $scope.isEditing = false;
    $scope.editedUser = null;
    $scope.error = null;
    $scope.success = null;
};

// Update profile
$scope.updateProfile = function() {
    $scope.isLoading = true;
    $scope.error = null;
    $scope.success = null;

    // Validate passwords if they are being changed
    if ($scope.editedUser.password) {
        if ($scope.editedUser.password !== $scope.editedUser.confirmPassword) {
            $scope.error = 'Passwords do not match';
            $scope.isLoading = false;
            return;
        }
    }

    // Update user data
    const updatedUser = {
        ...$scope.currentUser,
        name: $scope.editedUser.name,
        email: $scope.editedUser.email
    };

    // Only update password if it was changed
    if ($scope.editedUser.password) {
        updatedUser.password = $scope.editedUser.password;
    }

    AuthService.updateProfile(updatedUser)
        .then(function(response) {
            $scope.currentUser = response;
            $scope.isEditing = false;
            $scope.success = 'Profile updated successfully!';
        })
        .catch(function(error) {
            $scope.error = error.message || 'Failed to update profile';
        })
        .finally(function() {
            $scope.isLoading = false;
        });
};

// Toggle dark mode
$scope.toggleDarkMode = function() {
    // Save dark mode preference to localStorage
    localStorage.setItem('darkMode', $scope.isDarkMode);
};

// Delete account
$scope.deleteAccount = function() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        AuthService.deleteAccount($scope.currentUser.id);
        window.location.href = '/';
    }
};

// Load initial dark mode preference
$scope.isDarkMode = localStorage.getItem('darkMode') === 'true';
});
