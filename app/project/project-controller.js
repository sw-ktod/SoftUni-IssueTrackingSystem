(function () {
    'use strict';

    angular.module('IssueTrackingSystem.Project',[])
        .config(['$routeProvider',
            function($routeProvider) {
                $routeProvider
                    .when('/projects',{
                        templateUrl: 'project/templates/projects-all.html',
                        controller: 'projectCtrl',
                        resolve:{
                            auth: function(identificationFactory){
                                identificationFactory.requireAuthorization();
                            }
                        }
                    })
                    .when('/projects/add', {
                        templateUrl: 'project/templates/add-project.html',
                        controller: 'projectCtrl',
                        resolve:{
                            auth: function(identificationFactory){
                                identificationFactory.requireAdmin();
                            }
                        }
                    })
                    .when('/projects/:id',{
                        templateUrl: 'project/templates/project.html',
                        controller: 'projectCtrl',
                        resolve:{
                            auth: function(identificationFactory){
                                identificationFactory.requireAuthorization();
                            }
                        }
                    })
                    .when('/projects/:id/edit',{
                        templateUrl: 'project/templates/edit-project.html',
                        controller: 'projectCtrl',
                        resolve:{
                            auth: function(identificationFactory){
                                identificationFactory.requireAuthorization();
                            }
                        }
                    })

        }])
        .controller('projectCtrl', ['$scope',
            '$routeParams',
            '$location',
            'projectFactory',
            'userFactory',
            'issueFactory',
            'identificationFactory',
            'popService',
            function projectCtrl($scope, $routeParams, $location, projectFactory, userFactory, issueFactory, identificationFactory, popService) {

                /**
                 *  Editing project
                 */
                if($location.path().match('\/(?!index\.html)(projects\/[0-9]+\/edit)')){
                    projectFactory.getProject($routeParams.id)
                        .then(function (project) {
                            if(!$scope.isAdmin){
                                identificationFactory.getOwnId()
                                    .then(function (id) {
                                        $scope.isLead = (project.data.Lead.Id === id);

                                        if(!$scope.isLead){
                                            $location.path('/');
                                            popService.pop('404', 'Unauthorized');
                                            return;
                                        }
                                });
                            }
                            $scope.project = projectFactory.translatePrioritiesAndLabels(project.data);
                            userFactory.getUsers()
                                .then(function (users) {
                                    $scope.users=users;
                            });
                        });
                    $scope.editProject = function (project) {
                        project.LeadId = project.Lead.Id;
                        delete project.Lead;
                        projectFactory.editProject(project)
                            .then(function (response) {
                                $location.path('#/projects/' + project.Id);
                                popService.pop(response.status, 'Project edited successfully');
                            }, function (error) {
                                var message = popService.getErrorMessage(error);
                                popService.pop(error.status, message);
                            });
                    };
                }
                /**
                 *  Getting project
                 */
                else if($location.path().match('\/(?!index\.html)(projects\/[0-9]+)')){
                    projectFactory.getProject($routeParams.id)
                        .then(function (project) {
                            identificationFactory.getOwnId()
                                .then(function (id) {
                                    $scope.isLead = (project.data.Lead.Id === id);
                                });
                            $scope.project = project.data;
                            issueFactory.getIssuesByProject($routeParams.id)
                                .then(function (projectIssues) {
                                    $scope.project.issues = projectIssues;
                                });
                        });
                }
                /**
                 *  Adding project
                 */
                else if($location.path() == '/projects/add'){
                    userFactory.getUsers()
                        .then(function (users) {
                            $scope.users=users;
                        });
                    $scope.addProject = function (project) {
                        projectFactory.addProject(project)
                            .then(function (response) {
                                $location.path('#/projects/' + response.data.Id);
                                popService.pop(response.status, 'Project edited successfully');
                            }, function (error) {
                                var message = popService.getErrorMessage(error);
                                popService.pop(response.status, message);
                            });
                    };
                }
                /**
                 *  Getting all projects
                 */
                else if($location.path() == '/projects'){
                    projectFactory.getProjects()
                        .then(function (projects) {
                            $scope.projects = projects.data;
                        });
                }



            }
        ])
})();