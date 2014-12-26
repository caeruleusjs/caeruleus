/*
 * bTimeline
 */
angular.module('bTimeline', [])

    .service('bTimeline', bTimelineService)

    .directive('bTimeline', bTimelineDirective)
    .directive('bTimelineInterval', bTimelineIntervalDirective)
    .directive('bTimelinePopup', bTimelinePopupDirective)
    .directive('bTimelinePopupInterval', bTimelinePopupIntervalDirective)

    .directive('bInputDatetime', bInputDatetimeDirective)

;



function bTimelineService() {



    this.sliceIntervals= function(intervals, beginDate, endDate) {

        var chunk= {
            beginDate: beginDate,
            endDate: endDate,
        }

        angular.forEach(intervals, function (interval) {
            if (interval.beginDate < chunk.endDate && interval.endDate > chunk.beginDate) {
                var chunkIntervalBeginDate= (interval.beginDate < chunk.beginDate) ? chunk.beginDate : interval.beginDate
                var chunkIntervalEndDate= (interval.endDate > chunk.endDate) ? chunk.endDate : interval.endDate
                var chunkIntervalIsBegin= (interval.beginDate >= chunk.beginDate)
                var chunkIntervalIsEnd= (interval.endDate <= chunk.endDate)
                chunk.intervals= chunk.intervals || []
                chunk.intervals.push({
                    beginDate: chunkIntervalBeginDate, isBegin: chunkIntervalIsBegin,
                    endDate: chunkIntervalEndDate, isEnd: chunkIntervalIsEnd,
                    interval: interval,
                })
            }
        })

        return chunk
    }



    this.updateDate= function (date, newDate, updatedAt) {
        newDate= newDate || new Date
        date.setHours(
            newDate.getHours()
        )
        date.setMinutes(
            newDate.getMinutes()
        )
        date.setSeconds(
            newDate.getSeconds()
        )
    }



}



function bTimelineDirective(bTimeline) {

    return {
        restrict: 'E',
        require: 'ngModel',

        template: ''+
            '<div class="b-timeline">'+
                '<div class="b-timeline__interval" b-timeline-interval ng-repeat="interval in chunk.intervals track by $index" ng-click="popupShowInterval(interval)" ng-class="{_isBegin:interval.isBegin,_isEnd:interval.isEnd,_isSelected:popupShownInterval(interval),_isStarted:false}" ng-style="{left:calcChunkIntervalLeft(chunk,interval), right:calcChunkIntervalRight(chunk,interval)}"></div>'+
                '<div class="b-timeline__popup" b-timeline-popup ng-click="popupInterval=null; popupShow(bTimelinePopup)" ng-class="{_isShown:popupShown(bTimelinePopup)}">'+
                    '<div class="b-timeline-popup" ng-if="popupShown(bTimelinePopup)">'+
                        '<div class="b-timeline-popup__main" ng-class="{_hasInterval:popupInterval}" ng-click="$event.stopPropagation()">'+
                            '<div class="b-timeline-popup-interval" b-timeline-popup-interval>'+
                                '<div class="b-input-datetime" b-input-datetime ng-if="popupInterval">'+
                                    '<div class="b-input-datetime__t">'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_input">'+
                                            '<div class="b-input-date">'+
                                                '<div class="b-input-date__btn b-input-date__btn_next"><button ng-click="incrBeginHours(popupInterval.interval)">+</button></div>'+
                                                '<div class="b-input-date__input"><input readonly value="{{popupInterval.interval.beginDate|date:\'HH\'}}"/></div>'+
                                                '<div class="b-input-date__btn b-input-date__btn_prev"><button ng-click="decrBeginHours(popupInterval.interval)">−</button></div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_label">&#x3A;</div>'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_input">'+
                                            '<div class="b-input-date">'+
                                                '<div class="b-input-date__btn b-input-date__btn_next"><button ng-click="incrBeginMinutes(popupInterval.interval)">+</button></div>'+
                                                '<div class="b-input-date__input"><input readonly value="{{popupInterval.interval.beginDate|date:\'mm\'}}"/></div>'+
                                                '<div class="b-input-date__btn b-input-date__btn_prev"><button ng-click="decrBeginMinutes(popupInterval.interval)">−</button></div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_label">&mdash;</div>'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_input">'+
                                            '<div class="b-input-date">'+
                                                '<div class="b-input-date__btn b-input-date__btn_next"><button ng-click="incrEndHours(popupInterval.interval)">+</button></div>'+
                                                '<div class="b-input-date__input"><input readonly value="{{popupInterval.interval.endDate|date:\'HH\'}}"/></div>'+
                                                '<div class="b-input-date__btn b-input-date__btn_prev"><button ng-click="decrEndHours(popupInterval.interval)">−</button></div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_label">&#x3A;</div>'+
                                        '<div class="b-input-datetime__t__c b-input-datetime__t__c_input">'+
                                            '<div class="b-input-date">'+
                                                '<div class="b-input-date__btn b-input-date__btn_next"><button ng-click="incrEndMinutes(popupInterval.interval)">+</button></div>'+
                                                '<div class="b-input-date__input"><input readonly value="{{popupInterval.interval.endDate|date:\'mm\'}}"/></div>'+
                                                '<div class="b-input-date__btn b-input-date__btn_prev"><button ng-click="decrEndMinutes(popupInterval.interval)">−</button></div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="b-timeline-popup-interval__btn b-timeline-popup-interval__btn_create" ng-if="!popupInterval"><button ng-click="addInterval()">Add interval</button></div>'+
                                '<div class="b-timeline-popup-interval__btn b-timeline-popup-interval__btn_create" ng-if="popupInterval"><button ng-click="deleteInterval(popupInterval.interval)">Delete interval</button></div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '',

        scope: {
            beginDate: '=timelineBeginDate',
            endDate: '=timelineEndDate',
            intervals: '=timelineIntervals',
        },

        controllerAs: 'bTimeline',
        controller: bTimelineDirectiveCtrl,

        link: bTimelineDirectiveLink,
    }

    function bTimelineDirectiveCtrl($scope) {
        this.popup= null
    }

    function bTimelineDirectiveLink($scope, $e, $a, ngModel) {

        $scope.calcChunkIntervalLeft= function (chunk, interval) {
            var chunkPercent= (chunk.endDate.getTime() - chunk.beginDate.getTime()) / 100
            var left= ((interval.beginDate.getTime() - chunk.beginDate.getTime()) / chunkPercent)
            var right= ((chunk.endDate.getTime() - interval.endDate.getTime()) / chunkPercent)
            return left +'%'
        }
        $scope.calcChunkIntervalRight= function (chunk, interval) {
            var chunkPercent= (chunk.endDate.getTime() - chunk.beginDate.getTime()) / 100
            var right= ((chunk.endDate.getTime() - interval.endDate.getTime()) / chunkPercent)
            return right +'%'
        }

        $scope.$watchCollection('intervals', function () {
            if ($scope.intervals && $scope.intervals.length) {
                var chunk= bTimeline.sliceIntervals($scope.intervals, $scope.beginDate, $scope.endDate)
                $scope.chunk= chunk
            }
        })

        $scope.popup= null
        $scope.popupInterval= null

        $scope.popupShown= function (bTimelinePopup) {
            return $scope.popup === bTimelinePopup
        }

        $scope.popupShow= function (bTimelinePopup) {
            $scope.popup= bTimelinePopup
            $scope.$emit('bTimelinePopupShow', $scope.popup)
        }

        $scope.popupShownInterval= function (interval) {
            return ngModel.$viewValue && ngModel.$viewValue.interval && ngModel.$viewValue.interval.interval === interval.interval
        }

        $scope.popupShowInterval= function (interval) {
            $scope.popupInterval= interval
            $scope.popupShow($scope.bTimeline.popup)
            if (ngModel.$viewValue) {
                ngModel.$viewValue.interval= interval
            }
        }

        $scope.addInterval= function () {
            $scope.intervals.push({
                beginDate: new Date($scope.beginDate),
                endDate: new Date($scope.endDate),
            })
        }

        $scope.deleteInterval= function (interval) {
            var index= $scope.intervals.indexOf(interval)
            if (~index) {
                $scope.intervals.splice(index, 1)
            }
        }
    }
}



function bTimelineIntervalDirective(bTimeline) {

    return {
        restrict: 'A',
        require: '^bTimeline',

        link: bTimelineIntervalDirectiveLink,
    }

    function bTimelineIntervalDirectiveLink($scope, $e, $a) {
        //$scope.$watch('interval', function (interval) {
        //    console.log('interval!11')
        //}, true)
    }
}



function bTimelinePopupDirective(bTimeline) {

    return {
        restrict: 'A',
        require: '^bTimeline',

        controllerAs: 'bTimelinePopup',
        controller: bTimelinePopupDirectiveCtrl,

        link: bTimelinePopupDirectiveLink,
    }

    function bTimelinePopupDirectiveCtrl($scope) {

    }

    function bTimelinePopupDirectiveLink($scope, $e, $a) {

        $scope.$on('bTimelinePopupShown', function ($evt, bTimelinePopup) {
            if ($scope.bTimelinePopup === bTimelinePopup) return
            $scope.popup= null
        })

        $scope.bTimeline.popup= $scope.bTimelinePopup

    }
}



function bTimelinePopupIntervalDirective(bTimeline) {

    return {
        restrict: 'A',
        require: '^bTimelinePopup',

        link: bTimelinePopupIntervalDirectiveLink,
    }

    function bTimelinePopupIntervalDirectiveLink($scope, $e, $a) {
        $scope.$on('$destroy', function () {
            console.warn('destroy popup interval', $scope.popupInterval)
            $scope.popupInterval
        })
    }
}



function bInputDatetimeDirective(bTimeline) {

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
