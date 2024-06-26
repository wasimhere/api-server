const express = require("express");

const request = require('request');

const axios = require('axios');

const cors = require('cors');

const compression = require('compression');



const PORT = process.env.PORT || 3001;

const app = express();


const sites_domain = [

  "https://themoviezflix.org.vc",

  "https://hdmoviesflix.life",

  "https://themoviezflix.org.vc"

];


// use it before all route definitions
app.use(

  cors({origin: '*'}),

  compression()

);


app.get("/", (req, res) =>{

  res.redirect("/posts");

});


app.get(["/posts", "/categories", "/media"], (req, res) => {  

  var timestamp = new Date().getTime().toString();

  var cache_flush_param = ((Object.keys(req.query).length > 0) ? `&cache=flush_at_${timestamp}` : ``);

  // Request URL
  if(parseInt(req.query.site) == 1){

    var url = sites_domain[0] + '/wp-json/wp/v2' + req.url + cache_flush_param;

  }

  else if(parseInt(req.query.site) == 2){

    var url = sites_domain[1] + '/wp-json/wp/v2' + req.url + cache_flush_param;

  }

  else{

    var url = sites_domain[2] + '/wp-json/wp/v2' + req.url + cache_flush_param;

  }



  //console.log(url);
  request(url, (error, response, body) => { 

    //console.log(response.headers['x-wp-totalpages']);
    if(error){

      result = error;

    }

    else{

      result = body;

      res.set('totalPages', response.headers['x-wp-totalpages']);

      //disable cache
      res.set('Cache-control', 'no-cache, no-store, max-age=0');

    }

    res.json(JSON.parse(result));

  });

});



app.get("/generate-sitemap", async (req, res) => {

  const urls = [

    sites_domain[0] + "/wp-json/wp/v2/posts?order_by=id&order=desc&per_page=50",

    sites_domain[1] + "/wp-json/wp/v2/posts?order_by=id&order=desc&per_page=50"

  ];


  const sitemap_url = "https://movieskingpro.onrender.com/download/";

  var result = `
    <?xml version="1.0" encoding="UTF-8" ?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  `;

  for(x=0; x<urls.length; x++) {

    let body = await axios.get(urls[x]);

    (body.data).map((item, index) => {

      result += `
        <url>
          <loc>${sitemap_url + item.slug}</loc>
        </url>
      `;

    });

  }


  result += `</urlset>`; 

  //disable cache
  res.set({

    'Cache-control' : 'no-cache, no-store max-age=0',

    'Content-Disposition' : `attachment; filename=sitemap_posts.xml`

  });

  res.send(result.trim());

});


app.listen(PORT, () => {
  
  console.log(`Server listening on ${PORT}`);
  
}); 