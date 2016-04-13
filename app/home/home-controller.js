(function () {
    'use strict';

    angular.module('IssueTrackingSystem.Home',[
        'IssueTrackingSystem.User.Authentication',
    ]).config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'home/templates/home.html',
                controller: 'homeCtrl'
            })
        }])
        .controller('homeCtrl', ['$scope',
            '$route',
            '$location',
            'authService',
            'popService',
            'identificationFactory',
            'issueFactory',
            'projectFactory',
            function homeCtrl($scope, $route, $location, authService, popService, identificationFactory, issueFactory, projectFactory) {
                if($location.path() === '/'){
                    /**
                     * Logged user
                     */
                    if(identificationFactory.userLogged()){
                        attachUserRelatedIssuesAndProjects();
                        $scope.attachUserRelatedIssues = attachUserRelatedIssues;
                        $scope.addProjectRedirect = function () {
                            $location.path('projects/add');
                        };
                        $scope.addIssueRedirect = function () {
                            $location.path('issues/add');
                        };
                    }
                    /**
                     * Guest user
                     */
                    else{
                        $scope.login = function (user) {
                            authService.login(user)
                                .then(function (loggedUser) {
                                    identificationFactory.setCookie('access_token', loggedUser.access_token);
                                    identificationFactory.getUser()
                                        .then(function (self) {
                                            var userString = JSON.stringify(self.data);
                                            identificationFactory.setCookie('user', userString);
                                            $route.reload();
                                            popService.pop(200, 'Successfully logged in');
                                        });
                                }, function (error) {
                                    var message = popService.getErrorMessage(error);
                                    popService.pop(error.status, message);
                                });
                        };
                        $scope.register = function (user) {
                            authService.register(user)
                                .then(function (registeredUser) {
                                    identificationFactory.setCookie(registeredUser);
                                    authService.login(user)
                                        .then(function () {
                                            $route.reload();
                                            popService.pop(200, 'Successfully registered');
                                        })
                                }, function (error) {
                                    var message = popService.getErrorMessage(error);
                                    popService.pop(error.status, message);
                                });
                        };
                    }
                };
                function attachUserRelatedIssues(pageSize, pageNumber, orderBy){
                    issueFactory.getUserIssues(pageSize, pageNumber, orderBy)
                        .then(function (issues) {
                            $scope.issuePages = issues.data.TotalPages;
                            $scope.issues = issues.data.Issues;
                    });
                };
                function attachUserRelatedProjects(){
                    issueFactory.getUserIssues(999999, 1)
                        .then(function (issues) {
                            var projects = [];
                            issues.data.Issues.forEach(function (issue) {
                                if(!projects.find(function (project) {
                                        return project.Id === issue.Project.Id;
                                    })){
                                    projects.push({
                                        Id: issue.Project.Id,
                                        Name: issue.Project.Name
                                    });
                                }
                            });
                            identificationFactory.getOwnId()
                                .then(function (id) {
                                    projectFactory.getUserProjects(id)
                                        .then(function (userProjects) {
                                            userProjects.forEach(function (p) {
                                                if(!projects.find(function (project) {
                                                    return project.Id === p.Id;
                                                })){
                                                    projects.push({
                                                        Id: p.Id,
                                                        Name: p.Name
                                                    });
                                                }
                                            });
                                            $scope.projects = projects;
                                        })
                                });
                        });
                };
                function attachUserRelatedIssuesAndProjects(){
                    attachUserRelatedIssues();
                    attachUserRelatedProjects();
                }
            }
        ]).directive('navMenu', ['identificationFactory',
            'authService',
            '$route',
            'popService',
            function navMenu(identificationFactory, authService, $route, popService) {
                return {
                    controller: ['$scope', function ($scope) {
                        $scope.logout = function () {
                            authService.logout()
                                .then(function (success) {
                                    identificationFactory.removeCookie();
                                    $route.reload();
                                    popService.pop(200, 'Successfully logged out');
                                }, function (error) {
                                    var message = popService.getErrorMessage(error);

                                    if(error.status == 401){
                                        identificationFactory.removeCookie();
                                        $route.reload();
                                    }
                                    popService.pop(error.status, message);
                                })
                        };
                    }],
                    compile: function () {
                        return {
                            pre: function(scope){
                                scope.userLogged = identificationFactory.userLogged();
                                scope.isAdmin = identificationFactory.isAdmin();
                            }
                        }
                    },
                    templateUrl: 'home/templates/navigation.html'
                };
        }]).directive('userDashboard',['identificationFactory',
            function userDashboard(identificationFactory) {
                return {
                    templateUrl: 'home/templates/dashboard.html'
                };
        }]).directive('userAuthentication',[
            function userAuthentication() {
                return {
                    templateUrl: 'home/templates/authentication.html'
                }
            }
        ]).filter('range', function(){
            return function(n) {
                var res = [];
                for (var i = 1; i <= n; i++) {
                    res.push(i);
                }
                return res;
            };
        });

})();