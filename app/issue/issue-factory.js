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
                var deferred = $q.defer();
                $http.put(BASE_URL + 'issues/' + issue.Id)
                    .then(function (response) {
                        deferred.resolve(response);
                    },
                    function (error) {
                        deferred.reject(response);
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

            return {
                getIssue: getIssue,
                addIssue: addIssue,
                getUserIssues: userIssues,
                getIssuesByProject: getIssuesByProject
            };
        }])
})();

