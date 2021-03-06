(function () {
    'use strict';

    angular.module('IssueTrackingSystem.Project',[])
        .config(['$routeProvider',
            function($routeProvider) {
                $routeProvider
                    .when('/projects',{
                        templateUrl: 'project/templates/projects-all.html',
                        controller: 'projectCtrl'
                    })
                    .when('/projects/add', {
                        templateUrl: 'project/templates/add-project.html',
                        controller: 'projectCtrl'
                    })
                    .when('/projects/:id',{
                        templateUrl: 'project/templates/project.html',
                        controller: 'projectCtrl'
                    })
                    .when('/projects/:id/edit',{
                        templateUrl: 'project/templates/edit-project.html',
                        controller: 'projectCtrl'
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
                            identificationFactory.requireLead(project.Lead.Id);

                            $scope.project = projectFactory.translatePrioritiesAndLabels(project);
                            userFactory.getUsers()
                                .then(function (users) {
                                    $scope.users=users;
                            });
                        });
                    $scope.editProject = editProject;
                }
                /**
                 *  Getting project
                 */
                else if($location.path().match('\/(?!index\.html)(projects\/[0-9]+)')){
                    identificationFactory.requireAuthorization();
                    projectFactory.getProject($routeParams.id)
                        .then(function (project) {
                            var priorityObjects = project.Priorities;
                            $scope.project = projectFactory.translatePrioritiesAndLabels(project);
                            $scope.project.priorityObjects = priorityObjects;
                            identificationFactory.isLead(project.Lead.Id)
                                .then(function (isLead) {
                                    $scope.isLead = isLead;
                            });
                            filterIssues();
                            $scope.filterIssues = filterIssues;
                    });

                }

                /**
                 *  Adding project
                 */
                else if($location.path() == '/projects/add'){
                    identificationFactory.requireAdmin();
                    userFactory.getUsers()
                        .then(function (users) {
                            $scope.users=users;
                    });
                    $scope.setProjectKey = setProjectKey;
                    $scope.addProject = addProject;
                }
                /**
                 *  Getting all projects
                 */
                else if($location.path() == '/projects'){
                    identificationFactory.requireAuthorization();
                    projectFactory.getProjects()
                        .then(function (projects) {
                            $scope.projects = projects;
                    });
                }

                function addProject(project){
                    projectFactory.addProject(project)
                        .then(function (response) {
                            $location.path('#/projects/' + response.data.Id);
                            popService.pop(response.status, 'Project edited successfully');
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(response.status, message);
                    });
                }

                function editProject(project){
                    project.LeadId = project.Lead.Id;
                    delete project.Lead;
                    projectFactory.editProject(project)
                        .then(function (response) {
                            $location.path('/projects/' + project.Id);
                            popService.pop(response.status, 'Project edited successfully');
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                        });
                }
                function setProjectKey() {
                    if($scope.project.Name){
                        $scope.project.ProjectKey = $scope.project.Name.match(/\b(\w)/g).join('');
                    }else{
                        $scope.project.ProjectKey = '';
                    }
                }
                function filterIssues(pageSize, page, filter, priority){
                    identificationFactory.getOwnId()
                        .then(function (id) {
                            switch(filter){
                                case 'all':
                                    filter = 'Project.Id == ' + $scope.project.Id;
                                    break;
                                case 'assigned':
                                    filter = 'Assignee.Id == "' + id + '" and Project.Id == ' + $scope.project.Id;
                                    break;
                                case 'all':
                                    filter = 'Author.Id == "' + id + '" and Project.Id == ' + $scope.project.Id;
                                    break;
                                case 'open':
                                    filter = 'Status.Name != "Closed" and Project.Id == ' + $scope.project.Id;
                                    break;
                                case 'closed':
                                    filter = 'Status.Name == "Closed" and Project.Id == ' + $scope.project.Id;
                                    break;
                                case 'inProgress':
                                    filter = 'Status.Name == "InProgress" and Project.Id == ' + $scope.project.Id;
                                    break;
                                case 'stoppedProgress':
                                    filter = 'Status.Name == "StoppedProgress" and Project.Id == ' + $scope.project.Id;
                                    break;
                                default:
                                    filter = 'Assignee.Id == "' + id + '" and Project.Id == ' + $scope.project.Id;
                                    break;
                            }
                            if(priority){
                                filter += 'and Priority.Name =="' + priority +'"';
                            }
                            pageSize = pageSize || 3;
                            page = page || 1;
                            issueFactory.getIssuesByFilter(pageSize, page, filter)
                                .then(function (response) {
                                    $scope.project.Issues = response.Issues;
                                    $scope.issueCount = response.TotalCount;
                                    $scope.issuePages = response.TotalPages;
                            });
                    });
                }
            }
        ])
})();