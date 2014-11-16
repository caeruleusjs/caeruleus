/*
 * GUID generator
 *
 * http://stackoverflow.com/a/105074
 */
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})()



/*
 * Caeruleus
 *
 * http://stackoverflow.com/a/105074
 */
angular.module('Caeruleus', ['ngRoute'])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', { name: 'schedule',
                template: ''
            })
            .otherwise({
                redirectTo: '/'
            })
        ;
    })

    .controller('ScheduleCtrl', function ($scope, $interval, Issue) {
        var schedule= this

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

        this.findFirstDayOfWeek= function (date) {
            var resultDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
            resultDate.setHours( ((resultDate.getDay() || 7) - 1) * -24 )
            return resultDate
        }

        $scope.showHour= function (date) {
            $scope.schedule.mode= 'hour'
            var hourBeginDate= new Date(
                date.getFullYear(), date.getMonth(), date.getDate(),
                date.getHours()
            )
            var hourEndDate= new Date(
                date.getFullYear(), date.getMonth(), date.getDate(),
                date.getHours() + 1
            )
            $scope.schedule.chunks= schedule.splitIntervalToChunks(
                hourBeginDate,
                hourEndDate,
                12
            )
        }

        $scope.showDay= function (date) {
            date= date || new Date
            var dayBeginDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
            var dayEndDate= new Date(dayBeginDate.getFullYear(), dayBeginDate.getMonth(), dayBeginDate.getDate()+1)
            $scope.schedule.mode= 'day'
            $scope.schedule.chunks= schedule.splitIntervalToChunks(
                dayBeginDate,
                dayEndDate,
                24
            )
        }

        $scope.showWeek= function (date) {
            date= date || new Date
            var weekBeginDate= schedule.findFirstDayOfWeek(date)
            var weekEndDate= new Date(weekBeginDate.getFullYear(), weekBeginDate.getMonth(), weekBeginDate.getDate()+7)
            $scope.schedule.mode= 'week'
            $scope.schedule.chunks= schedule.splitIntervalToChunks(
                weekBeginDate,
                weekEndDate,
                7
            )
        }

        $scope.getPrevWeekDate= function () {
            var weekBeginDate= new Date($scope.schedule.chunks[0].beginDate)
            weekBeginDate.setDate( weekBeginDate.getDate() -7)
            return weekBeginDate
        }
        $scope.getNextWeekDate= function () {
            var weekBeginDate= new Date($scope.schedule.chunks[0].beginDate)
            weekBeginDate.setDate( weekBeginDate.getDate() +7)
            return weekBeginDate
        }

        $scope.getPrevDayDate= function () {
            var dayBeginDate= new Date($scope.schedule.chunks[0].beginDate)
            dayBeginDate.setDate( dayBeginDate.getDate() -1)
            return dayBeginDate
        }
        $scope.getNextDayDate= function () {
            var dayBeginDate= new Date($scope.schedule.chunks[0].beginDate)
            dayBeginDate.setDate( dayBeginDate.getDate() +1)
            return dayBeginDate
        }

        $scope.getPrevHourDate= function () {
            var hourBeginDate= new Date($scope.schedule.chunks[0].beginDate)
            hourBeginDate.setHours( hourBeginDate.getHours() -1)
            return hourBeginDate
        }
        $scope.getNextHourDate= function () {
            var hourBeginDate= new Date($scope.schedule.chunks[0].beginDate)
            hourBeginDate.setHours( hourBeginDate.getHours() +1)
            return hourBeginDate
        }

        $scope.$on('$routeChangeSuccess', function (evt, route) {
            var date= (route.params.date) ? new Date(route.params.date) : new Date
            if ('week' === route.params.view) {
                $scope.showWeek(date)
            } else if ('day' === route.params.view) {
                $scope.showDay(date)
            } else if ('hour' === route.params.view) {
                $scope.showHour(date)
            } else {
                $scope.showDay()
            }
        })

        $scope.startedIssue= null

        $scope.issues= Issue.query()
        $scope.issues.$promise
            .then(function (issues) {
                angular.forEach(issues, function (issue) {
                    if (issue.startedAt) {
                        if (!($scope.startedIssue)) {
                            $scope.startedIssue= issue
                        } else {
                            if ($scope.startedIssue.guid !== issue.guid) {
                                issue.startedAt= null
                            }
                        }
                    }
                })
            })
        ;



        $scope.schedule= {
            chunks: [],
            issues: $scope.issues
        }

        $scope.showDay()



        var startedIssueRefreshInProgress

        $scope.startWork= function (issue) {
            if ($scope.startedIssue) {
                $scope.stopWork($scope.startedIssue)
            }
            var beginDate= new Date()
            var endDate= new Date(beginDate)
            var interval
            issue.intervals= issue.intervals || []
            issue.intervals.push(interval= {
                guid: guid(),
                beginDate: beginDate,
                endDate: endDate,
            })
            issue.startedAt= issue.updatedAt= new Date
            if (startedIssueRefreshInProgress) {
                $interval.cancel(startedIssueRefreshInProgress)
            }
            startedIssueRefreshInProgress= $interval(function () {
                endDate.setSeconds(
                    endDate.getSeconds() + 1
                )
                issue.updatedAt= new Date
                if (issue.startedAt && issue.guid) {
                    $scope.saveWork(issue)
                }
            }, 1000)
        }

        $scope.stopWork= function (issue) {
            var lastInterval= issue.intervals[issue.intervals.length-1]
            lastInterval.endDate= new Date
            issue.startedAt= null
            issue.updatedAt= new Date
            if (startedIssueRefreshInProgress) {
                $interval.cancel(startedIssueRefreshInProgress)
            }
            $scope.saveWork(issue)
        }

        $scope.continueWork= function (issue) {
            var lastInterval= issue.intervals[issue.intervals.length-1]
            lastInterval.endDate= new Date
            if (startedIssueRefreshInProgress) {
                $interval.cancel(startedIssueRefreshInProgress)
            }
            startedIssueRefreshInProgress= $interval(function () {
                lastInterval.endDate.setSeconds(
                    lastInterval.endDate.getSeconds() + 1
                )
                issue.updatedAt= new Date
                if (issue.startedAt && issue.guid) {
                    $scope.saveWork(issue)
                }
            }, 1000)
        }

        $scope.saveWork= function (issue) {
            Issue.save(issue).$promise
                .then(function (issue) {
                    console.log('saved.')
                })
            ;
        }



        $scope.selectedIssue
        $scope.selectIssue= function (issue) {
            $scope.selectedIssue= issue
        }

        $scope.deleteIssue= function (issue) {
            Issue.delete(issue).$promise
                .then(function (issue) {
                    var i= $scope.schedule.issues.indexOf(issue)
                    if (~i) {
                        $scope.schedule.issues.splice(i, 1)
                    }
                    $scope.selectedIssue= null
                    $scope.appDialogToggle('IssueViewDialog')
                })
            ;
        }
    })

    .controller('ScheduleIssueCtrl', function ($scope, Issue) {
        this.chunks= []

        this.splitIntervalsToChunks= function (chunks) {
            this.chunks= []
            if (chunks && chunks.length) {
                angular.forEach(chunks, function (chunk) {
                    this.chunks.push(chunk= {
                        beginDate: chunk.beginDate,
                        endDate: chunk.endDate,
                    })
                    if ($scope.issue && $scope.issue.intervals) {
                        angular.forEach($scope.issue.intervals, function (issueInterval) {
                            if (issueInterval.beginDate < chunk.endDate && issueInterval.endDate > chunk.beginDate) {
                                var chunkIntervalBeginDate= (issueInterval.beginDate < chunk.beginDate) ? chunk.beginDate : issueInterval.beginDate
                                var chunkIntervalEndDate= (issueInterval.endDate > chunk.endDate) ? chunk.endDate : issueInterval.endDate
                                var chunkIntervalIsBegin= (issueInterval.beginDate >= chunk.beginDate)
                                var chunkIntervalIsEnd= (issueInterval.endDate <= chunk.endDate)
                                chunk.intervals= chunk.intervals || []
                                chunk.intervals.push({
                                    beginDate: chunkIntervalBeginDate, isBegin: chunkIntervalIsBegin,
                                    endDate: chunkIntervalEndDate, isEnd: chunkIntervalIsEnd,
                                    interval: issueInterval,
                                })
                            }
                        }.bind(this))
                    }
                }.bind(this))
            }
        }

        $scope.$watchCollection('schedule.chunks', function (chunks) {
            this.splitIntervalsToChunks(chunks)
        }.bind(this))

        $scope.$watchCollection('issue', function (issue) {
            this.splitIntervalsToChunks($scope.schedule.chunks)
        }.bind(this))

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

        if ($scope.issue.startedAt) {
            $scope.continueWork($scope.issue)
        }
    })

    .controller('IssueFormCtrl', function ($scope, Issue) {
        $scope.issue= {}
        $scope.saveIssue= function (issue, IssueForm) {
            if (!(issue.guid)) { // create new issue
                issue.guid= guid()
                issue.updatedAt= new Date
            }
            Issue.save(issue).$promise
                .then(function (issue) {
                    $scope.issues.unshift(issue)
                    $scope.issue= {}
                    $scope.selectedIssue= null
                    $scope.appDialogToggle('IssueFormDialog')
                })
            ;
        }
    })

    .service('Issue', function ($q) {

        this.query= function () {
            var key= ['caeruleus','issues'].join(':')
            var dfd= $q.defer()
            var issues= []
            Object.defineProperty(issues, '$promise', { configurable:true, value:dfd.promise })
            localforage.keys(function (err, keys) {
                var guids= []
                var promises= []
                angular.forEach(keys, function (key) {
                    var match
                    if (match= key.match(/^caeruleus:issues:([a-z0-9\-]{1,})$/)) {
                        guids.push(match[1])
                        promises.push($q(function (resolve, reject) {
                            localforage.getItem(key, function (err, value) {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(value)
                                }
                            })
                        }))
                    }
                })
                if (promises.length) {
                    $q.all(promises)
                        .then(function (values) {
                            angular.forEach(values, function (value) {
                                issues.push(value)
                            })
                            dfd.resolve(issues)
                        })
                    ;
                } else {
                    dfd.resolve(issues)
                }
            })
            return issues
        }

        this.save= function (issue) {
            if (!(issue) || !(issue.guid)) {
                throw new Error
            }
            var key= ['caeruleus','issues',issue.guid].join(':')
            var dfd= $q.defer()
            Object.defineProperty(issue, '$promise', { configurable:true, value:dfd.promise })
            localforage.setItem(key, issue, function (err, value) {
                if (err) {
                    dfd.reject(err)
                } else {
                    setTimeout(function () {
                        jQuery.extend(true, issue, value)
                        dfd.resolve(issue)
                    }, 137)
                }
            })
            return issue
        }

        this.delete= function (issue) {
            if (!(issue) || !(issue.guid)) {
                throw new Error
            }
            var key= ['caeruleus','issues',issue.guid].join(':')
            var dfd= $q.defer()
            Object.defineProperty(issue, '$promise', { configurable:true, value:dfd.promise })
            localforage.removeItem(key, function (err, value) {
                if (err) {
                    dfd.reject(err)
                } else {
                    dfd.resolve(issue)
                }
            })
            return issue
        }
    })

    .directive('app', function ($rootScope) {
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
                $rootScope.appDialog= {}
                $rootScope.appDialogShow= function (name) {
                    if ($rootScope.appDialog[name]) {
                        $rootScope.appDialog[name].$shown= true
                    }
                }
                $rootScope.appDialogHide= function (name) {
                    if ($rootScope.appDialog[name]) {
                        $rootScope.appDialog[name].$shown= false
                    }
                }
                $rootScope.appDialogToggle= function (name) {
                    if ($rootScope.appDialog[name]) {
                        $rootScope.appDialog[name].$shown= !$rootScope.appDialog[name].$shown
                    }
                }
            }
        }
    })

        .directive('appDialog', function ($rootScope) {
            return {
                restrict: 'A',
                require: '^app',
                transclude: 'element',
                link: function ($scope, $e, $a, app, $transclude) {
                    $rootScope.appDialog[$a.appDialog]= {
                        $scope: $scope,
                        $e: $e,
                        $transclude: $transclude,
                    }
                }
            }
        })

        .directive('appDialogTransclude', function ($rootScope) {
            return {
                restrict: 'A',
                require: '^app',
                transclude: true,
                link: function ($scope, $e, $a) {
                    var appDialogTemplate= $rootScope.appDialog[$a.appDialogTransclude]
                    if (appDialogTemplate) appDialogTemplate.$transclude(appDialogTemplate.$scope, function ($eTranscluded) {
                        $e.empty()
                        $e.append($eTranscluded)
                    })
                }
            }
        })

;
