(function () {
'use strict';

angular.module('IssueTrackingSystem.Issue', [])
    .config(['$routeProvider',
        function ($routeProvider){
            $routeProvider.when('/projects/:id/add-issue',{
                templateUrl: 'issue/templates/add-issue.html',
                controller: 'issueCtrl'
            }).when('/issues/:id/edit',{
                templateUrl: 'issue/templates/edit-issue.html',
                controller: 'issueCtrl'
            }).when('/issues/:id',{
                templateUrl: 'issue/templates/issue.html',
                controller: 'issueCtrl'
            })
    }]).controller('issueCtrl', ['$scope',
        '$location',
        '$route',
        '$routeParams',
        'userFactory',
        'projectFactory',
        'issueFactory',
        'identificationFactory',
        'popService',
        function issueCtrl($scope, $location, $route, $routeParams, userFactory, projectFactory, issueFactory, identificationFactory, popService) {

            /**
             * Adding Issues
             */
            if($location.path().match('\/(?!index\.html)(projects\/[0-9]+\/add-issue)')){
                projectFactory.getProject($routeParams.id)
                    .then(function (project) {
                        console.log(project);
                        identificationFactory.requireLead(project.Lead.Id);
                        $scope.project = project;
                });
                userFactory.getUsers()
                    .then(function (users) {
                        $scope.users=users;
                });

                $scope.addIssue = addIssue;
                $scope.setIssueKey = setIssueKey;
            }
            /**
             * Editing Issues
             */
            else if($location.path().match('\/(?!index\.html)(issues\/[0-9]+\/edit)')){
                issueFactory.getIssue($routeParams.id)
                    .then(function (issue) {
                        $scope.issue = issue;
                        projectFactory.getProjects()
                            .then(function (projects) {
                                var current = projects.filter(function (project) {
                                    return project.Id === issue.Project.Id
                                })[0];
                                identificationFactory.requireLead(current.Lead.Id);
                                $scope.projects = projects;
                                attachProjectPriorities(issue.Project.Id);
                    });
                });
                userFactory.getUsers()
                    .then(function (users) {
                        $scope.users=users;
                });

                $scope.changeIssueStatus = changeIssueStatus;
                $scope.editIssue = editIssue;
            }
            /**
             * Getting Issues
             */
            else if($location.path().match('\/(?!index\.html)(issues\/[0-9]+)')){
                identificationFactory.requireAuthorization();
                issueFactory.getIssue($routeParams.id)
                    .then(function (issueData) {
                        projectFactory.getProject(issueData.Project.Id)
                            .then(function (projectData) {
                                identificationFactory.isLead(projectData.Lead.Id)
                                    .then(function (isLead) {
                                        $scope.isLead = isLead;
                                });
                        });
                        identificationFactory.isAssignee(issueData.Assignee.Id)
                            .then(function (isAssignee) {
                                $scope.isAssignee = isAssignee;
                        });
                        $scope.issue = issueData;
                        issueFactory.getIssueComments($routeParams.id)
                            .then(function (comments) {
                                $scope.issue.Comments = comments;
                        });
                });

                $scope.addComment = addComment;
                $scope.changeIssueStatus = changeIssueStatus;
            }

            function addIssue(issue){
                issue.ProjectId = $routeParams.id;
                issueFactory.addIssue(issue)
                    .then(function (success) {
                        $location.path('/issues' + success.data.Id);
                        popService.pop(success.status, 'Issue added successfully');
                    }, function (error) {
                        var message = popService.getErrorMessage(error);
                        popService.pop(error.status, message);
                });
            }
            function editIssue(issue){
                issueFactory.editIssue(issue)
                    .then(function (success) {
                        $location.path('/issues/'+success.data.Id);
                        popService.pop(success.status, 'Issue edited successfully');
                    }, function (error) {
                        var message = popService.getErrorMessage(error);
                        popService.pop(error.status, message);
                    });
            }

            function addComment(comment){
                issueFactory.addComment($routeParams.id, comment)
                    .then(function (response) {
                        $scope.issue.Comments = response.data;
                        popService.pop(response.status, 'Comment added successfully');
                    }, function (error) {
                        var message = popService.getErrorMessage(error);
                        popService.pop(error.status, message);
                    })
            }
            function attachProjectPriorities(id) {
                var project = $scope.projects.filter(function (project) {
                    return project.Id == id;
                })[0];
                $scope.issue.Priorities = project.Priorities;
            };
            function changeIssueStatus(issueId, statusId) {
                issueFactory.changeIssueStatus(issueId, statusId)
                    .then(function (response) {
                        $scope.issue.AvailableStatuses = response;
                        popService.pop(200, 'Successfully applied issue status');
                    }, function (error) {
                        var message = popService.getErrorMessage(error);
                        popService.pop(error.status, message);
                    })
            }
            function setIssueKey(){
                $scope.setIssueKey = function () {
                    if($scope.issue.Title){
                        $scope.issue.IssueKey = $scope.issue.Title.match(/\b(\w)/g).join('');
                    }else{
                        $scope.issue.IssueKey = '';
                    }
                }
            }
    }])
})();