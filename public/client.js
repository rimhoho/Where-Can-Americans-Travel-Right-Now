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
var w = parseInt(d3.select('#map').style('width')),
    h = parseInt(d3.select('#map').style('height')),
    svg = d3.select("#map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .classed("init-map", true),
    minSize = 4, maxSize = 30;

// DEFINE FUNCTION
const initCountry = function(svg, w, h, map, map_w_covid) {
      // DEFINE FUNCTIONS/OBJECTS
      let projection = d3.geoMercator()
                          .center([0, maxSize])
                          .scale([w / (1.3 * Math.PI)])
                          .translate([w / 1.7, h / 2.2])
                          .precision(0.1),
          geoPath = d3.geoPath().projection(projection),
          extent_new_cases = d3.extent(Object.values(map_w_covid), d => d['new_cases_index']),
          extent_total_cases = d3.extent(Object.values(map_w_covid), d => d.confirmed_per_million),
          myBubble = d3.scaleLinear().domain(extent_total_cases).range([minSize, maxSize]),
          myColor = d3.scaleSequentialSymlog().domain(extent_new_cases)
                                              .interpolator(d3.interpolateRgbBasis(["#efda1c", "#e04747"])),
          bubbleLeggend = d3.scaleSqrt().domain(extent_new_cases).range([minSize, maxSize]);
          tooltip = d3.select('#map').append('div'),
          response_width = w/4.4 > 323 ? 380 : 323;

      // Add bubble legend - circles, segments, labels
      let legendGroup = d3.select('nav')
                          .append("svg")
                           .attr("id", "legendGroup")
                           .attr('class', 'mb-2')
                           .attr("width", response_width)
                           .attr("height", 94)
                           .attr("transform", `translate(${(w/2) - response_width/2}, 0) scale(.9)`)
                           .attr("viewbox", '0 0 100 100'),
          cx = 46,
          cy = 34,
          cy2 = 66,
          width = 160, 
          height = 16
          bottom = 88;

          legendGroup.selectAll('circle')
                      .data(extent_new_cases.reverse())
                      .enter()
                      .append('circle')
                      .attr('cx', cx)
                      .attr('cy', function(d){ 
                        return cy2 - bubbleLeggend(d)})
                      .attr('r', function(d){ return bubbleLeggend(d) })
                      .style('fill', 'white')
                      .style('stroke', '#474849');
          legendGroup.selectAll('line')
                      .data(extent_new_cases)
                      .enter()
                      .append("line")
                      .attr('x1', function(d){ return cx + bubbleLeggend(d) } )
                      .attr('x2', cx + 40)
                      .attr('y1', function(d){ return cy2 - bubbleLeggend(d) } )
                      .attr('y2', function(d){ return cy2 - bubbleLeggend(d) } )
                      .style('stroke', 'black')
                      .style('stroke-dasharray', ('2,2'));
          legendGroup.selectAll('.size_segment')
                      .data(extent_total_cases.reverse())
                      .enter()
                      .append("text")
                      .attr('class','size_segment')
                      .attr('x', cx + 42)
                      .attr('y', function(d, i){ return ((i + 1) * maxSize) + 4} )
                      .text( function(d){ return d } )
                      .attr("font-size", ".64rem")
                      .attr('alignment-baseline', 'middle');
          legendGroup.append('svg')
                      .attr('class', 'color_scale')
                      .attr('width', width)
                      .attr('height', height)
                      .style("overflow", "visible")
                      .style("display", "block");
          legendGroup.append('text')
                      .text('CONFIRMED PER 1M')
                      .attr("x", height)
                      .attr("y", bottom)
                      .attr('fill', '#474849')
                      .attr("font-size", ".66rem")
                      .attr("font-weight", "900");
          
         legendGroup.append("linearGradient")
                      .attr("id", "gradient")
                      .selectAll("stop")
                      .data(
                      [{offset: "0%",color: myColor(d3.min(Object.values(map_w_covid), d => d['new_cases_index']))}, 
                        {offset: "100%", color: myColor(d3.max(Object.values(map_w_covid), d => d['new_cases_index']))}
                      ])
                      .enter()
                      .append("stop")
                      .attr("offset", d => d.offset)
                      .attr("stop-color", d => d.color);
          legendGroup.append("rect")
                      .attr("x", width)
                      .attr("y", 28)
                      .attr("width", width)
                      .attr("height", height)
                      .style("fill", "url(#gradient)")
                      .style('stroke', '#474849');
          legendGroup.selectAll('.color_segment')
                      .data(extent_new_cases.reverse())
                      .enter()
                      .append('text')
                      .text(d => {
                        if (d > 0) {
                          return '+' + d;
                        } else {
                          return d;
                        }
                      })
                      .attr("x", (d, i) => width + ((i * width) / 1.24))
                      .attr("y", cy2)
                      .attr("font-size", ".64rem");
          legendGroup.append('text')
                      .text('NEW CASES PER 1M INDEX')
                      .attr("x", width + 12)
                      .attr("y", bottom)
                      .attr('fill', '#474849')
                      .attr("font-size", ".66rem")
                      .attr("font-weight", "900")
                      .attr('class', 'index_infos');
          legendGroup.append('g')
                     .attr('transform', `translate(${width * 1.9}, 4)`)
                     .html(`<svg width="1.2em" height="1.2em" class="bi bi-info-circle-fill" fill="#393e44" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                            </svg>`)
                     .on('mouseover', function(d) {
                          d3.select('nav').append('div')
                            .attr('class', 'legend_info')
                            .classed('hidden', false)
                            .attr('style', `left: ${d3.event.pageX + 14}px; top: ${d3.event.pageY - 6}px;`)
                            .html(`<h6>New Cases Per 1M Index</h6><p class="mb-2">Numbers represent the increases or decreases in new cases per 1M of COVID-19 for last 60 days.</p> 
                            <p>A bigger possitive number means new cases is increasing rapidly and a bigger negative number refers new cases is decreasing rapidly.</p>`)
                      })
                      .on('mouseout', function() {
                          d3.select('.legend_info').remove();
                      });
      
      //Bind data and create one path per GeoJSON feature
      mapGroup = svg.append("g").attr("id", "mapGroup");
      // add a background rectangle
      mapGroup.append("rect")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", w)
                  .attr("height", h)
                  .classed('country-rect', true);

      // draw a path for each feature/country
      mapGroup.selectAll(".pathGroup")
                  .data(topojson.feature(map, map.objects["countries"]).features)
                  .enter()
              .append("path")
                .attr("d", geoPath)
                .attr("id", function(d, i) {
                  return "path_"+ d.properties.name;
                })
                .attr("class", "pathGroup")
                .attr('fill', d => {
                  if (d.properties.covid_data != undefined) {
                    return "#ffffff"
                  } else {
                    return "#e9ecef"
                  }
                })
                .attr("class", "country_path");

        // Add a label group to each feature/country. This will contain the country name
        labelG = svg.append("g").attr("id", "labelGroup");
        labelGroup = labelG.selectAll(".labelGroup")
                              .data(topojson.feature(map, map.objects["countries"]).features)
                              .enter()
                            .append("g")
                              .attr("class", "labelGroup hover shadow-sm")
                              .attr("id", d => {
                                if (d.properties.covid_data == undefined) {
                                  return "none_data"
                                } else {
                                  return "country_" + d.properties.name;
                                }
                              })
                              .attr("transform", d => `translate(${geoPath.centroid(d)[0]}, ${geoPath.centroid(d)[1]})`)
                              .each(() => d3.selectAll("#none_data").remove());
        // Add the text to the label group showing country name
        labelGroup.append("text")
                    .attr("id", function(d, i) {
                      return d.properties.name;
                    })
                    .text(d => {
                      if (d.properties.covid_data != undefined) {
                        return d.properties.name
                      }})
                    .attr("transform", function(d) {
                      if (d.properties.covid_data != undefined) {
                        if (d.properties.name == 'Croatia' || d.properties.name == 'Albania' || d.properties.name == 'Jamaica') {
                          return `translate(-${myBubble(d.properties.covid_data['confirmed_per_million']) * 2.7}, ${myBubble(d.properties.covid_data['confirmed_per_million']) * 2.2})`
                        } else if (d.properties.name == 'Montenegro') {
                          return `translate(-${myBubble(d.properties.covid_data['confirmed_per_million']) * 4.6}, 14)`
                        } else {
                          return `translate(${myBubble(d.properties.covid_data['confirmed_per_million']) + 3}, 4)`
                        }
                    }})
                    .attr("font-size", ".64rem");
        // Add a circle to the center of country showing amount of total cases
        labelGroup.append("circle")
                  .attr("class", "bubbles")
                  .attr('r', function(d) {
                    if (d.properties.covid_data != undefined) {
                      return myBubble(d.properties.covid_data['confirmed_per_million'])
                    }})
                  .attr('fill', function(d) {
                    if (d.properties.covid_data != undefined) {
                      return myColor(d.properties.covid_data['new_cases_index'])
                  }})
                  .style('stroke', '#474849');
        // Add the flag to the label group showing the signal of the average active new cases curve by its color
        labelGroup.append("g")
                  .attr("class", "svg_flag")
                  .attr("id", function(d, i) {
                    return "flag_"+ d.properties.name;
                    })
                  .attr("transform", function(d) {
                    if (d.properties.covid_data != undefined) {
                      return `translate(0, -22)`
                  }})
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
      
        // Show Tooltip on hovor
        labelGroup.on('mouseover', function(d) {
            tooltip.attr('class', 'tooltip');
            fill_color = myColor(d.properties.covid_data['new_cases_index']);
            tooltip.classed('hidden', false)
                  .attr('style', 'left:' + (d3.event.pageX - 120) + 'px; top:' + (d3.event.pageY - 200) + 'px')
                  .html(() => {
                      let compare_with_yesterday = d.properties.covid_data.reported_yesterday > 0 ? "+" + d.properties.covid_data.reported_yesterday.toLocaleString().toString() : d.properties.covid_data.reported_yesterday.toLocaleString()
                      return `<table>
                          <thead>
                            <tr><th colspan="2" class="text-center pb-2">${d.properties.name}</th></tr>
                          </thead>
                          <tbody>
                            <tr><td class="pb-3"><small>When's open</small></td><td class="text_right bold pb-3">${d.properties.covid_data.availabile_date_for_trip}</td></tr>
                            <tr class="border-top"><td class="pt-2"><small>Confirmed per 1M</small></td><td class="text_right pt-2"><small>${d.properties.covid_data.confirmed_per_million.toLocaleString()}</small></td></tr>
                            <tr><td class="pb-3"><small>Reported Yesterday</small></td><td class="text_right pb-3"><small>${compare_with_yesterday}</small></td></tr>
                            <tr class="border-top"><td><small>New cases per 1M (last 60 days)</small></td><td class="new_case_trends"></td></tr>
                            <tr><td><small>New cases per 1M Index</small></td><td class="text_right" style="color:${fill_color}"><small>${d.properties.covid_data.new_cases_index}</small></td></tr>
                          </tbody>
                          </table>`
                  })
                  .each(() => {
                      let new_cases_60days = d.properties.covid_data.data,
                          margin = {top: 5, right: 2, bottom: 3, left: 8},
                          width = 70,
                          height = 10,
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
                                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                      // Add area
                      svg.append("path")
                          .attr("class", "area")
                          .attr("fill", fill_color)
                          .style("stroke", fill_color)
                          .style("stroke-width", 1.5)
                          .attr("d", area(new_cases_60days));
              });
            })
            .on('mouseout', function() {
                tooltip.classed('hidden', true);
            });
};

// GET MAP/COVID19 DATA from '/api'
Promise.all([

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.json(base_url+"/api"),
    d3.json(base_url+"/cango")

]).then(([map, api, cango]) => {

  d3.selectAll('.loading').remove();

  // convert api, cango data into covid_data
  let covid_data = {},
      abbreviations = Object.keys(api),
      replacements = {},
      map_w_covid = {};

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
        var infos = {}, arr_60days = [], flag = 0, count_indices = 0;
        infos['confirmed_per_million'] = parseFloat(api[abb]['data'][(api[abb]['data'].length)-1]['total_cases_per_million'].toFixed(2));
        infos['reported_yesterday'] = parseFloat(api[abb]['data'][(api[abb]['data'].length)-1]['new_cases_per_million'] - api[abb]['data'][(api[abb]['data'].length)-2]['new_cases_per_million']).toFixed(2);
        infos['population_density'] = parseFloat(api[abb]['population_density'].toFixed(2));
        infos['hospital_beds_per_thousand'] = api[abb]['hospital_beds_per_thousand'];
        let replacedItems = Object.keys(cango['list']).map((key) => {
          const newKey = replacements[key] || key;
          return { [newKey] : cango['list'][key] };
        });
        const new_cango = replacedItems.reduce((a, b) => Object.assign({}, a, b));
        infos['availabile_date_for_trip'] = new_cango[country];
        api[abb]['data'].forEach(item => {
          if (item['date'] == year + '-' + month + '-' + day) {
            arr_60days[flag] = {'date': item['date'], 'index': parseFloat(item['new_cases_per_million'].toFixed(2))};
            flag = flag + 1;
          } else if (flag > 0) {
            arr_60days[flag] = {'date': item['date'], 'index': parseFloat(item['new_cases_per_million'].toFixed(2))};
            flag = flag + 1;
          }
        })
        for (var i = 1; i < arr_60days.length; i++) {
          count_indices = (arr_60days[i]['index'] - arr_60days[i - 1]['index']) + count_indices;
        }
        infos['new_cases_index'] = parseFloat(count_indices.toFixed(2));
        infos['data'] = arr_60days;
        covid_data[api[abb]['location']] = infos;
      } else {
        var infos = {}, arr_60days = [], flag = 0, count_indices = 0;
        infos['confirmed_per_million'] = parseFloat(api['USA']['data'][(api['USA']['data'].length)-1]['total_cases_per_million'].toFixed(2));
        infos['reported_yesterday'] = parseFloat(api['USA']['data'][(api['USA']['data'].length)-1]['new_cases_per_million'] - api['USA']['data'][(api['USA']['data'].length)-2]['new_cases_per_million']).toFixed(2);
        infos['availabile_date_for_trip'] = 'States differ';
        infos['population_density'] = parseFloat(api['USA']['population_density'].toFixed(2));
        infos['hospital_beds_per_thousand'] = api['USA']['hospital_beds_per_thousand'];
        api['USA']['data'].forEach((item, i) => {
          if (item['date'] == year + '-' + month + '-' + day) {
            arr_60days[flag] = {'date': item['date'], 'index': parseFloat(item['new_cases_per_million'].toFixed(2))};
            flag = flag + 1;
          } else if (flag > 0) {
            arr_60days[flag] = {'date': item['date'], 'index': parseFloat(item['new_cases_per_million'].toFixed(2))};
            flag = flag + 1;
          }
        })
        for (var i = 1; i < arr_60days.length; i++) {
          count_indices = (arr_60days[i]['index'] - arr_60days[i - 1]['index']) + count_indices;
        }
        infos['new_cases_index'] = parseFloat(count_indices.toFixed(2));
        infos['data'] = arr_60days;
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
            geometries[key]['covid_data'] = covid_data[old_name];
            map_w_covid[old_name] = covid_data[old_name];
          } else {
            geometries[key]['covid_data'] = covid_data[d];
            map_w_covid[d] = covid_data[d];
          }
        }
      }
    }
  });
  console.log('cango + api + map = map_w_covid: ', map_w_covid)

  d3.select('.find_update').text(cango['updted_date']).attr('class', 'main_color bold');
  initCountry(svg, w, h, map, map_w_covid);

  // ON WINDOW RESIZE
  d3.select(window).on('resize', ()=> {
      w = parseInt(d3.select('#map').style('width')),
      h = parseInt(d3.select('#map').style('height'));
      svg = d3.select(".init-map")
        .attr("width", w)
        .attr("height", h);
      d3.selectAll('#mapGroup').remove();
      d3.selectAll('#legendGroup').remove();
      d3.selectAll('#labelGroup').remove();
      d3.selectAll('.tooltip.hidden').remove();
      initCountry(svg, w, h, map, map_w_covid);
  });

}).catch(function(err) {
  if (err) return console.warn(err);
});
