(function () {
    'use strict'
    angular.module('IssueTrackingSystem.Project.Factory', [])
        .factory('projectFactory',['$http',
            '$q',
            'BASE_URL',
            function projectFactory($http, $q, BASE_URL) {
                function getProjects() {
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'projects')
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function getProject(id) {
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'projects/' + id)
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function addProject(project) {
                    project = managePrioritiesAndLabels(project);
                    project.ProjectKey = project.Name.match(/\b(\w)/g).join('');

                    var deferred = $q.defer();
                    $http.post(BASE_URL + 'projects', project)
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function editProject(project) {
                    project = managePrioritiesAndLabels(project);
                    var deferred = $q.defer();
                    $http.put(BASE_URL + 'projects/' + project.Id, project)
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }

                function getUserRelatedProjects(userId){
                    var deferred = $q.defer();

                    getProjects()
                        .then(function (response) {
                            var own = response.data.filter(function (project) {
                                return project.Lead.Id === userId;
                            });
                            deferred.resolve(own)
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }

                function translatePrioritiesAndLabels(project){
                    var labels = '';
                    project.Labels.forEach(function (label) {
                        if(labels !== ''){
                            labels += ', ' + label.Name;
                        }else{
                            labels = label.Name;
                        }
                    });
                    project.Labels = labels;
                    var priorities = '';
                    project.Priorities.forEach(function (priority) {
                        if(priorities !== ''){
                            priorities += ', ' + priority.Name;
                        }else{
                            priorities = priority.Name;
                        }
                    });
                    project.Priorities = priorities;
                    return project;
                }

                function managePrioritiesAndLabels(project){
                    var labels = [];
                    project.Labels.split(', ').forEach(function (label, key) {
                        labels.push({
                            Id: key,
                            Name: label
                        })
                    });
                    project.Labels = labels;
                    var priorities = [];
                    project.Priorities.split(', ').forEach(function (priority, key) {
                        priorities.push({
                            Id: key,
                            Name: priority
                        })
                    });
                    project.Priorities = priorities;
                    return project;
                }

                return {
                    getProjects: getProjects,
                    getProject: getProject,
                    getUserProjects: getUserRelatedProjects,
                    addProject: addProject,
                    editProject: editProject,
                    translatePrioritiesAndLabels: translatePrioritiesAndLabels
                }
            }])
})();