const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()
const https = require('https')
// const topojsonClient = require("topojson-client")

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
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
  
      let content = '';
      res.on('data', (d) => {
        content = content + d
      });
      res.on('end', () => {
        console.log('data received')
        console.log(typeof content)      
        return response.send(content);
      });
    }).on('error', (e) => {
      console.error(e);
    });
  });
