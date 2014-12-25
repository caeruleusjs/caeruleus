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

    .directive('bScheduleMonth', bScheduleMonthDirective)

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

    .service('scheduleService', function () {

        this.getBeginDateOfWeek= function (date) {
            var beginDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
            beginDate.setHours( ((beginDate.getDay() || 7) - 1) * -24 )
            return beginDate
        }

        this.createWeek= function (date) {
            var week= []
            for (var beginDate, endDate, i= 0; i < 7; i++) {
                beginDate= endDate || this.getBeginDateOfWeek(date)
                endDate= new Date(beginDate); endDate.setDate( endDate.getDate() + 1 )
                week.push({
                    beginDate: beginDate,
                    endDate: endDate,
                })
            }
            return week
        }

        this.getBeginDateOfDay= function (date) {
            var beginDate= new Date(date.getFullYear(), date.getMonth(), date.getDate())
            return beginDate
        }

        this.createDay= function (date) {
            var day= []
            for (var beginDate, endDate, i= 0; i < 24; i++) {
                beginDate= endDate || this.getBeginDateOfDay(date)
                endDate= new Date(beginDate); endDate.setHours( endDate.getHours() + 1 )
                day.push({
                    beginDate: beginDate,
                    endDate: endDate,
                })
            }
            return day
        }

        this.getBeginDateOfHour= function (date) {
            var beginDate= new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
            return beginDate
        }

        this.createHour= function (date) {
            var hour= []
            for (var beginDate, endDate, i= 0; i < 12; i++) {
                beginDate= endDate || this.getBeginDateOfHour(date)
                endDate= new Date(beginDate); endDate.setMinutes( endDate.getMinutes() + 5 )
                hour.push({
                    beginDate: beginDate,
                    endDate: endDate,
                })
            }
            return hour
        }
    })

    .controller('ScheduleCtrl', function ($scope, $rootScope, $interval, $location, bTimeline, Issue, Tag, scheduleService) {

        var schedule= this

        $scope.showHour= function (date) {
            schedule.mode= 'hour'
            $scope.chunks= scheduleService.createHour(
                date || new Date
            )
        }

        $scope.showDay= function (date) {
            schedule.mode= 'day'
            $scope.chunks= scheduleService.createDay(
                date || new Date
            )
        }

        $scope.showWeek= function (date) {
            schedule.mode= 'week'
            $scope.chunks= scheduleService.createWeek(
                date || new Date
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



        $scope.selectedIssue
        $scope.selectIssue= function (issue) {
            $scope.selectedIssue= issue
        }

        $scope.selectedIssueInterval
        $scope.selectIssueInterval= function (issue, interval) {
            $scope.selectedIssueInterval= interval
        }

        $scope.deleteIssue= function (issue) {
            Issue.delete(issue).$promise
                .then(function (issue) {
                    var i= $scope.issues.indexOf(issue)
                    if (~i) {
                        $scope.issues.splice(i, 1)
                    }
                    $scope.selectedIssue= null
                    $scope.appDialogToggle('IssueViewDialog')
                })
            ;
        }

        $scope.selectedTags= {}
        $scope.selectTag= function (tag) {
            if ($scope.selectedTags[tag.name]) {
                return false
            } else {
                $scope.selectedTags[tag.name]= tag
                $location.search('tags', Object.keys($scope.selectedTags))
                return true
            }
        }
        $scope.unselectTag= function (tag) {
            if ($scope.selectedTags[tag.name]) {
                delete $scope.selectedTags[tag.name]
                $location.search('tags', Object.keys($scope.selectedTags))
                return true
            } else {
                return false
            }
        }

        $scope.matchedIssues= $scope.issues

        $scope.$watchCollection('selectedTags', function (selectedTags) {
            if (selectedTags && Object.keys(selectedTags).length) {
                $scope.matchedIssues= []
                angular.forEach($scope.issues, function (issue) {
                    if (issue.tags && issue.tags.length) {
                        for (var i= 0, l=issue.tags.length; i < l; i++) {
                            var tagName= issue.tags[i]
                            if (selectedTags[tagName]) {
                                $scope.matchedIssues.push(issue)
                                return
                            }
                        }
                    }
                })
            } else {
                $scope.matchedIssues= $scope.issues
            }
        })

    })



    .controller('IssueFormCtrl', function ($scope, $q, Issue, Tag) {

        $scope.$watch('AppDialog', function (AppDialog) {
            if (AppDialog) {
                AppDialog.mode='view'
            }
        })

        $scope.saveIssue= function (issue, IssueForm) {
            var create= false
            if (!(issue.guid)) { // create new issue
                create= true
                issue.guid= guid()
                issue.updatedAt= new Date
            }
            Issue.save(issue).$promise
                .then(function (issue) {
                    if (create) {
                        $scope.issues.unshift(issue)
                        $scope.selectedIssue= null
                        $scope.appDialogToggle('IssueFormDialog')
                    } else {
                        IssueForm.$setPristine(true)
                        $scope.AppDialog.mode='view'
                    }
                    var promises= []
                    angular.forEach($scope.selectedIssueTags, function (tag) {
                        if (!(tag.guid)) {
                            tag.guid= guid()
                            tag.updatedAt= new Date
                            $scope.tagsIdx[tag.name]= tag
                        }
                        var promise= Tag.save(tag).$promise
                    })
                    $q.all(promises)
                        .then(function (tags) {
                            //console.log('tags saved', tags)
                        })
                    ;
                })
            ;
        }

        $scope.selectedIssueTags= {}
        $scope.$watchCollection('selectedIssue.tags', function (tags) {
            $scope.selectedIssueTags= {}
            angular.forEach(tags, function (tag) {
                var tagModel= $scope.tagsIdx[tag]
                if (tagModel) {
                    $scope.selectedIssueTags[tag]= tagModel
                } else {
                    $scope.selectedIssueTags[tag]= {
                        name: tag
                    }
                }
            })
        })

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



function bScheduleMonthDirective($rootScope, $compile, $interval, $location, Issue, Tag) {

    return {
        restrict: 'EA',

        controllerAs: 'bScheduleMonth',
        controller: bScheduleMonthDirectiveCtrl,

        link: bScheduleMonthDirectiveLink,
    }
    function bScheduleMonthDirectiveCtrl($scope) {

    }
    function bScheduleMonthDirectiveLink($scope, $e, $a) {

        $scope.findFirstDayOfMonth= function (date) {
           var resultDate= new Date( date.getFullYear(), date.getMonth())
           return resultDate
        }

        var beginDate= $scope.findFirstDayOfMonth(new Date)
        var endDate= new Date(beginDate)
        endDate.setFullYear(
            endDate.getFullYear() + 1
        )

        var dates= []

        for (var i= beginDate.getDay(); i > 0; i--) {
            dates.push(null)
        }

        for (var date= new Date(beginDate); date < endDate; date.setDate( date.getDate() +1 )) {
            dates.push(new Date(date))
        }

        $scope.rows= [
            [], [], [], [], [], [], []
        ]

        for (var i= 0, l= dates.length; i < l; i= i+7) {
            for (var j= 0; j < 7; j++) {
                $scope.rows[j].push(dates[i+j])
            }
        }

        var hcols= $scope.hcols= []

        angular.forEach($scope.rows[6], function (colDate) { // @todo требуется рефакторинг
            var monthDate= new Date(colDate)
            var hcol= {
                date: monthDate,
                colspan: 1,
            }
            if (!hcols.length) {
                hcols.push(hcol)
            } else {
                var prevHcol= hcols[hcols.length-1]
                if (prevHcol.date.getFullYear() == monthDate.getFullYear() && prevHcol.date.getMonth() == monthDate.getMonth()) {
                    prevHcol.colspan++
                } else {
                    hcol= {
                        date: monthDate,
                        colspan: 1,
                    }
                    hcols.push(hcol)
                }
            }
        })
    }
}
