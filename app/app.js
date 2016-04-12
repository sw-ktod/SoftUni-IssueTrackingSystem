(function () {
    'use strict';

// Declare app level module which depends on views, and components
    angular.module('IssueTrackingSystem',  [
        'ngRoute',
        'ngCookies',
        'IssueTrackingSystem.Home',
        'IssueTrackingSystem.User.Identification',
        'IssueTrackingSystem.User.Factory',
        'IssueTrackingSystem.User',
        'IssueTrackingSystem.Project',
        'IssueTrackingSystem.Project.Factory',
        'IssueTrackingSystem.Issue',
        'IssueTrackingSystem.Issue.Factory',
        'IssueTrackingSystem.Popper',
    ]).config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.otherwise({redirectTo: "/"});
        }])
    //.constant('BASE_URL', 'http://softuni-social-network.azurewebsites.net/api/');
    .constant('BASE_URL', 'http://softuni-issue-tracker.azurewebsites.net/');
})();