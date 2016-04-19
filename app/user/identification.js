(function () {
    'use strict';

    angular.module('IssueTrackingSystem.User.Identification',[])
        .config(['$provide', '$httpProvider', function ($provide, $httpProvider) {
            $provide.factory('identificationInterceptor', ['$q', function ($q) {
                return {
                    request: function (config) {
                        var bearerToken = sessionStorage.getItem('access_token');
                        if (bearerToken) {
                            config.headers['Authorization'] = 'Bearer ' + bearerToken;
                        }
                        return config || $q.when(config);
                    }
                };
            }]);

            $httpProvider.interceptors.push('identificationInterceptor');
        }])
        .factory('identificationFactory', ['$window',
            '$location',
            'popService',
            '$http',
            '$q',
            'BASE_URL',
            function ($window, $location, popService, $http, $q, BASE_URL) {
                function setCookie(key, value){
                    $window.sessionStorage[key] = value;
                }
                function getCookieData(key){
                    return $window.sessionStorage[key];
                }
                function existingCookie(){
                    return $window.sessionStorage.access_token ? 1 : 0;
                }
                function removeCookie(){
                    $window.sessionStorage.removeItem('access_token');
                    $window.sessionStorage.removeItem('user');
                }
                function requireAuthorization(){
                    if(!existingCookie()){
                        $location.path('/');
                        popService.pop(401, "You have to login first");
                        return;
                    }
                }
                function isAdmin(){
                    if(!existingCookie()){
                        return false;
                    }
                    var user = getCookieData('user');
                    return JSON.parse(user).isAdmin;
                }
                function requireAdmin(){
                    requireAuthorization();
                    if(!isAdmin()){
                        $location.path('/');
                        popService.pop(401, "Admin privileges required to access this page");
                        return;
                    }
                }
                function isLead(leadId){
                    //var isLead = projectFactory.getProject(projectId)
                    //    .then(function (response) {
                    //        var leadId = response.data.Lead.Id;
                    //        return getOwnId()
                    //            .then(function (ownId) {
                    //            return ownId === leadId;
                    //        });
                    //});
                    //return $q.when(isLead);

                    return getOwnId()
                        .then(function (ownId) {
                            return ownId === leadId;
                     });
                };
                function requireLead(leadId){
                    requireAuthorization();
                    if(!isAdmin()){
                        isLead(leadId)
                            .then(function (isLead) {
                                if(!isLead){
                                    $location.path('/');
                                    popService.pop(401, "Leader privileges required to access this page");
                                }
                        });
                    }
                };
                function isAssignee(assigneeId){
                    return getOwnId()
                        .then(function (ownId) {
                            return ownId === assigneeId;
                    });
                };
                function getSelf(){
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'users/me')
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                };
                function getOwnId(){
                    var deferred = $q.defer();
                    if(!existingCookie()){
                        deferred.reject();
                    }
                    if(getCookieData('user')){
                        var id = JSON.parse(getCookieData('user')).Id;
                        deferred.resolve(id);
                    }else{
                        deferred.reject();
                    }
                    return deferred.promise;
                };

                return {
                    setCookie: setCookie,
                    userLogged: existingCookie,
                    removeCookie: removeCookie,
                    requireAuthorization: requireAuthorization,
                    getOwnId: getOwnId,
                    requireAdmin: requireAdmin,
                    getUser: getSelf,
                    isAdmin: isAdmin,
                    isLead: isLead,
                    requireLead: requireLead,
                    isAssignee: isAssignee
                };
        }])
})();