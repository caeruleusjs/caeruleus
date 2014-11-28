/*
 * bTable
 */
angular.module('bTable', [])

    .service('bTable', bTableService)

    .directive('bTable', bTableDirective)
    .directive('bTableTemplate', bTableTemplateDirective)
    .directive('bTableTemplateTransclude', bTableTemplateTranscludeDirective)

;



function bTableService() {

    this.mapGroups= function mapGroups(groups, onGroup, onItem, _parent) {
        angular.forEach(groups, function (group, i) {
            onGroup(group, _parent, i)
            if (group.groups) {
                mapGroups(group.groups, onGroup, onItem, group)
            } else if (group.items) {
                angular.forEach(group.items, function (item, i) {
                    onItem(item, group, i)
                })
            }
        })
    }

    this.mapItems= function (source, onItem) {
        angular.forEach(source.items, function (item, i) {
            onItem(item, source, i)
        })
    }

    this.mapGroups1= function (source, onGroup) {
        angular.forEach(source.groups, function (group, i) {
            onGroup(group, source, i)
            // map source recursive
            // NOWAY
        })
    }

    this.mapSource= function (source, onGroup, onItem) {
        console.log('mapSource', source)
        if (source.groups) {
            this.mapGroups1(source, onGroup)
        } else {
            this.mapItems(source, onItem)
        }
    }


    //var source1= {
    //    items: [
    //        {}, {}, {},
    //    ]
    //}
    //this.mapSource(source1)
}



function bTableDirective($compile) {

    return {
        restrict: 'E',

        scope: {
            tableCols: '=tableCols',
            tableRows: '=tableRows',
        },
        controllerAs: 'bTable',
        controller: bTableDirectiveCtrl,

        link: bTableDirectiveLink,
    }

    function bTableDirectiveCtrl() {

        this.$templates= {}
        this.useTemplate= function (name, template) {
            if (this.$templates[name]) {
                this.$templates[name].push(template)
            } else {
                this.$templates[name]= [template]
            }
        }

    }

    function bTableDirectiveLink($scope, $e, $a) {

        $scope.$watchCollection('tableCols', function () {
            console.log('bTable cols!', $scope.tableCols)
        })
        $scope.$watchCollection('tableRows', function () {
            console.log('bTable rows!', $scope.tableRows)
        })

        var template= ''+
            '<table class="b-table">'+
                '<caption class="b-table__caption" b-table-template-transclude="caption"></caption>'+
                '<thead class="b-table__head b-table__head_last">'+
                    '<tr>'+
                        '<th class="b-table__col b-table__col_title">'+
                            '<div b-table-template-transclude="head-title"></div>'+
                        '</td>'+
                        '<th class="b-table__col b-table__col_chunk b-table__chunk-head" ng-repeat="tableCol in tableCols" ng-class="{\'b-table__col_chunk-first\':$first,\'b-table__col_chunk-even\':$even,\'b-table__col_chunk-odd\':$odd,\'b-table__col_chunk-last\':$last}">'+
                            '<div b-table-template-transclude="head-col"></div>'+
                        '</td>'+
                    '</tr>'+
                '</thead>'+
                '<tbody class="b-table__body" ng-repeat="tableRow in tableRows" ng-class="{_groupLast:tableRow.isGroupLast}">'+
                    '<tr class="b-table__row b-table__row_group" ng-if="tableRow.type==\'group\'" ng-class="{_shown:tableRow.group.shown}">'+
                        '<td class="b-table__col b-table__col_title"><div b-table-template-transclude="body-group-title"></div></td>'+
                        '<td class="b-table__col b-table__col_chunk" ng-repeat="tableCol in tableCols" ng-class="{\'_first\':$first,\'_last\':$last}"><div b-table-template-transclude="body-group-col"></div></td>'+
                    '</tr>'+
                    '<tr class="b-table__row b-table__row_item" ng-if="!tableRow.type||tableRow.type==\'item\'" ng-show="!tableRow.group||tableRow.group.shown">'+
                        '<td class="b-table__col b-table__col_title"><div b-table-template-transclude="body-title"></div></td>'+
                        '<td class="b-table__col b-table__col_chunk" ng-repeat="tableCol in tableCols" ng-class="{\'_first\':$first,\'_last\':$last}"><div b-table-template-transclude="body-col"></div></td>'+
                    '</tr>'+
                '</tbody>'+
            '</table>'+
        ''
        $e.append($compile(template)($scope))
    }

}



function bTableTemplateDirective($parse) {

    return {
        restrict: 'E',
        require: '^bTable',
        transclude: 'element',
        link: bTableTemplateDirectiveLink,
    }

    function bTableTemplateDirectiveLink($scope, $e, $a, bTable, $transclude) {
        if ($a.id) {
            bTable.useTemplate($a.id, {
                $e: $e,
                $transclude: $transclude,
                use: $parse($a.use)(),
            })
        }
    }

}

function bTableTemplateTranscludeDirective() {

    return {
        transclude: true,
        link: bTableTemplateTranscludeDirectiveLink,
    }

    function bTableTemplateTranscludeDirectiveLink($scope, $e, $a) {
        if ($scope.bTable && $a.bTableTemplateTransclude) {
            var template= $scope.bTable.$templates[$a.bTableTemplateTransclude]
            if (template && template.length) {
                angular.forEach(template, function (template) {
                    template.$transclude(function ($eTranscluded) {
                        var templateScope= $eTranscluded.scope()
                        if (template.use && template.use.length) {
                            angular.forEach(template.use, function (use) {
                                templateScope[use]= $scope[use]
                            })
                        }
                        $e.append($eTranscluded)
                    })
                })
            }
        }
    }

}
