const express = require('express')
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();
const https = require('https');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

app 
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/views/pages/index.html'))
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

  // app.get('/api', function(request, response) {
  //   https.get("https://covid.ourworldindata.org/data/owid-covid-data.json", (res) => {
  //     console.log('/api statusCode:', res.statusCode);
  //     // console.log('headers:', res.headers);
  //     let content = '';
  //     res.on('data', (d) => {
  //       content = content + d
  //       // d.filter(txt => txt.include() )
  //     });
  //     res.on('end', () => {
  //       console.log('api received')
  //       return response.send(content);
  //     });
  //   }).on('error', (e) => {
  //     console.error('/api error: ', e);
  //   });
  // });

  app.get('/cango', function(request, response) {
      got("https://www.traveloffpath.com/countries-that-have-reopened-for-american-tourists/").then(res => {
        let content = {}, list = {};
        const dom = new JSDOM(res.body);
        if (typeof dom.window.document.documentElement.querySelector('.post-last-modified-td').textContent == 'string') {
          content['updted_date'] =  dom.window.document.querySelector('.post-last-modified-td').textContent;
        } else {
          content['updted_date'] =  'Last Updated on ' + dom.window.document.querySelector('.updated').textContent;
        }
        // console.log('*',dom.window.document.documentElement.querySelector(".elementor-column.elementor-col-100.elementor-top-column.elementor-element.elementor-element-fe352ed").firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.textContent)
        const countryList = dom.window.document.documentElement.querySelector(".elementor-column.elementor-col-100.elementor-top-column.elementor-element.elementor-element-fe352ed").firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.childNodes;
        // console.log('**',countryList)
        countryList.forEach((country, i) => {
          console.log('***',country.textContent)
          var name, date;
          const calendar = [' January', ' February', ' March', ' April', ' May', ' June', ' July', ' August', ' September', ' October', ' November', ' December'];
          if (country.textContent.includes(' – ')) {
            name = country.textContent.split(' – ')[0];
            date = country.textContent.split(' – ')[1];
          } else {
            calendar.forEach(d => {
              if (country.textContent.includes(d)) {
                name = country.textContent.split(d)[0];
                date = d + country.textContent.split(d)[1];
              }
            });
          }
          if (date.includes('&')) {
            date = date.replace('&nbsp;', '')
          }
          list[name] = date;
          content['list'] = list;
        });
        return response.json(content);
      });
  });
