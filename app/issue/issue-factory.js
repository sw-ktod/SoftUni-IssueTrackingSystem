(function () {
    'use strict';
    angular.module('IssueTrackingSystem.Issue')
    .factory('issueFactory', ['$http',
        '$q',
        'BASE_URL',
        function issueFactory($http, $q, BASE_URL) {
            function getIssue(id){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/' + id)
                    .then(function (response) {
                        deferred.resolve(response.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function addIssue(issue){
                issue = manageLabels(issue);
                var deferred = $q.defer();
                $http.post(BASE_URL + 'issues', issue)
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function editIssue(issue){

                var issueModel = {
                    Id: issue.Id,
                    Title: issue.Title,
                    Description: issue.Description,
                    DueDate: issue.DueDate,
                    AssigneeId: issue.Assignee.Id,
                    PriorityId: issue.Priority.Id,
                    Labels: issue.Labels
                };

                issueModel = manageLabels(issueModel);
                var deferred = $q.defer();
                $http.put(BASE_URL + 'issues/' + issue.Id, issueModel)
                    .then(function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function userIssues(pageSize, pageNumber ,orderBy){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/me?pageSize='+ pageSize
                        + '&pageNumber=' + pageNumber
                        + '&orderBy=' + orderBy)
                    .then(function (response) {
                        deferred.resolve(response.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function getIssueComments(id){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/' + id + '/comments')
                    .then(function (response) {
                        deferred.resolve(response.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function addComment(id, comment){
                var deferred = $q.defer();

                $http.post(BASE_URL + 'issues/' + id + '/comments', comment)
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function changeIssueStatus(issueId, statusId){
                var deferred = $q.defer();
                $http.put(BASE_URL + 'issues/' + issueId + '/changestatus?statusId=' + statusId)
                    .then(function (response) {
                        deferred.resolve(response.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }
            function getIssuesByProject(id){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'projects/' + id + '/issues')
                    .then(function (response) {
                        deferred.resolve(response.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function getIssuesByFilter(pageSize, page, filter){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/?pageSize=' + pageSize
                            + '&pageNumber=' + page
                            + '&filter=' + filter)
                    .then(function (response) {
                        deferred.resolve(response.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            /**
             * turns issues labels into strings
             * @param issue
             * @returns issue object with stringified labels
             */
            function translateLabels(issue){
                var labels = '';
                issue.Labels.forEach(function (label) {
                    if(labels !== ''){
                        labels += ', ' + label.Name;
                    }else{
                        labels = label.Name;
                    }
                });
                issue.Labels = labels;

                return issue;
            };
            /**
             * splits issue labels input field
             * @param issue
             * @returns issue object with modified labels
             */
            function manageLabels(issue){
                var labels = [];
                if(!issue.Labels){
                    return issue;
                }
                issue.Labels.split(', ').forEach(function (label, key) {
                    if(label !== ''){
                        labels.push({
                            Id: key,
                            Name: label
                        })
                    }
                });
                issue.Labels = labels;
                return issue;
            };

            return {
                getIssue: getIssue,
                addIssue: addIssue,
                editIssue: editIssue,
                getUserIssues: userIssues,
                getIssuesByProject: getIssuesByProject,
                getIssuesByFilter: getIssuesByFilter,
                getIssueComments: getIssueComments,
                addComment: addComment,
                changeIssueStatus: changeIssueStatus,
                translateLabels: translateLabels
            };
        }])
})();

