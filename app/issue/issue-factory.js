(function () {
    'use strict';
    angular.module('IssueTrackingSystem.Issue.Factory', [])
    .factory('issueFactory', ['$http',
        '$q',
        'BASE_URL',
        function issueFactory($http, $q, BASE_URL) {
            function getIssue(id){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/' + id)
                    .then(function (response) {
                        deferred.resolve(response);
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
                issue = manageLabels(issue);
                var deferred = $q.defer();
                $http.put(BASE_URL + 'issues/' + issue.Id, issue)
                    .then(function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function userIssues(pageSize, pageNumber ,orderBy){
                pageSize = pageSize || 3;
                pageNumber = pageNumber || 1;
                orderBy = orderBy || 'DueDate desc';

                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/me?pageSize='+ pageSize
                        + '&pageNumber=' + pageNumber
                        + '&orderBy=' + orderBy)
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };
            function getIssueComments(id){
                var deferred = $q.defer();
                $http.get(BASE_URL + 'issues/' + id + '/comments')
                    .then(function (response) {
                        deferred.resolve(response);
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
                        deferred.resolve(response);
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
            function manageLabels(issue){
                var labels = [];
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
                getIssueComments: getIssueComments,
                addComment: addComment,
                changeIssueStatus: changeIssueStatus,
                translateLabels: translateLabels
            };
        }])
})();

