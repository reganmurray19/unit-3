function main(){
  var attrArray = ["2008 - Presidential", "2010 - Governor", "2012 - President", "2014 - Governor", "2016 - Presidential"];
  var width = 960,
      height = 460;
  var yScale = d3.scaleLinear()
    .range([0, 473])
    .domain([0, 105]);

  window.onload = setMap();

  function setColors(data){
    var colorClass = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    var colorScale = d3.scaleQuantile()
      .range(colorClass);

    var domainArray = [];
    for(var i=0; i <data.length; i++) {
      var val = parseFloat(data[i]["2008 - Presidential"]);
      domainArray.push(val);
    }
    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);
    return colorScale;
  }
  //Create the choropleth map
  function setMap() {

    //svg container for the map
    var map = d3.select("body")
          .append("svg")
          .attr("class", "map")
          .attr("width", width)
          .attr("height", height)

    //Define a projection
    var proj = d3.geoConicEqualArea()
          .center([15.6,33.75])
          .parallels([0, 63.5])
          .rotate([100, 0])
          .scale(75000)
          .translate([width / 2, height / 2]);


    //Create path for drawing map
    var path = d3.geoPath()
          .projection(proj);

    var promises = [d3.csv("data/atl_vote_data.csv"),
                    d3.json("data/atlanta_precints.json"),
                    d3.json("data/GA_precincts16.json")];

    Promise.all(promises).then(callback);

    //Callback function
    function callback(data) {

      //Add data to DOM
      csvData = data[0];
      atlPrecints = data[1];
      states = data[2];


      //Convert to topoJSON
      var statesTopo = topojson.feature(states, states.objects.GA_precincts16),
          atlPrecintTopo = topojson.feature(atlPrecints, atlPrecints.objects.atlanta_precints).features;

      atlPrecintTopo = joinData(atlPrecintTopo, csvData);

      //Use path object to draw geometry
      var statesMap = map.append("path")
              .datum(statesTopo)
              .attr("class", "states")
              .attr("d", path);

      var colorScale = setColors(atlPrecintTopo);
      enumerationUnits(atlPrecintTopo, map, path, colorScale);
      //console.log(precintsMap);
      //console.log(csvData);
      //console.log(atlPrecints);
      // console.log(states);
    }
    function joinData(atlPrecintTopo, csvData){
      for(var i=0; i < csvData.length; i++) {
        var csvRegion = csvData[i];
        var csvKey = csvRegion.Precint;
        for(var j=0; j<atlPrecintTopo.length; j++) {
          var geojsonProps = atlPrecintTopo[j].properties;
          var geojsonKey = geojsonProps.VoterDist;
          if (geojsonKey == csvKey) {
            attrArray.forEach(function(attr){
              var val = parseFloat(csvRegion[attr]);
              geojsonProps[attr] = val;
            });
          };
        };
      };
      return atlPrecintTopo;
    };

  function enumerationUnits(atlPrecintTopo, map, path, colorScale) {
    var chartWidth = window.innerWidth * 0.425;
    var chartHeight = 473;
        leftPadding = 570,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
    console.log(atlPrecintTopo);
    var precintsMap = map.selectAll(".atlanta_precints")
            .data(atlPrecintTopo)
            .enter()
            .append("path")
            .attr("class", function(d) {
              return "precincts " + d.properties.VoterDist;
            })
            .attr("d", path)
            .style("fill", function(d){
              var value = d.properties["2008 - Presidential"];
              if(value) {
                return colorScale(d.properties["2008 - Presidential"]);
              } else {
                return "#ccc"
              }
            });

            var chart = d3.select("body")
              .append("svg")
              .attr("width", chartWidth)
              .attr("height", chartHeight)
              .attr("class", "chart");

            var bars = chart.selectAll(".bars")
              .data(csvData)
              .enter()
              .append("rect")
              .attr("class", function(d){
                return "bars" + d.VoterDist;
              })
              .attr("width", chartWidth/ csvData.length-1)
              .attr("x", function(d, i) {
                return i * (chartWidth / csvData.length);
              })
              .attr("height", function(d){
                return yScale(parseFloat(d["2008 - Presidential"]));
              })
              .attr("y", function(d){
                return chartHeight  - yScale(parseFloat(d["2008 - Presidential"]));
              })
              .style("fill", function(d){
                  return colorScale(d["2008 - Presidential"]);
              });

              var chartTitle = chart.append("text")
                .attr("x", 20)
                .attr("y", 40)
                .attr("class", "chartTitle")
                .text("Number of 2008 Presidential Votes By Precinct");

                var yAxis = d3.axisLeft()
                .scale(yScale);

                var axis = chart.append("g")
                  .attr("class", "axis")
                  .attr("transform", translate)
                  .call(yAxis);


  }
  }
}
main()
