const PORT = process.env.PORT || 8080
//process.env.MJ_APIKEY_PRIVATE='6b5861a1f5c5fcf74a3ab11b4a92c4e8';
//process.env.MJ_APIKEY_PUBLIC='b7aff59a27bac9c40b1307d1bfc51002';
const sgMail = require('@sendgrid/mail');
var MongoClient = require('mongodb').MongoClient;
process.env.SENDGRID_API_KEY='SG.yAmfaKEqQXKaKaQERDtsgA.pPIdOURwedB5QkghH30OVK_p9mPvRsrknXCZd_iPmUQ'
const axios = require('axios') // https link access (like clink)
const cheerio = require('cheerio') // we scraper access classes
const fs = require('fs')
const express = require('express') // target link, to follow root
const app = express()
var util = require("util");
//const Mailjet = require('node-mailjet');
var path = require('path');
const cors = require('cors') // headers
app.use(cors())
var cache;
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
  	
  	let site = "Amazon"
	let titles = []
	let prices = []
  	let hrefs = []
  	let links = []
  	let mrps = []
  	for(let j=1;j<=2;j++){
	let link0 = `https://www.amazon.in/s?k=${product}&page=${j}&ref=nb_sb_noss_1`
	const resp =  axios.get(link0, { headers })
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)
			$('span.a-offscreen', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\..*/,''));  })
			$('span.a-text-normal', html).each(function () { titles.push($(this).text().replace(/^(MORE\ RESULTS)/g,'').replace(/^(RESULTS)/g,''));  })
			$('span.a-price-whole', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\..*/,''));  })
			$('img.s-image', html).each(function () { hrefs.push($(this).attr('src')); })
			$('a.s-no-outline', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.amazon.in/')) })
			titles = titles.filter(function(e){return e});	
			prices.slice(5);titles.slice(5);hrefs.slice(5);links.slice(5);mrps.slice(5)
			for (var i = 0; i < 18; i++) {
				hrefs.filter(item => !"https://m.media-amazon.com/images/I/11hfR5Cq9GL._SS200_.png".includes(item))
				let title = titles[i]
				let link = links[i]
				let href = hrefs[i]
				let price = prices[i]
				let mrp = mrps[i]
				art0.push({
					site,
					price,
					title,
					mrp,
					link,
					href,

				})
			}
			return art0;
		}).catch(err => console.log(err))
		if(j==2)
		  	return resp;
	}
}


async function flip_spec(link){

	var specs = {};
	let url = `${link}`
	const resp =  axios(url)
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)
			let spectab =[];
			let tabledata= [];


			if(url.includes("flipkart")){
				// flipkart--
				$('td._1hKmbr', html).each(function(){ spectab.push(`${$(this).text().replace(/^Flipkart.*/,'').replace('undefined','')}`);})
				$('td.URwL2w', html).each(function(){ tabledata.push(`${$(this).text().replace(/^Flipkart.*/,'')} `); })
			}else if (url.includes("amazon")){
				// Amazon		
				$('table.a-spacing-micro', html).each(function(){ 
					tabledata = ($(this).find('td.a-span9').text().replace(/\ /,'').trim().split('       '))
					spectab = ($(this).find('span.a-text-bold').text().split(/(?=[A-Z])/).join('\ ').replace(/\  /g,'').split(' '))
				})
			}else if(url.includes("shopclues")){
				// ShopClues
				$('tbody', html).each(function(){  
					tabledata.push($(this).find('td[width="70%"]').text().replace(/:/g,'').trim().replace(/\ /g,'')); // .replace(/\  /g,'').split(' ') .replace(/\ .*/g,'') .split(/[\ ..]/)
					spectab.push($(this).find('td[width="30%"]').text().split(/(?=[A-Z])/).join('\ ').replace(/^Maximum.*/,'').replace(/\  /g,'')); //.replace(/₹.*/,'').replace(/\ .*/g,'')

				});

				spectab = spectab.filter(function(e){return e});	
				tabledata = tabledata.filter(function(e){return e}).slice(0, -1);

				var ts = spectab.toString();
				console.log(ts)
				var ts3 = ts.replace(/([A-Z])([\ ])/g, '$1').trim().replace(/([\ ])([\(])([a-z])([\ ])/g,'$2$3').trim().replace(/([\ ])([\(])([\ ])/g,'$2').trim()
					// 1. var ts4 = ts3.replace(/([\ ])([\(])([\ ])/g,'$2').trim()
					// 2. var ts4 = ts3.replace(/([\ ])([\(])([a-z])([\ ])/g,'$2$3').trim().replace(/([\ ])([\(])([\ ])/g,'$2').trim()
					console.log(ts3)
					var ts2 = ts3.split(/\s+/)
					spectab = ts2
					ts = tabledata.toString();
					ts2 = ts.split(/\s+/)
					tabledata = ts2


				}else if(url.includes("reliancedigital")){
					// Reliance Digital 
					$('div.pdp__specification-row', html).each(function(){ 
						spectab.push($(this).find('div.pdp__tab-info__list__name').text()); // .replace(/\  /g,'').split(' ')
						tabledata.push($(this).find('div.pdp__tab-info__list__value').text()); // .replace(/\  /g,'').split(' ')
					});
				}

			spectab = spectab.filter(function(e){return e});	
			tabledata = tabledata.filter(function(e){return e});	

			for (var i=0; i<10;i++){
				specs[spectab[i]] = tabledata[i];
			}
			console.log(specs)
			return specs;				

		}).catch(err => console.log(err))
					return resp;
				}



async function flipkart(product){

	var art1=[];
	let headers = {

		"Host": "www.flipkart.com",
		"User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
		"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
		"Accept-Encoding": "gzip, deflate, br",
		"Connection": "keep-alive",
	}

	let site = "Flipkart"	
	let titles = []
	let prices = []
	let hrefs = []
	let links = []
	let mrps = []
	for(let j=1;j<=2;j++){
//	let link = `https://www.flipkart.com/search?q=${product}` // scraping link
	let link = `https://www.flipkart.com/search?q=${product}&page=${j}` // scraping link
	//let link = `https://www.flipkart.com/search?q=${product}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`
	let resp = axios(link, {headers})
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)


			// debugged- fixed url and title not found error.
			/* fs.writeFile("flipkart.html", html, (err) => {

		      if (err)
				console.log(err);
		      else { console.log("done" )} 
		}); */

			$('div._27UcVY', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\..*/,''));  })
			$('img._396cs4', html).each(function () { titles.push($(this).attr('alt'));  })
			// $('ul._1xgFaf', html).each(function () { specs.push($(this).text());  })
			$('div._30jeq3', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\..*/,''));  })
			$('img._396cs4', html).each(function () { hrefs.push($(this).attr('src').replace(/(.*.svg)$/,'')); })
			$('a._1fQZEK', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.flipkart.com/').replace(/\?.*/,'')); })
			if(!links.length){
				$('a._2rpwqI', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.flipkart.com/').replace(/\?.*/,'')); })
			}
			if(!links.length){
				$('a.IRpwTa', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.flipkart.com/').replace(/\?.*/,'')); })
			}
			if(!mrps.length){
				$('div._3I9_wc', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\..*/,'')); })
			}
			if(!titles.length){
				$('a.IRpwTa', html).each(function () { titles.push($(this).attr('title'));  })
			}

			if(!hrefs.length){
				$('img._2r_T1I', html).each(function () { hrefs.push($(this).attr('src').replace(/(.*.svg)$/,'')); })
			}
			//_2r_T1I

			for (let i = 1; i < 24; i++) {

				let title = titles[i]
				let link = links[i]
				let href = hrefs[i]
				let price = prices[i]
				let mrp = mrps[i]

				art1.push({
					site,
					price,
					title,
					mrp,
					link,
					href,

				})
			}
			return art1;
		}).catch(err => console.log(err))
		if(j==2)
			return resp;
	}
	
}



async function reliance(product){


	var art2=[]

  	let site = "Reliance"
  	let titles = []
  	let prices = []
  	let hrefs = []
  	let links = []
  	let mrps = []
  	for(let j=1;j<=2;j++){
	let link = `https://www.reliancedigital.in/search?q=${product}&page=${j}` // scraping link
	const resp =  axios(link)
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)


			// debugged: fixed the price not found && Product not found.
			/* fs.writeFile("reliance.html", html, (err) => {
		      if (err)
				console.log(err);
		      else { console.log("done" )} 
		}); */
			let chk = ""

			$('div.cxlrZS', html).each(function (){ chk=$(this).text() })
			if(chk == "No Result Found, Please try other search."){
				return art2;
				//   console.log("\n\n-----------NOT FOUND IN RELIANCE---------\n\n")
			}else{
				$('span.StyledPriceBoxM__MRPText-sc-1l9ms6f-0', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\..*/,''));  })
				$('p.sp__name', html).each(function () { titles.push($(this).text());  })
				$('span.kCentr', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\..*/,''));  }); //.replace(/\,.*/,'').replace(/\..*/,'')
				$('img.imgCenter', html).each(function () { hrefs.push($(this).attr('data-srcset').replace(/^(\/)/,'https://www.reliancedigital.in/')); })
				$('div.sp', html).each(function () { links.push($(this).find('a').attr('href').replace(/^(\/)/,'https://www.reliancedigital.in/')); })

				if(!prices.length){
					$('span.llZwTv', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\..*/,''));  })
				}
				if(!prices.length){
					$('span.gimCrs',html).each(function () { prices.push($(this).text().replace('₹','').replace(/\..*/,''));  })
				}

				for (let i = 0; i < 24; i++) {

					let title = titles[i]
					let link = links[i]
					let href = hrefs[i]
					let price = prices[i]
					let mrp = mrps[i]

					if(!title==""){
						art2.push({
							site,
							price,
							title,
							mrp,
							link,
							href,

						})
					}
				} 

			}
			return art2;
		}).catch(err => console.log(err))
		if(j==2)
			return resp;
	}
}


async function shopclues(product){


	var art3=[]
	let link3 = `https://bazaar.shopclues.com/search?q=${product}&sc_z=&z=0&count=15&user_id=&user_segment=default` // scraping link
	const resp =  axios(link3)
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

			let site = "ShopClues"	
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
				$('span.old_prices', html).each(function () { mrps.push($(this).text().replace('₹','').trim().replace(/\..*/,''));  })
				$('div.img_section', html).each(function () { titles.push($(this).find('img').attr('alt'));  })
				$('span.p_price', html).each(function () { prices.push($(this).text().replace('₹','').trim().replace(/\..*/,''));  })
				$('div.img_section', html).each(function () { hrefs.push($(this).find('img').attr('data-img')); })
				$('div.search_blocks', html).each(function () { links.push($(this).find('a').attr('href').replace(/^(\/)/,'https:/')); })

				titles = titles.filter(function(e){return e});	
				links = links.filter(function(e){return e});	

				for (let i = 0; i < 24; i++) {

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
							price,
							title,
							mrp,
							link,
							href,

						})
					}

				} 

			}
			//	res.json(result.sort(SortByName))

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

app.get('/cache', async function(req, res){

	var options = {
		root: path.join(__dirname)
	};
	res.sendFile('data.json', options, function (err) {
		if (err) {
			next(err);
		} else {
			console.log('Sent');
		}
	});
})



app.get('/wishlist', async function(req, res){

	const track_link= req.query.link
  	const mail_id = req.query.id
  	const title = req.query.title	

   	const act = req.query.act
 	const uri ="mongodb://127.0.0.1:27017/";
  
    MongoClient.connect(uri, function(err, db){
	  	var dbo = db.db("test");
	    	
	    if (err) throw err;
	  	console.log("Connected successfully to server");
		if(act=="i"){
	   		var cquery = { email: mail_id };
	   		dbo.collection("customers").find(cquery).toArray(function(err, result1) {
		        if (err) throw err;
				console.log(result1.length)	
			  if(result1.length!==0){
				console.log("exist")
				var query = { email: mail_id }
				var push = { $push: { link: track_link , title: title }}
				dbo.collection("customers").updateMany(query, push, function(err, result) {
				  if (err) throw err;
				  console.log("Inserted")
				  res.json("Done");
				  db.close();
				});
			  }else{
				var query = { email: mail_id , link: [track_link] , title: [title] };
				dbo.collection("customers").insertOne(query, function(err, result) {
				  if (err) throw err;
				  console.log("Inserted")
				  res.json("Done");
				  db.close();
				});
			  }	
			  
			});
		}
	  	else if(act=="r"){
	
	   	  	var query = { email: mail_id };
	   		dbo.collection("customers").find(query).toArray(function(err, result) {
		         	if (err) throw err;
					console.log("Readed: ", result)
			  		res.json(result);
		  			db.close();
		       });
		}
	  	else if(act=="d"){

			var query = { email: mail_id };
		  	var unset = { $pull: { link: track_link , title: title }}
			dbo.collection("customers").updateMany(query, unset, function(err, result) {
		        	if (err) throw err;
					console.log("Deleted: ", result)
			  		res.json("Deleted");
		  			db.close();
		       });

		}
	});

})


app.get('/email', async function(req, res){

	const id = req.query.id
  	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	//const mailjet = Mailjet.apiConnect(
	//	process.env.MJ_APIKEY_PUBLIC,
	//	process.env.MJ_APIKEY_PRIVATE,
	//);

	fs.readFile(path.join(__dirname, "thrifty-mail.html"),'utf8', function (err, data) {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		//var content = util.format(data);

	  const msg = {

		    to: id,
		    from: 'thrifty.noreply@gmail.com',
		    subject: 'Sending with Twilio SendGrid is Fun',
		    text: 'and easy to do anywhere, even with Node.js',
		    html: data,

	  };

	const request = sgMail.send(msg);

		request
			.then((result) => {
				console.log(result.body)
				res.send("Sent!")
			})
			.catch((err) => {
				console.log(err.statusCode)
			})
	});

})


app.get('/suggestion', async function(req, res){

  //	const for = req.query.for;
 	var sug=[];
	const product = req.query.product.replace('_','+');
	let headers = {

		"Host": "www.amazon.in",
		"User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
		"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
		"Accept-Encoding": "gzip, deflate, br",
		"Connection": "keep-alive",
	}
  	
  	let site = "Amazon"
	let titles = []
	let prices = []
  	let hrefs = []
  	let links = []
  	let mrps = []
	let link0 = `https://www.amazon.in/s?k=${product}&ref=nb_sb_noss_1`
	const resp = await axios.get(link0, { headers })
		.then(response => {
			const html = response.data
			const $ = cheerio.load(html)
			$('span.a-offscreen', html).each(function () { mrps.push($(this).text().replace('₹','').replace(/\..*/,''));  })
			$('span.a-text-normal', html).each(function () { titles.push($(this).text().replace(/^(MORE\ RESULTS)/g,'').replace(/^(RESULTS)/g,''));  })
			$('span.a-price-whole', html).each(function () { prices.push($(this).text().replace('₹','').replace(/\..*/,''));  })
			$('img.s-image', html).each(function () { hrefs.push($(this).attr('src')); })
			$('a.s-no-outline', html).each(function () { links.push($(this).attr('href').replace(/^(\/)/,'https://www.amazon.in/')) })
			titles = titles.filter(function(e){return e});	
			prices.slice(5);titles.slice(5);hrefs.slice(5);links.slice(5);mrps.slice(5)
			for (var i = 0; i < 1; i++) {
				hrefs.filter(item => !"https://m.media-amazon.com/images/I/11hfR5Cq9GL._SS200_.png".includes(item))
				let title = titles[i]
				let link = links[i]
				let href = hrefs[i]
				let price = prices[i]
				let mrp = mrps[i]
				sug.push({
					site,
					price,
					title,
					mrp,
					link,
					href,

				})
			}
			return sug;//res.json(sug)
		  //console.log(sug)
		}).catch(err => console.log(err))
		
	res.json(resp);
	console.log(resp);

})


app.get('/results', async function (req, res) {

	const product = req.query.product.replace('_','+');
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
	cache = JSON.stringify(result.sort(SortByName));

	res.json(result.sort(SortByName));

	fs.writeFile('data.json', cache, function(err){
		if (err) throw err;
		console.log('saved!');
	})

	console.log(result);

})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

