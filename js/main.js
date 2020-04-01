window.onload = setMap();


//Create the choropleth map
function setMap() {

  //map frame dimensions
  var width = 960,
      height = 460;

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

    //Use path object to draw geometry
    var statesMap = map.append("path")
            .datum(statesTopo)
            .attr("class", "states")
            .attr("d", path);

  //load the ATL precincts
    var precintsMap = map.selectAll(".atlanta_precints")
            .data(atlPrecintTopo)
            .enter()
            .append("path")
            .attr("class", function(d) {
              return "precincts " + d.properties.VoterDist;
            })
            .attr("d", path);


    //console.log(precintsMap);
    // console.log(csvData);
    //console.log(atlPrecints);
    // console.log(states);
  }
}
