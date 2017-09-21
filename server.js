// Node packages
const express = require('express');
const mongojs = require('mongojs');
const request = require('request');
const cheerio = require('cheerio');

// Initialize Express
let app = express();

// Database configuration
let databaseUrl = "localhost:27017/amazon";
let collections = ["couches"];

// Hook mongojs configuration to the db variable
let db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

app.get("/couches", function(req, res) {

  request("https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=couch", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    let $ = cheerio.load(html);

    // Emoty arrays to save the data that we'll scrape
    let results = [];
    let prices = [];
    let ratings = [];

    console.log('insanity check...');
    // Select each element in the HTML body from which you want information.
    $('#resultsCol').find('span > span').each(function(i, element) {
      //console.log(element);
      // For each head, there's an element that is being parsed thru. For each element,
      // it grabs the child of that element
      //var price = $(element).children().attr(".aria-label");
      //console.log(price);
      let textField = $(element).children().text();
      console.log(textField)
      if(textField.includes("$")) {

        let spliceLength = textField.length - 2;
        textField.substring(0, spliceLength);

        let wholeString = textField.substring(0, spliceLength);
        let decimalString = textField.substring(spliceLength - 2, spliceLength);

        let price = wholeString + "." + decimalString;
        console.log("price: " + price);
        prices.push(price);
        // Save these results in an object that we'll push into the results array we defined earlier
        // This is the array name
      }
      if(textField.includes('out of')) {
        ratings.push(textField);
      }
    });
    // Log the results once you've looped through each of the elements found with cheerio
    //console.log(results);
    //
    for (let i=0; i<ratings.length; i++) {
      results.push({
       price: prices[i],
       rating: ratings[i]
      });

      db.couches.insert({
       "price": prices[i],
       "rating": ratings[i]
      });

    }

    // db.couches.insert(results);

    res.send(results);
  });
});



/* TODO: make two more routes
 * -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
