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

  app.get('/api', function(request, response) {
    https.get("https://covid.ourworldindata.org/data/owid-covid-data.json", (res) => {
      console.log('/api statusCode:', res.statusCode);
      // console.log('headers:', res.headers);
  
      let content = '';
      res.on('data', (d) => {
        content = content + d
        // d.filter(txt => txt.include() )
      });
      res.on('end', () => {
        console.log('api received')
        return response.send(content);
      });
    }).on('error', (e) => {
      console.error('/api error: ', e);
    });
  });

  app.get('/cango', function(request, response) {
      got("https://www.traveloffpath.com/countries-that-have-reopened-for-american-tourists/").then(res => {
        let content = {}, list = {};
        const dom = new JSDOM(res.body);
        content['updted_date'] = dom.window.document.querySelector('.post-last-modified-td').textContent;

        const list_title = dom.window.document.querySelector(".elementor-element.elementor-element-43a528b.elementor-widget.elementor-widget-text-editor").firstElementChild.firstElementChild.firstElementChild.innerHTML;
        content['title'] = list_title;

        const countryList = dom.window.document.querySelector(".elementor-element.elementor-element-43a528b.elementor-widget.elementor-widget-text-editor").firstElementChild.firstElementChild.firstElementChild.nextElementSibling.childNodes;
        countryList.forEach((country, i) => {
          let name, date;
          const calendar = [' January', ' February', ' March', ' April', ' May', ' June', ' July', ' August', ' September', ' October', ' November', ' December'];
          if (country.innerHTML.includes(' – ')) {
            name = country.innerHTML.split(' – ')[0];
            date = country.innerHTML.split(' – ')[1]
          } else {
            calendar.forEach(d => {
              if (country.innerHTML.includes(d)) {
                name = country.innerHTML.split(d)[0];
                date = d + country.innerHTML.split(d)[1];
              }
            });
          }
          list[name] = date;
          content['list'] = list;
        });
        return response.json(content);
      });
  });
