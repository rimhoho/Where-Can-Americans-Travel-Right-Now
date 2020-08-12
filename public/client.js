// Base URL logic: If hosted on Heroku, format differently
var host = window.location.hostname;
if (host.includes("heroku")) {
    var base_url = "https://" + host;
} else {
    var base_url = "http://localhost:3000";
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
const initCountry = function(svg, w, h, map, covid_data) {
  // DEFINE FUNCTIONS/OBJECTS
  let projection = d3.geoMercator()
                      .center([0, 30])
                      .scale([w / (1.8 * Math.PI)])
                      .translate([w / 1.8, h / 2])
                      .precision(0.1),
      geoPath = d3.geoPath().projection(projection),
      myBubble = d3.scaleLinear().domain([0, d3.max(Object.values(covid_data), d => d.total_cases)]).range([4, 100]),
      myColor = d3.scaleSequentialSymlog().domain(d3.extent(Object.values(covid_data), d => d.reported_yesterday)).interpolator(d3.interpolateRgbBasis(["#0e90f9","#e23f3f"])),
      // add a tooltip
      tooltip = d3.select('#map').append('div').attr('class', 'tooltip');

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
  countriesG.selectAll(".country_path")
            .data(topojson.feature(map, map.objects["countries"]).features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .attr("id", function(d, i) {
              return "path_"+ d.properties.name;
            })
            .attr("class", "country_path")
            .attr('fill', d => {
              if (d.properties.covid_data != undefined) {
                return "#ffffff"
              } else {
                return "#e9ecef"
              }
            })
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
  
  // Add a label group to each feature/country. This will contain the country name
  countryLabels = countriesG.selectAll(".countryLabels")
                            .data(topojson.feature(map, map.objects["countries"]).features)
                            .enter().append("g")
                            .attr("class", "countryLabels hover")
                            .attr("id", d => {
                              if (d.properties.covid_data == undefined) {
                                return "none_data"
                              } else {
                                return "country_" + d.properties.name;
                              }
                            })
                            .attr("transform", function(d) {
                              if (d.properties.name == 'Croatia') {
                               return "translate(" + (geoPath.centroid(d)[0]) + "," + (geoPath.centroid(d)[1] - 10) + ")";
                              } else if (d.properties.name == 'Albania'){
                                return "translate(" + (geoPath.centroid(d)[0] + 12) + "," + (geoPath.centroid(d)[1] + 10) + ")";
                              } else if (d.properties.name == 'United States of America'){
                               return "translate(" + (geoPath.centroid(d)[0] + 30) + "," + (geoPath.centroid(d)[1] + 30) + ")";
                              } else {
                               return "translate(" + (geoPath.centroid(d)[0] + 3) + "," + (geoPath.centroid(d)[1]) + ")";
                              }
                            })
                            .each(() => d3.selectAll("#none_data").remove());
    
    countryLabels.on('mouseover', function(d) {
                    // console.log(d3.event.pageX, d3.event.pageY, d.properties);
                    tooltip.classed('hidden', false)
                           .attr('style', 'left:' + (d3.event.pageX - 130) + 'px; top:' + (d3.event.pageY - 180) + 'px')
                           .html(() => {
                            let color = d.properties.covid_data.reported_yesterday > 0 ? "tomato" : "main_color";
                            let compare_with_yesterday = d.properties.covid_data.reported_yesterday > 0 ? "+" + d.properties.covid_data.reported_yesterday.toLocaleString().toString() : d.properties.covid_data.reported_yesterday.toLocaleString()
                            return `<table>
                                <thead>
                                  <tr><th colspan="2" class="text-center pb-2">${d.properties.name}</th></tr>
                                </thead>
                                <tbody>
                                  <tr><td><small>When was open</small></td><td class="text_right bold">${d.properties.covid_data.availabile_date_for_trip}</td></tr>
                                  <tr><td><small>Confirmed</small></td><td class="text_right bold">${d.properties.covid_data.total_cases.toLocaleString()}</td></tr>
                                  <tr><td><small>Reported yesterday</small></td><td class="text_right bold ${color}">${compare_with_yesterday}</td></tr>
                                  <tr><td><small>New cases (last 60 days)</small></td><td class="new_case_trends"></td></tr>
                                  <tr><td><small>Population Density</small></td><td class="text_right"><small>${d.properties.covid_data.population_density}/km2</small></td></tr>
                                </tbody>
                                </table>`
                           })
                           .each(() => {
                                let new_cases_60days = d.properties.covid_data.data,
                                    margin = {top: 2, right: 3, bottom: 3, left: 6},
                                    width = 90,
                                    height = 20,
                                    viewHeight = 50,
                                    viewWidth = 80,
                                    parseDate = d3.timeParse("%Y-%m-%d"),
                                    formatDate = d3.timeFormat("%b %m, %Y"),
                                    maxY = d3.max(new_cases_60days, d => d.index),
                                    xScale = d3.scaleTime().range([0, width]).domain(d3.extent(new_cases_60days, d => parseDate(d.date))),
                                    yScale = d3.scaleLinear().range([height, 0]).domain([0, maxY]),
                                    // Set the area
                                    area = d3.area()
                                            .x(function(d) { return xScale(parseDate(d.date)); })
                                            .y0(function() { return yScale(0); })
                                            .y1(function(d) { return yScale(d.index); }),
                                    svg = d3.select('.new_case_trends')
                                              .attr("class", 'new_case_trends svg')
                                            .append("svg")
                                              .attr("width", width + margin.left + margin.right)
                                              .attr("height", height + margin.top + margin.bottom)
                                            .append("g")
                                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
                                    fill_color = myColor(d.properties.covid_data.reported_yesterday);
                                    console.log('color', fill_color, typeof fill_color)
                                // Add area
                                svg.append("path")
                                    .attr("class", "area")
                                    .attr("fill", fill_color)
                                    .attr("stroke", fill_color)
                                    .attr("stroke-width", 1.5)
                                    .attr("d", area(new_cases_60days));
                            });
                  })
                  .on('mouseout', function() {
                      tooltip.classed('hidden', true);
                  });

  // add a circle to the center of country showing amount of total cases
  countryLabels.append("circle")
               .attr("class", "circle")
               .attr('r', function(d) {
                if (d.properties.covid_data != undefined) {
                  return myBubble(d.properties.covid_data['total_cases'])
                }})
                 .attr('fill', d => {
                if (d.properties.covid_data != undefined) {
                  return myColor(d.properties.covid_data['reported_yesterday'])
                } else {
                  return "#f1f1ee"
                }})
                .attr("transform", d => "translate(-6, -4)");
  // add the text to the label group showing country name
  countryLabels.append("text")
               .attr("class", "countryName")
               .text(d => {
                if (d.properties.covid_data != undefined) {
                  return d.properties.name
                }
               })
               .attr("transform", function(d) {
                if (d.properties.name == 'Croatia' || d.properties.name == 'Albania') {
                 return "translate(-52, 0)";
                } else if (d.properties.name == 'Jamaica') {
                  return "translate(-10, 18)";
                } else if (d.properties.name == 'Serbia') {
                  return "translate(-48, 0)";
                } else if (d.properties.name == 'Rwanda') {
                  return "translate(-54, 0)";
                } else if (d.properties.name == 'Indonesia') {
                  return "translate(4, 0)";
                } else if (d.properties.name == 'Macedonia') {
                  return "translate(-74, -2)";
                } else if (d.properties.name == 'Haiti') {
                  return "translate(-10, 12)";
                }
               });
  // add the flag to the label group showing the signal of the average active new cases curve by its color
  countryLabels.append("g")
               .attr("class", "svg_flag")
               .attr("id", function(d, i) {
                return "flag_"+ d.properties.name;
               })
               .attr("transform", d => "translate(-6, -26)")
               .html(d => {
                if (d.properties.covid_data != undefined) {
                  return `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  style="enable-background:new 0 0 17.9 17.7;" xml:space="preserve">
                  <style type="text/css">
                    .st0{fill:#424242;}
                    .st1{fill:#8C8C8C;}
                    .st2{fill:#727272;}
                    .st3{fill:#474849;}
                    .st4{fill:#A2A2A3;}
                  </style>
                  <rect x="4.6" y="9.6" class="st0" width="3.3" height="2"/>
                  <path class="st1" d="M7.8,12.7h10.1l-3.6-4.9l3.6-4.9H7.8v8.3V12.7z"/>
                  <path class="st2" d="M4.6,11.5c0,0.6,0.6,1.1,1.3,1.1h1.3h0.7v-2.3h-2C5.2,10.4,4.6,10.9,4.6,11.5z"/>
                  <path class="st3" d="M0.3,0C0.1,0,0,0.1,0,0.3l0,0v17c0,0.2,0.1,0.3,0.3,0.3s0.3-0.1,0.3-0.3v-17l0,0C0.7,0.1,0.5,0,0.3,0z"/>
                  <rect x="0.7" y="1.3" class="st4" width="7.2" height="9.1"/>
                  </svg>`}
                  });
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

  // convert api, cango data into covid_data
  let covid_data = {};
  let abbreviations = Object.keys(api);
  let replacements = {}
  abbreviations.map(abb => {
    for (var country in cango['list']) {
      let days = 60; // Days you want to subtract
          date = new Date(),
          last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000)),
          day = last.getDate().toString().length == 1 ? "0" + last.getDate() : last.getDate(),
          month = (last.getMonth() + 1).toString().length == 1 ? "0" + (last.getMonth() + 1) : last.getMonth() + 1,
          year = last.getFullYear();

      if (country == 'North Macedonia' || country == 'Bali (Indonesia)') {
        let re = /(\w+)\s\({0,}(\w+)\){0,}/;
        replacements[country] = country.replace(re, '$2');
        country = country.replace(re, '$2');
      } else if (country == 'Dubai (UAE)') {
        replacements[country] = 'United Arab Emirates';
        country = 'United Arab Emirates'
      }

      if (country == api[abb]['location']) {
        var infos = {}, arr_60days = [], count = 0;
        infos['total_cases'] = api[abb]['data'][(api[abb]['data'].length)-1]['total_cases'];
        infos['reported_yesterday'] = api[abb]['data'][(api[abb]['data'].length)-1]['new_cases'] - api[abb]['data'][(api[abb]['data'].length)-2]['new_cases'];
        infos['population_density'] = api[abb]['population_density'];
        let replacedItems = Object.keys(cango['list']).map((key) => {
          const newKey = replacements[key] || key;
          return { [newKey] : cango['list'][key] };
        });
        const new_cango = replacedItems.reduce((a, b) => Object.assign({}, a, b));
        infos['availabile_date_for_trip'] = new_cango[country];
        api[abb]['data'].forEach(item => {
          if (item['date'] == year + '-' + month + '-' + day) {
            arr_60days[count] = {'date': item['date'], 'index': item['new_cases']};
            count = count + 1;
          } else if (count > 0) {
            arr_60days[count] = {'date': item['date'], 'index': item['new_cases']};
            count = count + 1;
          }
        })
        infos['data'] = arr_60days
        covid_data[api[abb]['location']] = infos;
      } else {
        var infos = {}, arr_60days = [], count = 0;
        infos['total_cases'] = api['USA']['data'][(api['USA']['data'].length)-1]['total_cases'];
        infos['reported_yesterday'] = api['USA']['data'][(api['USA']['data'].length)-2]['new_cases'];
        infos['population_density'] = api['USA']['population_density'];
        infos['availabile_date_for_trip'] = 'States differ';
        api['USA']['data'].forEach(item => {
          if (item['date'] == year + '-' + month + '-' + day) {
            arr_60days[count] = {'date': item['date'], 'index': item['new_cases']};
            count = count + 1;
          } else if (count > 0) {
            arr_60days[count] = {'date': item['date'], 'index': item['new_cases']};
            count = count + 1;
          }
        })
        infos['data'] = arr_60days
        covid_data['United States of America'] = infos;
      }
    }
  })

  // convert covid_data into map == Primary dataset!!
  map['objects']['countries']['geometries'].map(geometries => {
    for (const key in geometries) {
      // console.log(geometries[key]['name'])
      for (var d in covid_data) {
        if (d == 'Dominican Republic') {
          var old_name = d;
          d = 'Dominican Rep.';
        }
        if(key == 'properties' && d == geometries[key]['name']) {
          if (d == 'Dominican Rep.') {
            geometries[key]['covid_data'] = covid_data[old_name]
          } else {
            geometries[key]['covid_data'] = covid_data[d]
          }
        }
      }
    }
  })
  console.log('cango: ', cango);
  console.log('map: ', map);
  console.log('covid_data: ', covid_data)

  d3.select('.find_update').text(cango['updted_date']).attr('class', 'main_color');
  initCountry(svg, w, h, map, covid_data);
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
      d3.selectAll('#countryGroup').remove();
      d3.selectAll('.tooltip.hidden').remove();
      initCountry(svg, w, h, map, covid_data);
      initZoom(svg, w, h);
  });

}).catch(function(err) {
  if (err) return console.warn(err);
});
