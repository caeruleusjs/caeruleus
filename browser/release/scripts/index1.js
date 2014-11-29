/*
 * Caeruleus
 */
angular.module('Caeruleus', ['bTable','bTimeline'])

    //.controller('TableCtrl', TableCtrl)
    //.controller('ScheduleTableCtrl', ScheduleTableCtrl)

    //.directive('bScheduleItemIntervalChunks', bScheduleItemIntervalChunksDirective)

;
//
//function ScheduleTableCtrl($scope, bTable) {
//
//    this.cols= []
//    this.rows= []
//
//    this.splitIntervalToChunks= function (beginDate, endDate, numOfChunks) {
//        var chunkDuration= (endDate - beginDate) / numOfChunks
//        var chunks= []
//        for (var i= 0, date= new Date(beginDate); i < numOfChunks; i++, date.setTime(date.getTime() + chunkDuration)) {
//            var chunkBeginDate= new Date(date)
//            var chunkEndDate= new Date(chunkBeginDate)
//            chunkEndDate.setTime( chunkEndDate.getTime() + chunkDuration )
//            var chunk= {
//                beginDate: chunkBeginDate,
//                endDate: chunkEndDate,
//            }
//            chunks.push(chunk)
//        }
//        return chunks
//    }
//
//    this.findFirstDayOfWeek= function (date) {
//        var resultDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
//        resultDate.setHours( ((resultDate.getDay() || 7) - 1) * -24 )
//        return resultDate
//    }
//
//    var date= new Date
//    var beginDate= this.findFirstDayOfWeek(date)
//    var endDate= date.setDate( beginDate.getDate() + 7)
//
//    this.sliceIntervalsByChunks= function(intervals, chunks) {
//        var chunksIndex= {}
//        angular.forEach(chunks, function (chunk, index) {
//            chunksIndex[index]= chunk= {
//                beginDate: chunk.beginDate,
//                endDate: chunk.endDate,
//            }
//            angular.forEach(intervals, function (interval) {
//                if (interval.beginDate < chunk.endDate && interval.endDate > chunk.beginDate) {
//                    var chunkIntervalBeginDate= (interval.beginDate < chunk.beginDate) ? chunk.beginDate : interval.beginDate
//                    var chunkIntervalEndDate= (interval.endDate > chunk.endDate) ? chunk.endDate : interval.endDate
//                    var chunkIntervalIsBegin= (interval.beginDate >= chunk.beginDate)
//                    var chunkIntervalIsEnd= (interval.endDate <= chunk.endDate)
//                    chunk.intervalChunks= chunk.intervalChunks || []
//                    chunk.intervalChunks.push({
//                        beginDate: chunkIntervalBeginDate, isBegin: chunkIntervalIsBegin,
//                        endDate: chunkIntervalEndDate, isEnd: chunkIntervalIsEnd,
//                        interval: interval,
//                    })
//                }
//            })
//        })
//        return chunksIndex
//    }
//
//    this.cols= this.splitIntervalToChunks(beginDate, endDate, 7)
//
//    var rowsWithGroups= []
//    bTable.mapGroups(GROUPS, function (group, groupParent, i) {
//        rowsWithGroups.push({
//            type: 'group',
//            group: group,
//            groupParent: groupParent,
//        })
//    }, function (item, group, i) {
//        rowsWithGroups.push({
//            type: 'item',
//            cols: this.sliceIntervalsByChunks(item.intervals, this.cols),
//            item: item,
//            group: group,isGroupLast: (i===(group.items.length-1)),
//        })
//    }.bind(this))
//
//    this.rows= rowsWithGroups
//
//    $scope.ScheduleTableCtrl= 'ScheduleTableCtrl'
//
//    $scope.showGroup= function (group) {
//        group.shown= true
//        if (group.groups) {
//            angular.forEach(group.groups, function (group) {
//                $scope.showGroup(group)
//            })
//        }
//    }
//    $scope.hideGroup= function (group) {
//        group.shown= false
//        if (group.groups) {
//            angular.forEach(group.groups, function (group) {
//                $scope.hideGroup(group)
//            })
//        }
//    }
//
//}
//
//
//
//function bScheduleItemIntervalChunksDirective() {
//
//    return {
//        restrict: 'A',
//
//        template: ''+
//            '<div class="b-schedule-interval-chunk" ng-repeat="intervalChunk in intervalChunks track by $index" ng-class="{_isBegin:intervalChunk.isBegin,_isEnd:intervalChunk.isEnd}" ng-style="{left:calcChunkIntervalLeft(chunk,intervalChunk), right:calcChunkIntervalRight(chunk,intervalChunk)}"></div>'+
//        '',
//
//        scope: {
//            item: '=scheduleItem',
//            chunk: '=scheduleChunk',
//        },
//        controllerAs: 'bScheduleItemIntervalChunks',
//        controller: bScheduleItemIntervalChunksDirectiveCtrl,
//
//        link: bScheduleItemIntervalChunksDirectiveLink,
//    }
//
//    function bScheduleItemIntervalChunksDirectiveCtrl($scope) {
//
//        this.sliceIntervalsByChunk= function(intervals, chunk) {
//            chunk= {
//                beginDate: chunk.beginDate,
//                endDate: chunk.endDate,
//            }
//            angular.forEach(intervals, function (interval) {
//                if (interval.beginDate < chunk.endDate && interval.endDate > chunk.beginDate) {
//                    var chunkIntervalBeginDate= (interval.beginDate < chunk.beginDate) ? chunk.beginDate : interval.beginDate
//                    var chunkIntervalEndDate= (interval.endDate > chunk.endDate) ? chunk.endDate : interval.endDate
//                    var chunkIntervalIsBegin= (interval.beginDate >= chunk.beginDate)
//                    var chunkIntervalIsEnd= (interval.endDate <= chunk.endDate)
//                    chunk.intervalChunks= chunk.intervalChunks || []
//                    chunk.intervalChunks.push({
//                        beginDate: chunkIntervalBeginDate, isBegin: chunkIntervalIsBegin,
//                        endDate: chunkIntervalEndDate, isEnd: chunkIntervalIsEnd,
//                        interval: interval,
//                    })
//                }
//            })
//            return chunk
//        }
//
//        $scope.calcChunkIntervalLeft= function (chunk, interval) {
//            var chunkPercent= (chunk.endDate.getTime() - chunk.beginDate.getTime()) / 100
//            var left= ((interval.beginDate.getTime() - chunk.beginDate.getTime()) / chunkPercent)
//            var right= ((chunk.endDate.getTime() - interval.endDate.getTime()) / chunkPercent)
//            return left +'%'
//        }
//        $scope.calcChunkIntervalRight= function (chunk, interval) {
//            var chunkPercent= (chunk.endDate.getTime() - chunk.beginDate.getTime()) / 100
//            var right= ((chunk.endDate.getTime() - interval.endDate.getTime()) / chunkPercent)
//            return right +'%'
//        }
//
//    }
//
//    function bScheduleItemIntervalChunksDirectiveLink($scope, $e, $a) {
//        $scope.intervalChunks= null
//
//        //$scope.$watch('chunk', function () {
//        //    console.log('chunk!')
//        //})
//
//        $scope.$watch('item', function () {
//            var chunk= $scope.bScheduleItemIntervalChunks.sliceIntervalsByChunk($scope.item.intervals, $scope.chunk)
//            $scope.intervalChunks= chunk.intervalChunks
//        })
//    }
//
//}
//
//
//
//var GROUPS= [
//    {
//        title: 'Group 0',
//        shown: true,
//        items: [
//            {
//                title: 'Item 0',
//                intervals: [
//                    { beginDate: new Date(2014,10,25,7), endDate: new Date(2014,10,25,11) },
//                    { beginDate: new Date(2014,10,26,7), endDate: new Date(2014,10,26,11) },
//                    { beginDate: new Date(2014,10,27,7), endDate: new Date(2014,10,27,11) },
//                ]
//            },
//        ]
//    },{
//        title: 'Group 1',
//        shown: true,
//        groups: [
//            {
//                title: 'Group 1.1',
//                shown: true,
//                items: [
//                    {
//                        title: 'Item 1',
//                        intervals: [
//                            { beginDate: new Date(2014,10,25,7), endDate: new Date(2014,10,25,11) },
//                            { beginDate: new Date(2014,10,26,7), endDate: new Date(2014,10,26,11) },
//                            { beginDate: new Date(2014,10,27,7), endDate: new Date(2014,10,27,11) },
//                        ]
//                    },{
//                        title: 'Item 2',
//                        intervals: [
//                            { beginDate: new Date(2014,10,25,7), endDate: new Date(2014,10,25,11) },
//                            { beginDate: new Date(2014,10,26,7), endDate: new Date(2014,10,26,11) },
//                            { beginDate: new Date(2014,10,27,7), endDate: new Date(2014,10,27,11) },
//                        ]
//                    },{
//                        title: 'Item 3',
//                        intervals: [
//                            { beginDate: new Date(2014,10,25,7), endDate: new Date(2014,10,25,11) },
//                            { beginDate: new Date(2014,10,26,7), endDate: new Date(2014,10,26,11) },
//                            { beginDate: new Date(2014,10,27,7), endDate: new Date(2014,10,27,11) },
//                        ]
//                    },
//                ]
//            },{
//                title: 'Group 1.2',
//                shown: true,
//                items: [
//                    {
//                        title: 'Item 1',
//                        intervals: [
//                            { beginDate: new Date(2014,10,25,7), endDate: new Date(2014,10,25,11) },
//                            { beginDate: new Date(2014,10,26,7), endDate: new Date(2014,10,26,11) },
//                            { beginDate: new Date(2014,10,27,7), endDate: new Date(2014,10,27,11) },
//                        ]
//                    },
//                ]
//            },
//        ]
//    }
//]
