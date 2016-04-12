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

                if($location.path() === '/' && identificationFactory.userLogged()){
                    attachUserRelatedIssuesAndProjects();
                    $scope.addProjectRedirect = function () {
                        $location.path('projects/add');
                    };
                    $scope.addIssueRedirect = function () {
                        $location.path('issues/add');
                    };
                }else{
                    $scope.login = function (user) {
                        authService.login(user)
                            .then(function (loggedUser) {
                                identificationFactory.setCookie(loggedUser);
                                $route.reload();
                                popService.pop(200, 'Successfully logged in');
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
                function attachUserRelatedIssuesAndProjects(){
                    issueFactory.getUserIssues()
                        .then(function (issues) {
                            $scope.issues = issues.data.Issues;
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
                }
            }
        ])

})();