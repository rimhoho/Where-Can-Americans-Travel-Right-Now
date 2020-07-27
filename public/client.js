// Base URL logic: If hosted on Heroku, format differently
var host = window.location.hostname;
if (host.includes("heroku")) {
    var base_url = "https://" + host;
} else {
    var base_url = "http://localhost:5000";
};
 
// CALLING ROADING ANIMATION
(function() {
  let bubble = d3.select("#map").append('div').attr('class', 'bubble loading');
  bubble.append('span').attr('class', 'dot loading');
  bubble.append('div').attr('class', 'dots loading').html(function(d) {return "<span></span><span></span><span></span>"});
}());

// DEFINE VARIABLES/OBJECTS
var map = d3.select("#map"),
    w = parseInt(d3.select('#map').style('width')),
    h = parseInt(d3.select('#map').style('height')),
    zoom = d3.zoom().on("zoom", function() { 
              t = d3.event.transform;         // https://github.com/d3/d3-zoom#zoomTransform
              countriesG.attr("transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
            }),
    svg = d3.select("#map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .classed("init-map", true)
            .call(zoom),
    minZoom,
    maxZoom;

// DEFINE FUNCTION
const initCountry = function(svg, w, h, map) {
  // DEFINE FUNCTIONS/OBJECTS
  let projection = d3.geoMercator()
                      .center([0, 14])
                      .scale([w / (2.4 * Math.PI)])
                      .translate([w / 2, h / 2])
                      .precision(0.1),
      geoPath = d3.geoPath().projection(projection);
  //Bind data and create one path per GeoJSON feature
  countriesG = svg.append("g").attr("id", "countryGroup");
  // add a background rectangle
  countriesG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", w)
            .attr("height", h)
            .classed('country-rect', true);
  // draw a path for each feature/country
  countriesG.selectAll("path")
            .data(topojson.feature(map, map.objects["countries"]).features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .attr("id", function(d, i) {
              return d.id;
            })
            .attr("class", "zoomFlag")
            // add an onclick action to zoom into clicked country
            .on("click", function(d, i) {
              var zoom_active = d3.select(this).classed("zoomIn") ? false : true;
              if (zoom_active) {
                d3.selectAll(".zoomFlag").classed("country-on", false);
                d3.select(this).classed("country-on", true);
                d3.select(this).classed("zoomIn", true);
                d3.select(this).style("display", "block");
                boxZoom(geoPath.bounds(d), geoPath.centroid(d), 20);
                zoom_active = false;
                console.log('active', zoom_active)
              } else {
                d3.selectAll(".zoomFlag").classed("country-on", false);
                d3.select(this).classed("zoomIn", false);

                initZoom(svg, w, h);
                zoom_active = true;
                console.log('inactive', zoom_active)
              }
            });
  
  // Add a label group to each feature/country. This will contain the country name and a background rectangle
  countryLabels = svg.append("g")
                     .attr("id", "countryLabels");
  // add the text to the label group showing country name
  // countryLabels.selectAll(".countryName")
  //              .data(topojson.feature(map, map.objects["countries"]).features)
  //              .enter()
  //              .append("text")
  //              .attr("class", "countryName")
  //              .text(function(d) {
  //                return d.properties.name;
  //              })
  //              .attr("transform", function(d) {
  //               return "translate(" + (geoPath.centroid(d)[0] -20) + "," + (geoPath.centroid(d)[1]+20) + ")";
  //             })
  // add a background rectangle the same size as the text
  countryLabels.selectAll(".canGo")
               .data(topojson.feature(map, map.objects["countries"]).features)
               .enter()
              //  .append("rect")
              //  .attr("class", "canGo")
              //  .attr('x', d => geoPath.bounds(d)[0][0])
              //  .attr('y', d => geoPath.bounds(d)[0][1])
              //  .attr('width', d => geoPath.bounds(d)[1][0] - geoPath.bounds(d)[0][0])
              //  .attr('height', d => geoPath.bounds(d)[1][1] - geoPath.bounds(d)[0][1]);
}
const initZoom = function(svg, w, h){
  minZoom = 1;
  maxZoom = 3 * minZoom;
  zoom.scaleExtent([minZoom, maxZoom]).translateExtent([[0, 0], [w, h]]);
  // define X and Y offset for centre of map to be shown in centre of holder
  midX = (w - minZoom * w) / 2;
  midY = (h - minZoom * h) / 2;
  // change zoom transform to min zoom and centre offsets
  svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
};

// zoom to show a bounding box, with optional additional padding as percentage of box size
const boxZoom = function(box, centroid, paddingPerc) {
  // d3.path().bounds() returns [[left, top], [right, bottom]]
  minXY = box[0];
  maxXY = box[1];
  zoomWidth = Math.abs(minXY[0] - maxXY[0]);
  zoomHeight = Math.abs(minXY[1] - maxXY[1]);
  // find midpoint of map area defined
  zoomMidX = centroid[0];
  zoomMidY = centroid[1];
  // increase map area to include padding
  zoomWidth = zoomWidth * (1 + paddingPerc / 100);
  zoomHeight = zoomHeight * (1 + paddingPerc / 100);
  // find scale required for area to fill svg
  maxXscale = w / zoomWidth;
  maxYscale = h / zoomHeight;
  zoomScale = Math.min(maxXscale, maxYscale);
  // console.log('1: ',zoomScale)
  // HANDLE THE EDGE CASES
  // limit to max zoom (handles tiny countries)
  zoomScale = Math.min(zoomScale, maxZoom);
  // console.log('2: ',zoomScale, maxZoom)
  // limit to min zoom (handles large countries and countries that span the date line)
  zoomScale = Math.max(zoomScale, minZoom);
  // console.log('3: ',zoomScale, minZoom)
  // Find screen pixel equivalent once scaled
  offsetX = zoomScale * zoomMidX;
  offsetY = zoomScale * zoomMidY;

  // Find offset to centre, making sure no gap at left or top of holder
  dleft = Math.min(0, w / 2 - offsetX);
  dtop = Math.min(0, h / 2 - offsetY);
  // Make sure no gap at bottom or right of holder
  dleft = Math.max(w - w * zoomScale, dleft);
  dtop = Math.max(h - h * zoomScale, dtop);

  // set zoom
  svg.transition().duration(500)
     .call(
       zoom.transform,
       d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
     );
};

// GET MAP/COVID19 DATA from '/api'
Promise.all([

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.json(base_url+"/api"),
    d3.json(base_url+"/cango")

]).then(([map, api, cango]) => {

  d3.selectAll('.loading').remove();
  console.log('map: ', map);
  console.log('cango: ', cango);
  
  d3.select('.find_update').text(cango['updted_date']);
  initCountry(svg, w, h, map);
  initZoom(svg, w, h);

  // ON WINDOW RESIZE
  d3.select(window).on('resize', ()=> {
      w = parseInt(d3.select('#map').style('width')),
      h = parseInt(d3.select('#map').style('height'));
      svg = d3.select(".init-map")
        .attr("width", w)
        .attr("height", h)
        .call(zoom);
      
      console.log(w, '|', h);
      d3.selectAll('#countries').remove();
      initCountry(svg, w, h, map);
      initZoom(svg, w, h);
  });

}).catch(function(err) {
  if (err) return console.warn(err);
});

  
// countries = topojson.feature(map, map.objects["countries"]).features,
//       // mesh = topojson.mesh(map, map.objects["countries"], (a, b)=> a != b),
//       geoPath = d3.geoPath().projection(projection);
  
//   svg.selectAll(".country")
//      .data(countries)
//      .enter()
//      .attr("class", "country")
//      .attr("d", geoPath);


  // function generateTableHead(table, data) {
//   let thead = table.createTHead();
//   let row = thead.insertRow();
//   for (let key of data) {
//     let th = document.createElement("th");
//     let text = document.createTextNode(key);
//     th.appendChild(text);
//     row.appendChild(th);
//   }
// }

// function generateTable(table, data) {
//   for (let element of data) {
//     let row = table.insertRow();
//     for (key in element) {
//       let cell = row.insertCell();
//       let text = document.createTextNode(element[key]);
//       cell.appendChild(text);
//     }
//   }
// }

// let width = '100%';
// let height = 520;
// let projection = d3.geoMercator()
//     .center([-76.6180827, 39.323953])
//     .scale([140000])
//     .translate([270, 165]);
// let geoGenerator = d3.geoPath().projection(projection);
// let svg = d3.select("#map").append('svg')
//     .style("width", width)
//     .style("height", height);

// const apiData = fetch(base_url_+'/api',{
//   method : 'GET',
//   headers: {
//     'Accept' : 'application/JSON, text/plain, */*',
//     'Content-type' : 'application/json'
// }
// })
// .then(res => res.json())
// .then(data => {
// console.log('* ', data);
// // new_data = Object.assign({'#': [...Array(data[key]['data'].length).keys()]}, data);
// // console.log('$', new_data);
// for (const key in data) {
//   // data[key]['location'], data[key]['median_age'], data[key]['population_density'], data[key]['cvd_death_rate'], data[key]['gdp_per_capita'], data[key]['life_expectancy'], data[key]['data']>['date']['new_cases'], ['new_cases_per_million'], ['new_deaths'], ['new_deaths_per_million'], ['stringency_index'], ['total_cases'], ['total_cases_per_million'], ['total_deaths'], ['total_deaths_per_million']
  
//   // let table = document.querySelector("table");
//   // let data = Object.keys(mountains[0]);
//   // generateTableHead(table, data[key]['location']);
//   // generateTable(table, data);
// } 
// })
// .catch(err => console.log("err on getting API Data: ", err));
