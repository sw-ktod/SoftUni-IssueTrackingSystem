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
        '$routeParams',
        'userFactory',
        'projectFactory',
        'issueFactory',
        'identificationFactory',
        'popService',
        function issueCtrl($scope, $location, $routeParams, userFactory, projectFactory, issueFactory, identificationFactory, popService) {
            /**
             *  Editing Issues
             *
             */
            if($location.path().match('\/(?!index\.html)(issues\/[0-9]+\/edit)')){
                issueFactory.getIssue($routeParams.id)
                    .then(function (issue) {
                        if(!$scope.isAdmin){
                            identificationFactory.getOwnId()
                                .then(function (id) {
                                    projectFactory.getProject(issue.data.Project.Id)
                                        .then(function (project) {
                                            $scope.isLead = (project.data.Lead.Id === id);
                                            if(!$scope.isLead){
                                                $scope.isAssignee = (issue.data.Assignee.Id === id);
                                                if(!$scope.isAssignee){
                                                    $location.path('/');
                                                    popService.pop('404', 'Unauthorized');
                                                    return;
                                                }
                                            }
                                    });

                            });
                        $scope.issue = issueFactory.translateLabels(issue.data);
                    }
                });
                userFactory.getUsers()
                    .then(function (users) {
                        $scope.users=users;
                });
                projectFactory.getProjects()
                    .then(function (projects) {
                        $scope.projects = projects.data;
                    });

                $scope.editIssue = function (issue) {
                    delete issue.Priorities;
                    issue.IssueKey = issue.Title.match(/\b(\w)/g).join('');

                    issueFactory.edit(issue)
                        .then(function (success) {
                            $location.path('#/issues/'+issue.Id);
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
                    });
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
            }
            $scope.attachProjectPriorities = function (id) {
                var project = $scope.projects.filter(function (project) {
                    return project.Id == id;
                })[0];
                $scope.issue.Priorities = project.Priorities;
            };
            //$scope.attachProjectPrioritiesAndLabels = function (id) {
            //    $scope.issue.Labels = '';
            //    var project = $scope.projects.filter(function (project) {
            //        return project.Id == id;
            //    })[0];
            //    $scope.issue.Priorities = project.Priorities;
            //    project.Labels.forEach(function (label) {
            //        if($scope.issue.Labels){
            //            $scope.issue.Labels +=', ' + label.Name;
            //        }else{
            //            $scope.issue.Labels = label.Name;
            //        }
            //    });
            //};



    }])

})();