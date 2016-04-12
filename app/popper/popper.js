(function () {
    angular.module('IssueTrackingSystem.Popper',['ngDialog'])
        .factory('popService', ['$timeout', 'ngDialog',function ($timeout, ngDialog) {

            function pop(code, msg){
                ngDialog.open({
                    template: 'popper/popup.html',
                    controller: ['$scope', function($scope) {
                        if(code>199 && code < 300){
                            $scope.result = 'success';
                        }
                        else if(code >= 400){
                            $scope.result = 'danger';
                        }
                        else{
                            $scope.result = 'warning';
                        }
                        $scope.message = msg;
                    }]
                });
                $timeout(function () {
                    ngDialog.close();
                }, 2000);
            }
            function getErrorMessage(error){
                if(!error.data){
                    return;
                }
                var message = '';
                for(var key in error.data.modelState){
                    if (error.data.modelState.hasOwnProperty(key)) {
                        message = error.data.modelState[key][0];
                        break;
                    }
                }
                if(!message){
                    for(var key in error.data){
                        if (error.data.hasOwnProperty(key)) {
                            message = error.data[key];
                            break;
                        }
                    }
                }
                return message;
            }
            return {
                pop: pop,
                getErrorMessage: getErrorMessage
            }
        }])
})();