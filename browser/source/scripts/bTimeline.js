/*
 * bTimeline
 */
angular.module('bTimeline', [])

    .service('bTimeline', bTimelineService)

    .directive('bTimeline', bTimelineDirective)
    .directive('bTimelineInterval', bTimelineIntervalDirective)

;



function bTimelineService() {



    this.splitIntervalToChunks= function (beginDate, endDate, numOfChunks) {
        var chunkDuration= (endDate - beginDate) / numOfChunks
        var chunks= []
        for (var i= 0, date= new Date(beginDate); i < numOfChunks; i++, date.setTime(date.getTime() + chunkDuration)) {
            var chunkBeginDate= new Date(date)
            var chunkEndDate= new Date(chunkBeginDate)
            chunkEndDate.setTime( chunkEndDate.getTime() + chunkDuration )
            var chunk= {
                beginDate: chunkBeginDate,
                endDate: chunkEndDate,
            }
            chunks.push(chunk)
        }
        return chunks
    }



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



    this.findFirstDayOfWeek= function (date) {
        var resultDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
        resultDate.setHours( ((resultDate.getDay() || 7) - 1) * -24 )
        return resultDate
    }



}



function bTimelineDirective(bTimeline) {

    return {
        restrict: 'E',

        template: ''+
            '<div class="b-timeline">'+
                '<div class="b-timeline__interval" b-timeline-interval ng-repeat="interval in chunk.intervals track by $index" ng-class="{_isBegin:interval.isBegin,_isEnd:interval.isEnd}" ng-style="{left:calcChunkIntervalLeft(chunk,interval), right:calcChunkIntervalRight(chunk,interval)}"></div>'+
            ''+
        '',

        scope: {
            beginDate: '=timelineBeginDate',
            endDate: '=timelineEndDate',
            intervals: '=timelineIntervals',
        },

        controllerAs: '',
        controller: bTimelineDirectiveCtrl,

        link: bTimelineDirectiveLink,
    }

    function bTimelineDirectiveCtrl($scope) {

    }

    function bTimelineDirectiveLink($scope, $e, $a) {

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
