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
            }
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
            }
            function editIssue(issue){
                issue = manageLabels(issue);
                var deferred = $q.defer();
                $http.put(BASE_URL + 'issues/' + issue.Id)
                    .then(function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }


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
            }
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
            }
            function manageLabels(issue){
                var labels = [];
                console.log(issue);
                issue.Labels.split(', ').forEach(function (label, key) {
                    labels.push({
                        Id: key,
                        Name: label
                    })
                });
                issue.Labels = labels;
                return issue;
            }

            return {
                getIssue: getIssue,
                addIssue: addIssue,
                editIssue: editIssue,
                getUserIssues: userIssues,
                getIssuesByProject: getIssuesByProject,
                translateLabels: translateLabels
            };
        }])
})();

