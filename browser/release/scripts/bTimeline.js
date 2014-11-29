/*
 * bTimeline
 */
angular.module('bTimeline', [])

    .service('bTimeline', bTimelineService)

    .directive('bTimeline', bTimelineDirective)

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



}



function bTimelineDirective(bTimeline) {

    return {
        restrict: 'E',

        template: ''+
            '<div class="b-schedule-interval-chunks">'+
                '<div class="b-schedule-interval-chunk" ng-repeat="intervalChunk in chunk.intervals track by $index" ng-class="{_isBegin:intervalChunk.isBegin,_isEnd:intervalChunk.isEnd}" ng-style="{left:calcChunkIntervalLeft(chunk,intervalChunk), right:calcChunkIntervalRight(chunk,intervalChunk)}"></div>'+
            ''+
        '',

        scope: {
            beginDate: '=timelineBeginDate',
            endDate: '=timelineEndDate',
            intervals: '=timelineIntervals',
        },
        link: bTimelineDirectiveLink,
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

        $scope.$watch('intervals', function () {
            if ($scope.intervals && $scope.intervals.length) {
                var chunk= bTimeline.sliceIntervals($scope.intervals, $scope.beginDate, $scope.endDate)
                $scope.chunk= chunk
            }
        })

    }
}
