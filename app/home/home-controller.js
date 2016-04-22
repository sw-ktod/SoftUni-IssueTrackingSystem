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
                        $scope.login = login;
                        $scope.register = register;
                    }
                };

                function login(user){
                    if(user){
                        authService.login(user)
                            .then(function (loggedUser) {
                                identificationFactory.setCookie('access_token', loggedUser.access_token);
                                identificationFactory.getUser()
                                    .then(function (self) {
                                        var userString = JSON.stringify(self);
                                        identificationFactory.setCookie('user', userString);
                                        $route.reload();
                                        popService.pop(200, 'Successfully logged in');
                                    });
                            }, function (error) {
                                var message = popService.getErrorMessage(error);
                                popService.pop(error.status, message);
                        });
                    }
                }
                function register(user){
                    if(user){
                        authService.register(user)
                            .then(function (registeredUser) {
                                identificationFactory.setCookie(registeredUser);
                                login(user);
                            }, function (error) {
                                var message = popService.getErrorMessage(error);
                                popService.pop(error.status, message);
                        });
                    }
                }

                function attachUserRelatedIssues(pageSize, pageNumber, orderBy, status){
                    pageSize = pageSize || 3;
                    pageNumber = pageNumber || 1;
                    orderBy = orderBy || 'DueDate desc';
                    console.log(status);
                    issueFactory.getUserIssues(pageSize, pageNumber, orderBy, status)
                        .then(function (data) {
                            $scope.issuePages = data.TotalPages;
                            $scope.issues = data.Issues;
                    });
                };
                function attachUserRelatedProjects(){
                    issueFactory.getUserIssues(999999, 1 ,'DueDate desc')
                        .then(function (data) {
                            var projects = [];
                            data.Issues.forEach(function (issue) {
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
                                if(scope.userLogged){
                                    identificationFactory.getUser()
                                        .then(function (user) {
                                            scope.user = user;
                                    });
                                    var now = new Date();

                                    scope.dateToday = now.getFullYear() + '-' + now.getMonth()+1 + '-' + now.getDate()
                                        +'T' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

                                    scope.dateDiff = function(date, now) {
                                        now = now || new Date();
                                        date = new Date(date);
                                        var diffDays =  parseInt((date.getTime()-now.getTime())/(24*3600*1000));
                                        return diffDays ;
                                    }
                                }
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