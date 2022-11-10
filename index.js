const PORT = process.env.PORT || 8080
const axios = require('axios') // https url access (like curl)
const cheerio = require('cheerio') // we scraper access classes
const fs = require('fs')
const express = require('express') // target url, to follow root
const app = express()
const cors = require('cors') // headers
app.use(cors())
var len = 20;

function SortByName(x, y) {
    return ((x.titles == y.titles) ? 0 : ((x.titles > y.titles) ? 1 : -1));
}


async function amazon(product) {
	var art0=[];
	let headers = {

		"Host": "www.amazon.in",
		"User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
		"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
		"Accept-Encoding": "gzip, deflate, br",
		"Connection": "keep-alive",
	}
	let url0 = `https://www.amazon.in/s?k=${product}&ref=nb_sb_noss_1`
	const resp =  axios.get(url0, { headers })
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)
			let site = "amazon"
			let titles = []
			let prices = []
			let hrefs = []
			let links = []
			let mrps = []
			$('span.a-offscreen', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
			$('span.a-text-normal', html).each(function () { titles.push($(this).text().replace(/^(MORE\ RESULTS)/g,'').replace(/^(RESULTS)/g,''));  })
			$('span.a-price-whole', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
			$('img.s-image', html).each(function () { hrefs.push($(this).attr('src')); })
			$('a.s-no-outline', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.amazon.in/')) })
			titles = titles.filter(function(e){return e});	
			prices.slice(5);titles.slice(5);hrefs.slice(5);links.slice(5);mrps.slice(5)
			for (var i = 0; i < len; i++) {
				hrefs.filter(item => !"https://m.media-amazon.com/images/I/11hfR5Cq9GL._SS200_.png".includes(item))
				let title = titles[i]
				let link = links[i]
				let href = hrefs[i]
				let price = prices[i]
				let mrp = mrps[i]
				art0.push({
					site,
					title,
					price,
					mrp,
					link,
					href,
				})
			}
			return art0;
		}).catch(err => console.log(err))
	return resp;
}


async function flip_spec(link){

	var specs = {};
	let url = `${link}`
	var result =[];
	const resp =  axios(url)
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)
			let spectab =[];
			let tabledata= [];

					$('td._1hKmbr', html).each(function(){ spectab.push(`${$(this).text().replace(/^Flipkart.*/,'').replace('undefined','')}`);})
        			$('td.URwL2w', html).each(function(){ tabledata.push(`${$(this).text().replace(/^Flipkart.*/,'')} `); })
					spectab	 =  spectab.filter(function(e){return e});	
					tabledata = tabledata.filter(function(e){return e});	

					for (var i=0; i<=spectab.length;i++){
							specs[spectab[i]] = tabledata[i];
					}
					console.log(specs)
					return specs;				
			
		}).catch(err => console.log(err))
	return resp;
}



async function flipkart(product){

	var art1=[];
	let url = `https://www.flipkart.com/search?q=${product}` // scraping url
	const resp =  axios(url)
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)

/*				// debugged- fixed url and title not found error.
	    fs.writeFile("flipkart.html", html, (err) => {
		      if (err)
				console.log(err);
		      else { console.log("done" )} 
		}); */
		    
			let site = "flipkart"	
			let titles = []
			let prices = []
			let hrefs = []
			let links = []
			let mrps = []

			$('div._27UcVY', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
			$('img._396cs4', html).each(function () { titles.push($(this).attr('alt'));  })
			// $('ul._1xgFaf', html).each(function () { specs.push($(this).text());  })
			$('div._30jeq3', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
			$('img._396cs4', html).each(function () { hrefs.push($(this).attr('src')); })
			$('a._1fQZEK', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.flipkart.com/').replace(/\?.*/,'')); })
			if(!links.length){
				$('a._2rpwqI', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.flipkart.com/').replace(/\?.*/,'')); })
			}
			
			if(!mrps.length){
				$('div._3I9_wc', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,'')); })
			}
		
			for (let i = 1; i < len; i++) {

				let title = titles[i]
				let link = links[i]
				let href = hrefs[i]
				let price = prices[i]
				let mrp = mrps[i]

				art1.push({
					site,
					title,
					price,
					mrp,
					link,
					href,

				})
			}
			return art1;
		}).catch(err => console.log(err))
	return resp;
}



async function reliance(product){


	var art2=[]
	let url = `https://www.reliancedigital.in/search?q=${product}` // scraping url
	const resp =  axios(url)
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)

			
				// debugged: fixed the price not found && Product not found.
	    fs.writeFile("reliance.html", html, (err) => {
		      if (err)
				console.log(err);
		      else { console.log("done" )} 
		}); 
		
			let site = "reliance"
			let titles = []
			let prices = []
			let hrefs = []
			let links = []
			let mrps = []
			let chk = ""

			$('div.cxlrZS', html).each(function (){ chk=$(this).text() })
			if(chk == "No Result Found, Please try other search."){
				return art2;
				//   console.log("\n\n-----------NOT FOUND IN RELIANCE---------\n\n")
			}else{
				$('span.StyledPriceBoxM__MRPText-sc-1l9ms6f-0', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
				$('p.sp__name', html).each(function () { titles.push($(this).text());  })
				$('span.kCentr', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  }); //.replace(/\,.*/,'').replace(/\..*/,'')
				$('img.imgCenter', html).each(function () { hrefs.push($(this).attr('data-srcset').replace(/^(\/)/,'https://www.reliancedigital.in/')); })
				$('div.sp', html).each(function () { links.push($(this).find('a').attr('href').replace(/^(\/)/,'https://www.reliancedigital.in/')); })

				if(!prices.length){
					$('span.llZwTv', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
				}
				if(!prices.length){
					$('span.gimCrs',html).each(function () { prices.push($(this).text().replace('₹','').replace(/\,/,'').replace(/\..*/,''));  })
				}

				for (let i = 0; i < len; i++) {

					let title = titles[i]
					let link = links[i]
					let href = hrefs[i]
					let price = prices[i]
					let mrp = mrps[i]

					if(!title==""){
					art2.push({
						site,
						title,
						price,
						mrp,
						link,
						href,

					})
					}
				} 

			}
			return art2;
		}).catch(err => console.log(err))

	return resp;
}



async function shopclues(product){


	var art3=[]
	let url3 = `https://bazaar.shopclues.com/search?q=${product}&sc_z=&z=0&count=15&user_id=&user_segment=default` // scraping url
	const resp =  axios(url3)
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)

			/*		
				// debugged- fixed not found error.
	    fs.writeFile("shopclues.html", html, (err) => {
		      if (err)
				console.log(err);
		      else { console.log("done" )} 
		}); 
		*/

			let site = "shopclues"	
			let titles = []
			let prices = []
			let hrefs = []
			let links = []
			let mrps = []
			let chk = ""
			
			$('span.no_fnd', html).each(function () { chk=$(this).text();  })
			if(chk == "NO RESULT FOUND !"){
				//res.json(result.sort(SortByName))
				return art3;
				//console.log("\n\n-----------NOT FOUND IN SHOPCLUES---------\n\n")
			}else{
				$('span.old_prices', html).each(function () { mrps.push($(this).text().replace('₹','').trim().replace(/\,/,'').replace(/\..*/,''));  })
				$('div.img_section', html).each(function () { titles.push($(this).find('img').attr('alt'));  })
				$('span.p_price', html).each(function () { prices.push($(this).text().replace('₹','').trim().replace(/\,/,'').replace(/\..*/,''));  })
				$('div.img_section', html).each(function () { hrefs.push($(this).find('img').attr('data-img')); })
				$('div.search_blocks', html).each(function () { links.push($(this).find('a').attr('href').replace(/^(\/)/,'https:/')); })

				titles = titles.filter(function(e){return e});	
				links = links.filter(function(e){return e});	

				for (let i = 0; i < len; i++) {

					hrefs.filter(item => !"//cdn.shopclues.com//images/ui/plistlogo.png".includes(item))
					let title = titles[i]
					let link = links[i]
					let href = hrefs[i]
					let price = prices[i]
					let mrp = mrps[i]
					//console.log("\n\n",title," \n\n")
					if(!title==""){
					art3.push({
						site,
						title,
						price,
						mrp,
						link,
						href,

					})
					}
					
				} 

			}
			//result = [...art0, art1, art2, art3]
			//	res.json(result.sort(SortByName))
			//res.json(result)
			//console.log(result)	
			return art3;

		}).catch(err => console.log(err))
	return resp;
}


app.get('/', function (req, res) {
	res.json('This is my node webscraper 😅 ')
})

app.get('/specs', async function(req, res){
	const _link = req.query.link
	const spec =  await flip_spec(_link)
	res.json(spec);

})

app.get('/results', async function (req, res) {

	const product = req.query.product.replace('_',' ');
	let result = []

	//amazon
	const r1 = await amazon(product);

	// flipkart
	const r2 = await flipkart(product);

	// Reliance
	const r3 = await reliance(product);

	// Shopclues
	const r4 = await shopclues(product);

	result = [r1, r2, r3, r4];
	
	res.json(result.sort(SortByName));
	console.log(result);

})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

