function main() {
  var attrArray=  ["2008 - Presidential", "2010 - Governor", "2012 - President", "2014 - Governor", "2016 - Presidential"];
  var totalAnnualVotes = [90284, 86540, 98768, 110670, 181855];
  //Define color scale out here so it is accessible by sequencer
  var colors = [
    "#ffb4ad",
    "#fc8277",
    "#fc5a4c",
    "#ff301f",
    "#ff1300"
  ];

  var colorScale = d3.scaleThreshold()
    .range(colors);


  window.onload = setMap();
  //This function provides hex color values for
  //the map color scale
  function setColors(data, expressed) {

    //Store all possible attribute values in an array
    var domainArray = [];
    for(var i = 0; i < data.length; i++) {
      var val = parseFloat(data[i].properties[expressed]);
      domainArray.push(val);
    }

    //Create clusters using the ckmeans algorithm
    var clusters = ckmeans(domainArray, 5);
    //Reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
      return d3.min(d);
    });

    //Remove first value from domain array to create class breakpts
    domainArray.shift();
    console.log(domainArray);
    console.log(clusters);

    //Assign array of last 4 cluster minimums as domainArray
    colorScale.domain(domainArray);

    return colorScale;
  }

  //This function joins csv data with json data
  function joinData(atlPrecintTopo, csvData){

    //Iterate through the csv file
    for(var i=0; i < csvData.length; i++) {
      var csvRegion = csvData[i];
      var csvKey = csvRegion.Precint;

      //Iterate through each precinct and assign csv vals
      for(var j=0; j<atlPrecintTopo.length; j++) {
        var geojsonProps = atlPrecintTopo[j].properties;
        var geojsonKey = geojsonProps.VoterDist;
        if (geojsonKey == csvKey) {
          for(var k=0; k < attrArray.length; k++){
            var val = parseFloat(csvRegion[String(attrArray[k])]);
            geojsonProps[String(attrArray[k])] = val;

          };
        };
      };
    };

    return atlPrecintTopo;
  };


  //This function instantiates the map object, sets a projection, and brings
  //in the data sources
  function setMap() {

    //Basic style elements for svg container
    var width = window.innerWidth * 0.35,
        height = 700;
    //Append the html body with an svg container to hold the map
    d3.select("#mapp")
      .style("float", "left");

    var map = d3.select("#mapp")
          .append("svg")
          .attr("class", "map")
          .attr("width", width)
          .attr("height", height);

    //Define a projection
    var proj = d3.geoConicEqualArea()
          .center([15.58,33.76])
          .parallels([0, 63.5])
          .rotate([100, 0])
          .scale(130000)
          .translate([width / 2, height / 2]);


    //Create path for drawing map
    var path = d3.geoPath()
          .projection(proj);

    //Assign data to variables then promise
    var promises = [d3.csv("data/atl_vote_data.csv"),
                    d3.json("data/atlanta_precints.json"),
                    d3.json("data/GA_precincts16.json")];

    Promise.all(promises).then(callback);

    function callback(data) {

      //Add data to DOM
      csvData = data[0];
      atlPrecints = data[1];
      gaPrecincts = data[2];


      //Convert to topoJSON
      var gaPrecinctTopo = topojson.feature(gaPrecincts, gaPrecincts.objects.GA_precincts16),
          atlPrecinctTopo = topojson.feature(atlPrecints, atlPrecints.objects.atlanta_precints).features;

      //Call the joinData functino to unite csv and json data
      atlPrecinctTopo = joinData(atlPrecinctTopo, csvData);


      //Instantiate colorScale
      colorScale = setColors(atlPrecinctTopo, "2008 - Presidential");

      enumerationUnits(atlPrecinctTopo, gaPrecinctTopo, map, path, colorScale);
      var tempBool = false;
      setGraph(null, tempBool, atlPrecinctTopo);

    };
  };

  //This function appends maps to the svg element with scaled coloring
  function enumerationUnits(atlPrecintTopo, gaPrecinctTopo, map, path, colorScale) {

    //Function for when mouse is over a precinct
    var mouseOver = function(d) {
      var tempBool = true;
      setGraph(d, tempBool, atlPrecintTopo);
      d3.selectAll(".atlanta_princts")
        .transition()
        .duration(200)
        .style("opacity", .5);
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1);
    };

    var mouseLeave = function(d){
      var tempBool = true;
      setGraph(null, tempBool, atlPrecintTopo);
      d3.selectAll(".atlanta_princts")
        .transition()
        .duration(200)
        .style("opacity", 1);
    };
    //Use path object to draw all state precincts as background
    var gaPrecinctMap = map.append("path")
            .datum(gaPrecinctTopo)
            .attr("class", "statePrecincts")
            .attr("d", path)
            .style("fill", "#ffffff")
            .style("stroke", "#000000")
            .style("stroke-opacity", 0.3)
            .style("stroke-width", "0.075px");

    //Append Atlanta precincts to map
    var precintsMap = map.selectAll(".atlanta_precints")
            .data(atlPrecintTopo)
            .enter()
            .append("path")
            .attr("class", function(d){return "atlanta_princts"})
            .attr("d", path)
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
            .style("stroke-opacity", 1)
            .style("stroke", "white");

    //Call the update functiont to set the inital status of map
    update(d3.select("#timeslide").attr("min"));

  }

  d3.select("#timeslide").on("input", function() {
    update(+this.value);
  });


  //This function updates choropleth reflecting voter turnout
  function update(value) {

    document.getElementById("range").innerHTML=attrArray[value];

    d3.select("#sliderContainer")
      .style("position", "relative")
      .style("padding-top", "230px")
      .style("padding-left", "175px");

    d3.select("#range")
      .style("font-family", 'bureauGrot')
      .style("letter-spacing", "1px");

    d3.select("#timeslide")
      .style("position", "relative");

    d3.selectAll(".atlanta_princts")
      .attr("fill", function(d){
        var tempStr = String(attrArray[value]);
        var dataVal = d.properties[tempStr];
        if(dataVal) {
          return colorScale(dataVal);
        } else {
          return "#ccc";
        };
      });

}

  //This function creates the overall bar chart
  function setGraph(d, bool,atlPrecintTopo){

    if(bool == true) {
      d3.selectAll(".chart").remove();
    }

    var tempData = totalAnnualVotes;
    if (d==null) {
      tempData = totalAnnualVotes;
    } else{
      tempData = [d.properties["2008 - Presidential"], d.properties["2010 - Governor"],d.properties["2012 - President"], d.properties["2014 - Governor"], d.properties["2016 - Presidential"]];
    }
    //chart dimensions
    var chartWidth = window.innerWidth * 0.55,
        chartHeight=300;

    //Scale for the y values of the bar chart
    var max = tempData[0];
    for(var i=0; i < tempData.length; i++) {
      if(tempData[i] > max) {
        max = tempData[i];
      }
    }
    if(typeof(max) != "number" || isNaN(max)) {
      tempData = totalAnnualVotes;
      max = 200000;
    }
    var yScale = d3.scaleLinear()
      .range([0, chartHeight])
      .domain([0, max]);


    var chart = d3.select("#chartt")
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("class", "chart")
      .style("padding-top", "0px")
      .style("padding-right", "30px");

      var bars = chart.selectAll(".bars")
          .data(tempData)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("width", chartWidth / tempData.length - 1)
          .attr("x", function(d, i){
              return i * (chartWidth / tempData.length);
          })
          .attr("height", function(d){
            return yScale(parseFloat(d));
          })
          .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d));
          })
          .style("fill", function(d) {
            return colorScale(d);
          });

    //Add labels for vote values
    var numbers = chart.selectAll(".numbers")
      .data(tempData)
      .enter()
      .append("text")
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("x", function(d,i){
        var fraction = chartWidth / tempData.length;
        return i * fraction + (fraction-1)/2;
      })
      .attr("y", function(d) {
        return chartHeight - yScale(parseFloat(d)) + 45;
      })
      .text(function(d) {
        return d + " votes";
      })
      .style("fill", "white");

    //Add labels for year of election
    var yearLabels = chart.selectAll(".yearLabels")
      .data(tempData)
      .enter()
      .append("text")
      .attr("class", "chart-year-labels")
      .attr("text-anchor", "middle")
      .attr("x", function(d,i) {
        var fraction = chartWidth / tempData.length;
        return i * fraction + (fraction-1)/2;
      })
      .attr("y", function(d) {
        return chartHeight -10;
      })
      .text(function(d) {
        if(d==tempData[0]){
          return "2008";
        } else if (d==tempData[1]) {
          return "2010";
        } else if (d==tempData[2]) {
          return "2012";
        } else if (d==tempData[3]) {
          return "2014";
        } else {
          return "2016";
        }
      })
      .style("fill", "white");

    //Add a title to the chart
    if(tempData[0] != 90284) {
      var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 25)
        .attr("class", "chart-title")
        .text("Precinct: " + d.properties["VoterDist"])
        .style("fill", "black");
    } else {
      var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 25)
        .attr("class", "chart-title")
        .text("Total Votes in Atlanta Proper")
        .style("fill", "black");
    }
}
}
main();
