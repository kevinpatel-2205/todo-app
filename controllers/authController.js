angular.module('todoApp').controller('AuthController', function($scope, AuthService, $window) {
    $scope.isLogin = true;
    $scope.loginData = {};
    $scope.registerData = {};
    $scope.isAuthenticated = false;

    $scope.toggleAuthMode = function() {
        $scope.isLogin = !$scope.isLogin;
    };

    // ✅ LOGIN: Check credentials and login
    $scope.login = function() {
        AuthService.login($scope.loginData)
            .then(function(user) {
                $scope.currentUser = user;
                $scope.isAuthenticated = true;
                $window.location.href = '#!/profile'; // Redirect to profile after login
            })
            .catch(function(error) {
                alert(error);
            });
    };

    // ✅ REGISTER: Save user, then redirect to login
    $scope.register = function() {
        AuthService.register($scope.registerData)
            .then(function(user) {
                alert("Registration successful! Please login.");
                $scope.registerData = {};           // Clear form
                $scope.isLogin = true;              // Switch to login form
            })
            .catch(function(error) {
                alert(error);
            });
    };

    $scope.logout = function() {
        AuthService.logout();
        $scope.isAuthenticated = false;
        $window.location.href = '#!/login'; // Redirect on logout
    };
});
