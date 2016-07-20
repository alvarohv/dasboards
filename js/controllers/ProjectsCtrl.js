app.controller("ProjectsCtrl", function($scope, $filter, $http, ProjectServerService) {
    
      ProjectServerService.getTotals().then(function (data) {
        
        $scope.Total = data.Total;
        $scope.Active = data.Active;
        $scope.Finished = data.Finished;
        $scope.BullPen = data.BullPen;
        $scope.Feasibility = data.Feasibility;
        $scope.CharterDefinition = data.CharterDefinition;
        $scope.Cancelled = data.Cancelled;
        
        var d = new Date();
        $scope.Today = d.toLocaleDateString();      
        var activeList = [];
        
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        // console.log(data.ActiveProjects);
        var divisions = [];
        var leaders = [];
        for (var i = 0; i < data.ActiveProjects.length; i++) {
            
            var date = new Date(parseInt(data.ActiveProjects[i].ProjectFinishDate.replace("/Date(", "").replace(")/",""), 10));            
            var strDate = monthNames[date.getMonth()] + " " + date.getDay() + ", " + date.getYear();  //date.toLocaleDateString()
            divisions.push(data.ActiveProjects[i].ProjectDepartments);
            leaders.push(data.ActiveProjects[i].ProjectOwnerName);
            
            var row =  {    number: i+1,
                            id: data.ActiveProjects[i]._x0031_ProjectID,
                            project: data.ActiveProjects[i].ProjectName,
                            leader: data.ActiveProjects[i].ProjectOwnerName, 
                            division: data.ActiveProjects[i].ProjectDepartments, 
                            productline: data.ActiveProjects[i].ProductLine,
                            finishdate: strDate,
                            dimensions :{ finishdate: getColor(data.ActiveProjects[i].ProjectFinishDate)}
                        }                                 
            activeList.push(row);
        }
        $scope.Division = _.sortBy(_.uniq(divisions));
        $scope.Leaders = _.sortBy(_.uniq(leaders));
        
        
        $scope.activeCollection = activeList
        $scope.activeDisplayCollection = [].concat($scope.activeCollection);
        $scope.predicates = ['id', 'project', 'leader', 'finishdate','dimensions'];
        $scope.selectedPredicate = $scope.predicates[0];

        
        $scope.ActivebyLeader = _.sortBy(data.ActivebyLeader, 'Total').reverse();
        $scope.ActivebyLeaderMax = _.max(data.ActivebyLeader, function(item){ return item.Total; }).Total;
        
        $scope.ActivebyArea = _.sortBy(data.ActivebyArea, 'Total').reverse();
        $scope.ActivebyAreaMax = _.max(data.ActivebyArea, function(item){ return item.Total; }).Total;
        
        $scope.options =  {
            
            // Sets the chart to be responsive
            responsive: true,
            
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: false,

            //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero : true,

            //Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines : true,

            //String - Colour of the grid lines
            scaleGridLineColor : "rgba(0,0,0,.05)",

            //Number - Width of the grid lines
            scaleGridLineWidth : 1,

            //Boolean - If there is a stroke on each bar
            barShowStroke : true,

            //Number - Pixel width of the bar stroke
            barStrokeWidth : 2,

            //Number - Spacing between each of the X value sets
            barValueSpacing : 25,

            //Number - Spacing between data sets within X values
            barDatasetSpacing : 1,

            //String - A legend template
            legendTemplate : '<% labels.length %><ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
            
            showTooltips: false,
            
            // Function - on animation complete
            onAnimationComplete: function () {

                var ctx = this.chart.ctx;
                ctx.font = this.scale.font;
                ctx.fillStyle = this.scale.textColor
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";

                this.datasets.forEach(function (dataset) {
                    dataset.bars.forEach(function (bar) {
                        ctx.fillText(bar.value, bar.x, bar.y + 2);
                    });
                })
            }
            
        };        
        
        $scope.activebydivision = {
            labels: _.pluck(_.sortBy(data.ActivebyDivision, 'Total').reverse(), 'Division'),
            datasets: [
                {
                    label: 'Area',
                    fillColor: 'rgba(151,187,205,0.5)',
                    strokeColor: 'rgba(151,187,205,0.8)',
                    highlightFill: 'rgba(151,187,205,0.75)',
                    highlightStroke: 'rgba(151,187,205,1)',
                    data: _.pluck(_.sortBy(data.ActivebyDivision, 'Total').reverse(), 'Total')
                }
            ]
        };       
        
        $scope.activebyproductline = {
            labels: _.pluck(_.sortBy(data.ActivebyProductLine, 'Total').reverse(), 'ProductLine'),
            datasets: [
                {
                    label: 'Product Line',
                    fillColor: 'rgba(151,187,205,0.5)',
                    strokeColor: 'rgba(151,187,205,0.8)',
                    highlightFill: 'rgba(151,187,205,0.75)',
                    highlightStroke: 'rgba(151,187,205,1)',
                    data: _.pluck(_.sortBy(data.ActivebyProductLine, 'Total').reverse(), 'Total')
                }
            ]
        };
         
        // $scope.$apply();
        
        // FINISHED PROJECTS
        
            function chartData (countBy, total)
            {

                var items = [];
        
            for(var name in countBy) {
                
                var value = countBy[name];
                var color = "";
                var highlight = "";
                
                switch (name) 
                {
                    case "Exceptional ahead of schedule": // Time
                    case "Exceptional Under Budget": //Budget
                    case "The results over exceed expectations": // Quality
                    case "Major addition changes in scope that do not impact T/B/Q": // Scope
                        color = '#375623';
                        highlight = '#d6e9c9';
                        break;
                    case "Strong ahead schedule": // Time
                    case "Strong Under Budget": // Budget
                    case "The results exceed expectations": // Quality
                    case "Minor addition changes in scope that do not impact T/B/Q": // Scope
                        color = '#00B050';
                        highlight = '#99ffc7';
                        break;
                    case "On Schedule": // Time
                    case "On Budget": // Budget
                    case "The expected results were accomplished": // Quality
                    case "No changes in scope": // Scope
                        color = '#92D050';
                        highlight = '#5b8d25';
                        break;
                    case "Behind schedule": // Time
                    case "Fair Over Budget": //Budget
                    case "The expected results were fairly accomplished": // Quality
                    case "Changes that reduce the scope that have minor impact in T/B/Q": // Scope
                        color = '#ffffb3';
                        highlight = '#e6e600';
                        break;
                    case "Fair behind schedule": // Time
                    case "Poor Over Budget": // Budget
                    case "The expected results were not accomplished at all": // Quality
                    case "Changes that reduce the scope that have major impact in T/B/Q": // Scope
                        color = '#F7464A';
                        highlight = '#FF5A5E';
                        break;
                    default:
                        color ="#D3D3D3";
                        highlight = '#A9A9A9';
                };
                
                items.push({ label: name, value: (value / total * 100).toFixed(0), color: color, highlight: highlight });
            }
            return items;
    };
    
    var totalFinished = data.FinishedProjects.length;

        // --- Get Finished Projects by Original Time ---
        // console.log(_.countBy(data.FinishedProjects, "OriginalTime"));
        // console.log(_.where(data.FinishedProjects, {Extended: false }));
        // console.log(data.TotalOriginalTime);
        // console.log(data.FinishedProjects);
        // console.log(chartData (_.countBy(data.FinishedProjects, "OriginalTime"), totalFinished));
        $scope.finishedbyoriginaltime = chartData (_.countBy(_.where(data.FinishedProjects, {Extended: false }), "OriginalTime"), data.TotalOriginalTime);
        
        // --- Get Finished Projects by Extended Time ---
        $scope.finishedbyextendedtime = chartData (_.countBy(_.where(data.FinishedProjects, {Extended: true }), "ExtendedTime"), data.TotalExtendedTime);
        
        // --- Get Finished Projects by Budget ---
        $scope.finishedbybudget = chartData (_.countBy(data.FinishedProjects, "Budget"), totalFinished);
        
        // --- Get Finished Projects by Scope ---
        $scope.finishedbyscope = chartData (_.countBy(data.FinishedProjects, "Scope"), totalFinished);
        
        // --- Get Finished Projects by Quality ---
        $scope.finishedbyquality = chartData (_.countBy(data.FinishedProjects, "Quality"), totalFinished);

        // Chart.js Options
        $scope.pieOptions =  {

            // Sets the chart to be responsive
            responsive: true,

            //Boolean - Whether we should show a stroke on each segment
            segmentShowStroke : true,

            //String - The colour of each segment stroke
            segmentStrokeColor : '#fff',

            //Number - The width of each segment stroke
            segmentStrokeWidth : 2,

            //Number - The percentage of the chart that we cut out of the middle
            percentageInnerCutout : 0, // This is 0 for Pie charts

            //Number - Amount of animation steps
            animationSteps : 100,

            //String - Animation easing effect
            animationEasing : 'easeOutBounce',

            //Boolean - Whether we animate the rotation of the Doughnut
            animateRotate : true,

            //Boolean - Whether we animate scaling the Doughnut from the centre
            animateScale : false,
            
            tooltipTemplate : "<%= value %>%",

            //String - A legend template
            legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i< segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%>: <%=segments[i].value%>%<%}%></li><%}%></ul>'
        };
        
        
        // Summary (Smart Table)
        function getColor(value)
        {
            var color = "#D3D3D3";
            
            switch (value) 
            {
                case "Exceptional ahead of schedule": // Time
                case "Exceptional Under Budget": //Budget
                case "The results over exceed expectations": // Quality
                case "Major addition changes in scope that do not impact T/B/Q": // Scope
                    color = '#375623';
                    break;
                case "Strong ahead schedule": // Time
                case "Strong Under Budget": // Budget
                case "The results exceed expectations": // Quality
                case "Minor addition changes in scope that do not impact T/B/Q": // Scope
                    color = '#00B050';
                    break;
                case "On Schedule": // Time
                case "On Budget": // Budget
                case "The expected results were accomplished": // Quality
                case "No changes in scope": // Scope
                    color = '#92D050';
                    break;
                case "Behind schedule": // Time
                case "Fair Over Budget": //Budget
                case "The expected results were fairly accomplished": // Quality
                case "Changes that reduce the scope that have minor impact in T/B/Q": // Scope
                    color = '#ffffb3';
                    break;
                case "Fair behind schedule": // Time
                case "Poor Over Budget": // Budget
                case "The expected results were not accomplished at all": // Quality
                case "Changes that reduce the scope that have major impact in T/B/Q": // Scope
                    color = '#F7464A';
                    break;
            };
            
            return color;
        }
        
        var list = [];
        
        for (var i = 0; i < data.FinishedProjects.length; i++) {
            var row =  {    number: i+1,
                            id: data.FinishedProjects[i]._x0031_ProjectID,
                            project: data.FinishedProjects[i].ProjectName,
                            leader: data.FinishedProjects[i].ProjectOwnerName, 
                            area: data.FinishedProjects[i]._x0033_Area,
                            dimensions :{ scope: getColor(data.FinishedProjects[i].Scope), originaltime: getColor(data.FinishedProjects[i].OriginalTime), extendedtime: getColor(data.FinishedProjects[i].ExtendedTime), budget:getColor(data.FinishedProjects[i].Budget), quality: getColor(data.FinishedProjects[i].Quality)}}                                 
            list.push(row);
        }

        $scope.rowCollection = list;
        $scope.displayCollection = [].concat($scope.rowCollection);
        $scope.predicates = ['number', 'id', 'project', 'leader', 'area','dimensions'];
        $scope.selectedPredicate = $scope.predicates[0];
        
        // FINISHED PROJECTS
        
        // $scope.$apply();
        
     });
});