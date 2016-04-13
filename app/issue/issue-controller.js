(function () {
'use strict';

angular.module('IssueTrackingSystem.Issue', [])
    .config(['$routeProvider',
        function ($routeProvider){
            $routeProvider.when('/issues/add',{
                templateUrl: 'issue/templates/add-issue.html',
                controller: 'issueCtrl',
                resolve:{
                    auth: function(identificationFactory){
                        identificationFactory.requireAuthorization();
                    }
                }
            }).when('/issues/:id/edit',{
                templateUrl: 'issue/templates/edit-issue.html',
                controller: 'issueCtrl',
                resolve:{
                    auth: function(identificationFactory){
                        identificationFactory.requireAuthorization();
                    }
                }
            }).when('/issues/:id',{
                templateUrl: 'issue/templates/issue.html',
                controller: 'issueCtrl',
                resolve:{
                    auth: function(identificationFactory){
                        identificationFactory.requireAuthorization();
                    }
                }
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
             * Editing Issues
             */
            if($location.path().match('\/(?!index\.html)(issues\/[0-9]+\/edit)')){
                issueFactory.getIssue($routeParams.id)
                    .then(function (issue) {
                        if(!$scope.isAdmin){
                            identificationFactory.getOwnId()
                                .then(function (id) {
                                    projectFactory.getProjects()
                                        .then(function (projects) {
                                            var currentProject = projects.data.filter(function (project) {
                                                return project.Id === issue.data.Project.Id
                                            })[0];
                                            $scope.isLead = (currentProject.Lead.Id === id);
                                            if(!$scope.isLead){
                                                $location.path('/');
                                                popService.pop('404', 'Unauthorized');
                                                return;
                                            }

                                            $scope.projects = projects.data;
                                            attachProjectPriorities(issue.data.Project.Id);
                                    });
                            });
                        }
                        $scope.issue = issueFactory.translateLabels(issue.data);
                        userFactory.getUsers()
                            .then(function (users) {
                                $scope.users=users;
                        });

                });

                $scope.changeIssueStatus = changeIssueStatus;
                $scope.editIssue = function (issue) {

                    var issueModel = {
                        Id: issue.Id,
                        Title: issue.Title,
                        Description: issue.Description,
                        DueDate: issue.DueDate,
                        AssigneeId: issue.Assignee.Id,
                        PriorityId: issue.Priority.Id,
                        Labels: issue.Labels
                    };

                    issueFactory.editIssue(issueModel)
                        .then(function (success) {
                            $route.reload();
                            popService.pop(success.status, 'Issue edited successfully');
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    });
                };
            }
            /**
             * Getting Issues
             */
            else if($location.path().match('\/(?!index\.html)(issues\/[0-9]+)')){
                issueFactory.getIssue($routeParams.id)
                    .then(function (issue) {
                        identificationFactory.getOwnId()
                            .then(function (id) {
                                projectFactory.getProject(issue.data.Project.Id)
                                    .then(function (project) {
                                        $scope.isLead = (project.data.Lead.Id === id);
                                        $scope.isAssignee = (issue.data.Assignee.Id === id);
                                    });
                            });
                        $scope.issue = issueFactory.translateLabels(issue.data);
                        issueFactory.getIssueComments(issue.data.Id)
                            .then(function (comments) {
                                $scope.issue.Comments = comments.data;
                            }, function (error) {
                                deferred.reject(error);
                            });
                    });
                $scope.addComment = function (comment) {
                    issueFactory.addComment($routeParams.id, comment)
                        .then(function (response) {
                            popService.pop(response.status, 'Comment added successfuly');
                            $scope.issue.Comments = response.data;
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    })
                };
                $scope.changeIssueStatus = changeIssueStatus;
            }
            /**
             * Adding Issues
             */
            else if($location.path() == '/issues/add'){
                userFactory.getUsers()
                    .then(function (users) {
                        $scope.users=users;
                });
                projectFactory.getProjects()
                    .then(function (projects) {
                        $scope.projects = projects.data;
                });
                $scope.addIssue = function (issue) {
                    delete issue.Priorities;
                    issue.IssueKey = issue.Title.match(/\b(\w)/g).join('');

                    issueFactory.addIssue(issue)
                        .then(function (success) {
                            $location.path('/');
                            popService.pop(success.status, 'Issue added successfully');
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    });
                };
                $scope.attachProjectPriorities = attachProjectPriorities;
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
                        popService.pop(response.status, 'Successfully applied issue status');
                        $route.reload();
                    }, function (error) {
                        var message = popService.getErrorMessage(error);
                        popService.pop(error.status, message);
                    })
            }
    }])

})();