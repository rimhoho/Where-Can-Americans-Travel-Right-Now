# Where Can Americans Travel Right Now?

A barebones Node.js app using D3.JS, Bootstrap, RESTful API, JDom (Web scraping),  Node JS, Heroku.
- [Link to Website](https://where-to-travel-now.herokuapp.com/).

## INTRODUCTION

```
While summer had come and we still needed to take care of doing outdoor activities during the quarantine periods, the virtual travelling is my new hobby to look the nature in world throughout videos. I once found this article, 'Countries that have reopened for American tourists' in travel off path, I was so curious whether the countries are safe enough to invite Americans - Cause, we still got increasing numbers of new cases and death rates, but they bravely open to us with a negative-PCR test or temperature check.
```

## DATA & TOOLS

```
1. The country list where American tourists can visit with no 14 days periods required.
Applying JDom laibrary is mandatory to scrap up-to-dated country list when the website is refreshing as I'm building on Node JS.
2. Total confirmed, death, new cases of COVID-19 has been applied into real-time manner.
Calling OurWorldInData API to get JSON datatype to store them into DB takes few second to be done. The data contains countries' Total confirmed, death, and new cases of COVID-19 and even beds counts per million, median age, GDP, etc. 
3. A world map.
There're many ways to add a map into application, such as adding a Google map using Google API, applying other JS libraries - Leaflet, or even inserting a map within an iframe tag that comes from other services/products. I applied the d3.map method with few reasons that is because I've never used it before, and there're at least three different datasets need to be attached into map.
```

## Refferences

For more information about COVID-19 data or country list that have reopend and deploying with Heroku

- [Coronavirus Pandemic (COVID-19), Our World in Data](https://ourworldindata.org/coronavirus)
- [COUNTRIES THAT HAVE REOPENED FOR AMERICAN TOURISTS](https://www.traveloffpath.com/countries-that-have-reopened-for-american-tourists/)
- [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)


![thank_you](https://github.com/rimhoho/where-to-travel-now/blob/master/thank_you.png)
