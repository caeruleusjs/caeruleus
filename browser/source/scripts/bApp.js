angular.module('bApp', ['ngRoute'])

    .directive('bApp', bAppDirective)

    .directive('bAppDialog', bAppDialogDirective)
    .directive('bAppDialogTransclude', bAppDialogTranscludeDirective)

;

function bAppDirective($rootScope) {
    return {
        restrict: 'A',
        controller: function ($scope) {

            $rootScope.$on('$routeChangeSuccess', function (evt, route) {
                $rootScope.route= route
            })

            $rootScope.isRoute= function (name, returnIfTrue, returnIfFalse) {
                if ($rootScope.route && $rootScope.route.name == name) {
                    return (arguments.length > 1) ? returnIfTrue : true
                } else {
                    return (arguments.length > 2) ? returnIfFalse : false
                }
            }

            var dialogs= $rootScope.dialogs= {}
            $rootScope.useDialog= function (name, dialog) {
                if (name && dialog) {
                    console.log('useDialog', name, dialog)
                    dialogs[name]= dialog
                }
            }
            $rootScope.getDialog= function (name) {
                return dialogs[name] || null
            }

            $rootScope.appDialogShow= function (name) {
                var dialog= $rootScope.getDialog(name)
                if (dialog) {
                    dialog.$shown= true
                }
            }
            $rootScope.appDialogHide= function (name) {
                var dialog= $rootScope.getDialog(name)
                if (dialog) {
                    dialog.$shown= false
                }
            }
            $rootScope.appDialogToggle= function (name) {
                var dialog= $rootScope.getDialog(name)
                if (dialog) {
                    if (dialog.$shown) {
                        $rootScope.appDialogHide(name)
                    } else {
                        $rootScope.appDialogShow(name)
                    }
                }
            }

        }
    }
}



function bAppDialogDirective($rootScope) {
    return {
        restrict: 'A',
        require: '^bApp',
        transclude: 'element',
        link: function ($scope, $e, $a, bApp, $transclude) {
            $rootScope.useDialog($a.bAppDialog, {
                $scope: $scope,
                $e: $e,
                $transclude: $transclude,
            })
        }
    }
}

function bAppDialogTranscludeDirective($rootScope) {
    return {
        restrict: 'A',
        require: '^bApp',
        transclude: true,
        link: function ($scope, $e, $a) {
            var appDialogTemplate= $rootScope.getDialog($a.bAppDialogTransclude)
            //var appDialogScope= appDialogTemplate.$scope.$new()
            var appDialogScope= appDialogTemplate.$scope
            appDialogScope.AppDialog= $scope.AppDialog
            if (appDialogTemplate) appDialogTemplate.$transclude(appDialogScope, function ($eTranscluded) {
                $e.empty()
                $e.append($eTranscluded)
            })
        }
    }
}
