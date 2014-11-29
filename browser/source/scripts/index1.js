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
 */
angular.module('Caeruleus', ['bTable','bTimeline','ngRoute'])

    //.controller('TableCtrl', TableCtrl)
    //.controller('ScheduleTableCtrl', ScheduleTableCtrl)

    //.directive('bScheduleItemIntervalChunks', bScheduleItemIntervalChunksDirective)

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

    .directive('app', appDirective)

    .directive('appDialog', appDialogDirective)
    .directive('appDialogTransclude', appDialogTranscludeDirective)

    .controller('AppDialogCtrl', function ($scope, $q) {
        var dfd= $q.defer()
        this.promise= dfd.promise
        this.resolve= function (value) {
            dfd.resolve(value)
        }
        this.reject= function (err) {
            dfd.reject(err)
        }
        dfd.promise
            .then(function () {
                console.log('dialog resolved')
            })
            .catch(function () {
                console.log('dialog rejected')
            })
            .finally(function () {
                $scope.appDialogHide($scope.key)
            })
        ;
    })

    .service('Issue', Issue)

    .service('Tag', Tag)

    .controller('ScheduleCtrl', function ($scope, $rootScope, $interval, bTimeline, Issue, Tag) {

        var schedule= this

        $scope.showHour= function (date) {
            var hourBeginDate= new Date(
                date.getFullYear(), date.getMonth(), date.getDate(),
                date.getHours()
            )
            var hourEndDate= new Date(
                date.getFullYear(), date.getMonth(), date.getDate(),
                date.getHours() + 1
            )
            schedule.mode= 'hour'
            $scope.chunks= bTimeline.splitIntervalToChunks(
                hourBeginDate,
                hourEndDate,
                12
            )
        }

        $scope.showDay= function (date) {
            date= date || new Date
            var dayBeginDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
            var dayEndDate= new Date(dayBeginDate.getFullYear(), dayBeginDate.getMonth(), dayBeginDate.getDate()+1)
            schedule.mode= 'day'
            $scope.chunks= bTimeline.splitIntervalToChunks(
                dayBeginDate,
                dayEndDate,
                24
            )
        }

        $scope.showWeek= function (date) {
            date= date || new Date
            var weekBeginDate= bTimeline.findFirstDayOfWeek(date)
            var weekEndDate= new Date(weekBeginDate.getFullYear(), weekBeginDate.getMonth(), weekBeginDate.getDate()+7)
            schedule.mode= 'week'
            $scope.chunks= bTimeline.splitIntervalToChunks(
                weekBeginDate,
                weekEndDate,
                7
            )
        }

        $scope.getPrevWeekDate= function () {
            var weekBeginDate= new Date($scope.chunks[0].beginDate)
            weekBeginDate.setDate( weekBeginDate.getDate() -7)
            return weekBeginDate
        }
        $scope.getNextWeekDate= function () {
            var weekBeginDate= new Date($scope.chunks[0].beginDate)
            weekBeginDate.setDate( weekBeginDate.getDate() +7)
            return weekBeginDate
        }

        $scope.getPrevDayDate= function () {
            var dayBeginDate= new Date($scope.chunks[0].beginDate)
            dayBeginDate.setDate( dayBeginDate.getDate() -1)
            return dayBeginDate
        }
        $scope.getNextDayDate= function () {
            var dayBeginDate= new Date($scope.chunks[0].beginDate)
            dayBeginDate.setDate( dayBeginDate.getDate() +1)
            return dayBeginDate
        }

        $scope.getPrevHourDate= function () {
            var hourBeginDate= new Date($scope.chunks[0].beginDate)
            hourBeginDate.setHours( hourBeginDate.getHours() -1)
            return hourBeginDate
        }
        $scope.getNextHourDate= function () {
            var hourBeginDate= new Date($scope.chunks[0].beginDate)
            hourBeginDate.setHours( hourBeginDate.getHours() +1)
            return hourBeginDate
        }

        $rootScope.$watch('route', function (route) {
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
            .then(function () {
                if ($scope.startedIssue) {
                    $scope.continueWork($scope.startedIssue)
                }
            })
        ;

        $scope.tagsIdx= {}
        $scope.tags= Tag.query()
        $scope.tags.$promise
            .then(function (tags) {
                $scope.tagsIdx= {}
                angular.forEach(tags, function (tag) {
                    if (!($scope.tagsIdx[tag.name])) {
                        $scope.tagsIdx[tag.name]= tag
                    }
                })
            })
        ;

        console.log('issues', $scope.issues, 'tags', $scope.tags)

        var startedIssueRefreshInProgress

        $scope.startIssueRefresh= function (issue, interval) {
            if (startedIssueRefreshInProgress) {
                $interval.cancel(startedIssueRefreshInProgress)
            }
            var intervalEndDate= interval.endDate
            bTimeline.updateDate(intervalEndDate)
            return startedIssueRefreshInProgress= $interval(function () {
                bTimeline.updateDate(intervalEndDate)
                issue.updatedAt= new Date
                console.log('refreshd')
            }, 1000)
        }

        $scope.startWork= function (issue) {
            if ($scope.startedIssue) {
                $scope.stopWork($scope.startedIssue)
            }
            $scope.startedIssue= issue
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
            $scope.saveWork(issue)
            $scope.startIssueRefresh(issue, interval)
        }

        $scope.stopWork= function (issue) {
            var lastInterval= issue.intervals[issue.intervals.length-1]
            lastInterval.endDate= new Date
            issue.startedAt= null
            issue.updatedAt= new Date
            if (startedIssueRefreshInProgress) {
                $interval.cancel(startedIssueRefreshInProgress)
            }
            $scope.startedIssue= null
            $scope.saveWork(issue)
        }

        $scope.continueWork= function (issue) {
            var lastInterval= issue.intervals[issue.intervals.length-1]
            $scope.startIssueRefresh(issue, lastInterval)
        }

        $scope.saveWork= function (issue) {
            Issue.save(issue).$promise
                .then(function (issue) {
                    console.log('saved.')
                })
            ;
        }
    })
;



function Issue($q) {

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
}

function Tag($q) {

    this.query= function () {
        var key= ['caeruleus','tags'].join(':')
        var dfd= $q.defer()
        var tags= []
        Object.defineProperty(tags, '$promise', { configurable:true, value:dfd.promise })
        localforage.keys(function (err, keys) {
            var guids= []
            var promises= []
            angular.forEach(keys, function (key) {
                var match
                if (match= key.match(/^caeruleus:tags:([a-z0-9\-]{1,})$/)) {
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
                            tags.push(value)
                        })
                        dfd.resolve(tags)
                    })
                ;
            } else {
                dfd.resolve(tags)
            }
        })
        return tags
    }

    this.save= function (tag) {
        if (!(tag) || !(tag.guid)) {
            throw new Error
        }
        var key= ['caeruleus','tags',tag.guid].join(':')
        var dfd= $q.defer()
        Object.defineProperty(tag, '$promise', { configurable:true, value:dfd.promise })
        localforage.setItem(key, tag, function (err, value) {
            if (err) {
                dfd.reject(err)
            } else {
                setTimeout(function () {
                    jQuery.extend(true, tag, value)
                    dfd.resolve(tag)
                }, 137)
            }
        })
        return tag
    }
}



function appDirective($rootScope) {
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



function appDialogDirective($rootScope) {
    return {
        restrict: 'A',
        require: '^app',
        transclude: 'element',
        link: function ($scope, $e, $a, app, $transclude) {
            $rootScope.useDialog($a.appDialog, {
                $scope: $scope,
                $e: $e,
                $transclude: $transclude,
            })
        }
    }
}

function appDialogTranscludeDirective($rootScope) {
    return {
        restrict: 'A',
        require: '^app',
        transclude: true,
        link: function ($scope, $e, $a) {
            var appDialogTemplate= $rootScope.getDialog($a.appDialogTransclude)
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
