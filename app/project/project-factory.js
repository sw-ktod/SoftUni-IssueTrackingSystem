(function () {
    'use strict'
    angular.module('IssueTrackingSystem.Project')
        .factory('projectFactory',['$http',
            '$q',
            'BASE_URL',
            function projectFactory($http, $q, BASE_URL) {


                function getProjects() {
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'projects')
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function getProjectsByFilter(pageSize, page, filter){
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'projects/?pageSize=' + pageSize
                        + '&pageNumber=' + page
                        + '&filter=' + filter)
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function getProject(id) {
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'projects/' + id)
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function addProject(project) {
                    project = managePrioritiesAndLabels(project);

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
                        .then(function (projects) {
                            var own = projects.filter(function (project) {
                                return project.Lead.Id === userId;
                            });
                            deferred.resolve(own)
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }

                /**
                 * takes the project object and modifies its labels and priorities to a presentable state
                 * @param project
                 * @returns project with stringified labels and priorities
                 */
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

                /**
                 * takes the project object and modifies its labels and priorities inputs
                 * @param project
                 * @returns project with modified(objectified) labels and priorities
                 */
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
                    getProjectsByFilter: getProjectsByFilter,
                    getProject: getProject,
                    getUserProjects: getUserRelatedProjects,
                    addProject: addProject,
                    editProject: editProject,
                    translatePrioritiesAndLabels: translatePrioritiesAndLabels
                }
            }])
})();