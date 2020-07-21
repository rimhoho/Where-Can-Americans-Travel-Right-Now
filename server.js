const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()
const https = require('https')
const jssoup = require('jssoup').default;

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
      });
      res.on('end', () => {
        console.log('api received')
        console.log(typeof content)      
        return response.send(content);
      });
    }).on('error', (e) => {
      console.error(e);
    });
  });

  app.get('/cango', function(request, response) {
    https.get("https://www.traveloffpath.com/countries-that-have-reopened-for-american-tourists/", (res) => {
      console.log('/cango statusCode:', res.statusCode);
      // console.log('headers:', res.headers);
      let find_update = document.querySelector('.post-last-modified-td').innerHTML;
      let find_countryList = document.querySelectorAll('.elementor-widget-wrap'); // 6 ~ 38 : Country List 
      console.log('Updated', find_update);
      
      find_countryList.map((country, i) => {
                        if (i > 5 && i < 39) {
                          console.log('* * ', country.innerHTML);
                          return country.innerHTML
                        }
                      })   
                      // .filter(txt => txt.includes('SomeText')) 
                      // .forEach(txt => console.log(txt)); 
      let content = '';
      res.on('data', (d) => {
        content = content + d
      });
      res.on('end', () => {
        console.log('cango received')
        console.log(typeof content)      
        return response.send(content);
      });
    }).on('error', (e) => {
      console.error(e);
    });
  });
