/*
 * bTimeline
 */
angular.module('bTimeline', [])

    .directive('bTimeline', bTimelineDirective)
    .directive('bTimelineTemplate', bTimelineTemplateDirective)
    .directive('bTimelineTemplateTransclude', bTimelineTemplateTranscludeDirective)

    .directive('bInputDatetime', bInputDatetimeDirective)
;



function bTimelineDirective($compile) {

    return {

        restrict: 'A',

        scope: {
            beginDate: '=timelineBeginDate',
            endDate: '=timelineEndDate',
            intervals: '=timelineIntervals',
        },

        controllerAs: 'bTimeline',
        controller: function ($scope) {

            this.$templates= {}
            this.useTemplate= function (name, template) {
                this.$templates[name]= template
            }

            this.calcIntervalLeft= function (interval) {
                var chunkPercent= ($scope.endDate.getTime() - $scope.beginDate.getTime()) / 100
                var left= ((interval.beginDate.getTime() - $scope.beginDate.getTime()) / chunkPercent)
                left= (left < 0) ? 0 : left
                return left +'%'
            }

            this.calcIntervalRight= function (interval) {
                var chunkPercent= ($scope.endDate.getTime() - $scope.beginDate.getTime()) / 100
                var right= (($scope.endDate.getTime() - interval.endDate.getTime()) / chunkPercent)
                right= (right < 0) ? 0 : right
                return right +'%'
            }

            $scope.matchTimelineInterval= function (interval) {
                if (interval.beginDate && interval.endDate && interval.beginDate < $scope.endDate && interval.endDate > $scope.beginDate) {
                    return interval
                }
            }

        },

        link: function ($scope, $e, $a) {

            var template= ''+
                '<div class="b-timeline">'+
                    '<div class="b-timeline__interval" ng-repeat="interval in intervals | filter:matchTimelineInterval" b-timeline-template-transclude="interval">'+
                        ''+
                    '</div>'+
                '</div>'+
            ''

            $e.append($compile(template)($scope))

        }
    }

}



function bTimelineTemplateDirective($parse) {

    return {

        restrict: 'A',
        require: '^bTimeline',

        transclude: 'element',

        link: function ($scope, $e, $a, bTimeline, $transclude) {
            if ($a.bTimelineTemplate) {
                bTimeline.useTemplate($a.bTimelineTemplate, {
                    $e: $e,
                    $transclude: $transclude,
                    use: $parse($a.use)(),
                })
            }
        },
    }

}



function bTimelineTemplateTranscludeDirective() {

    return {

        transclude: true,

        link: function ($scope, $e, $a) {

            if ($scope.bTimeline && $a.bTimelineTemplateTransclude) {
                var template= $scope.bTimeline.$templates[$a.bTimelineTemplateTransclude]
                if (template) {
                    template.$transclude(function ($eTranscluded) {
                        var templateScope= $eTranscluded.scope()
                        if (template.use && template.use.length) {
                            angular.forEach(template.use, function (use) {
                                templateScope[use]= $scope[use]
                            })
                        }
                        $e.append($eTranscluded)
                    })
                }
            }

        }
    }

}



function bInputDatetimeDirective() {

    return {
        restrict: 'A',

        link: bInputDatetimeDirectiveLink,
    }

    function bInputDatetimeDirectiveLink($scope, $e, $a) {

        $scope.incrBeginHours= function (interval) {
            interval.beginDate.setHours(
                interval.beginDate.getHours() + 1
            )
            if (interval.beginDate > interval.endDate) {
                interval.beginDate.setTime(
                    interval.endDate.getTime()
                )
            }
        }

        $scope.incrBeginMinutes= function (interval) {
            interval.beginDate.setMinutes(
                interval.beginDate.getMinutes() + 5
            )
            if (interval.beginDate > interval.endDate) {
                interval.beginDate.setTime(
                    interval.endDate.getTime()
                )
            }
        }

        $scope.decrBeginHours= function (interval) {
            interval.beginDate.setHours(
                interval.beginDate.getHours() - 1
            )
        }

        $scope.decrBeginMinutes= function (interval) {
            interval.beginDate.setMinutes(
                interval.beginDate.getMinutes() - 5
            )
        }

        $scope.incrEndHours= function (interval) {
            interval.endDate.setHours(
                interval.endDate.getHours() + 1
            )
        }

        $scope.incrEndMinutes= function (interval) {
            interval.endDate.setMinutes(
                interval.endDate.getMinutes() + 5
            )
        }

        $scope.decrEndHours= function (interval) {
            interval.endDate.setHours(
                interval.endDate.getHours() - 1
            )
            if (interval.endDate < interval.beginDate) {
                interval.endDate.setTime(
                    interval.beginDate.getTime()
                )
            }
        }

        $scope.decrEndMinutes= function (interval) {
            interval.endDate.setMinutes(
                interval.endDate.getMinutes() - 5
            )
            if (interval.endDate < interval.beginDate) {
                interval.endDate.setTime(
                    interval.beginDate.getTime()
                )
            }
        }

    }
}
