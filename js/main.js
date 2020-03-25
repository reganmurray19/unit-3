//Execute script when window is loaded
window.onload = function(){
  var w = 900, h = 500;

  //create body container
  var container = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "container")
    .style("background-color", "rgba(0,0,0,0.2)")

  //construct inner rectangle
  var innerRect = container.append("rect")
    .datum(400)
    .attr("width", function(d) {
      return d*2;
    })
    .attr("height", function(d) {
      return d;
    })
    .attr("class", "innerRect")
    .attr("x", 50)
    .attr("y", 50)
    .style("fill", "#FFFFFF");

    //initialize data for bubble chart
    var cityPop = [
      {
          city: 'Tokyo',
          population: 30.3
      },
      {
          city: 'Delhi',
          population: 7.33
      },
      {
          city: 'Shanghai',
          population: 6.85
      },
      {
        city: 'Mumbai',
        population: 10.39
      },
      {
          city: 'Ciudad de Mexico',
          population: 14.28
      },
      {
          city: 'Bejing',
          population: 6.02
      },
      {
          city: 'Osaka',
          population: 17.58
      },
      {
          city: 'Al-Qahirah',
          population: 8.33
      },
      {
          city: 'New York-Newark',
          population: 15.83
      },
      {
          city: 'Dhaka',
          population: 4.66
      },
      {
          city: 'Karachi',
          population: 6.03
      },
      {
          city: 'Kolkata',
          population: 9.95
      },
      {
          city: 'Istanbul',
          population: 5.41
      },
  ];

  //calculate population data min
  var min = d3.min(cityPop, function(d){
      return d.population;
  });

  //calculate population data max
  var max = d3.max(cityPop, function(d){
      return d.population;
  });

  //create x scale for circles
  var scale = d3.scaleLinear()
    .range([90, 810])
    .domain([0, 14]);

  //create y scale for circles
  var yScale = d3.scaleLinear()
    .range([450, 50])
    .domain([0, 50]);

  //set color scale
  var color = d3.scaleLinear()
    .range([
      "#FDBE85",
      "#D94701"
    ])
    .domain([min, max]);

  //create a y axis for chart
  var yAxis = d3.axisLeft(yScale);
  var axis = container.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(50, 0)")
    .call(yAxis);

  //create a title for chart
  var title = container.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", 450)
    .attr("y", 30)
    .text("1985 City Populations (Millions)");

  //label bubbles on chart
  var labels = container.selectAll(".labels")
    .data(cityPop)
    .enter()
    .append("text")
    .attr("class", "labels")
    .attr("text-anchor", "left")
    .attr("y", function(d){
      return yScale(d.population) + 25;
    });

    //create line for city names
    var nameLine = labels.append("tspan")
    .attr("class", "nameLine")
    .attr("x", function(d,i){
        return scale(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 20;
    })
    .text(function(d){
        return d.city;
    });

  //create circles proportional to city population
  var circles = container.selectAll("circles")
    .data(cityPop)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("id", function(d) {
      return d.city;
    })
    .attr("r", function(d, i){ //circle radius
      var area = d.population * 100;
      return Math.sqrt(area/Math.PI);
    })
    .attr("cx", function(d, i){
      return scale(i);
    })
    .attr("cy", function(d,i){
      return yScale(d.population);
    })
    .style("fill", function(d,i) {
      return color(d.population);
    });

    //label bubbles on chart
    var labels = container.selectAll(".labels")
      .data(cityPop)
      .enter()
      .append("text")
      .attr("class", "labels")
      .attr("text-anchor", "left")
      .attr("y", function(d){
        return yScale(d.population) - 30;
      });
}
