const fs = require('fs')
const https = require('https');
// https://attacomsian.com/blog/nodejs-download-file
// https://4.files.edl.io/d6b4/09/01/22/120629-3c5e2a61-7974-401b-9234-6d70871796d3.pdf
const url = "https://4.files.edl.io/b536/11/28/22/193324-542f306b-9788-44e8-8e1f-8b4c46a31876.pdf";
https.get(url, (res) => {
  // Open file in local filesystem
  const file = fs.createWriteStream(`lunch.pdf`);
  // Write data into local file
  res.pipe(file);
  // Close the file
  file.on('finish', () => {
    console.log("Downloaded lunch menu")
    file.close();
    read()
  });
})
// https://github.com/modesty/pdf2json/issues/76#issuecomment-236569918
// next 14 lines credit: xdvarpunen
async function read() {
  const fs = require('fs'),
    PDFParser = require("pdf2json");
  const pdfParser = new PDFParser(this, 1);
  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
  pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFile("./content.txt", pdfParser.getRawTextContent(), () => {
      parse();
    });
  });
  console.log("Reading lunch menu");
  pdfParser.loadPDF("./lunch.pdf")
  // parse content.txt file
  async function parse() {
    var data = await fs.readFileSync("content.txt", "utf-8");
    // making up for spelling errors
    data = data.replaceAll("fruit&", "fruit &");
    // end
    var parsed = data.split(/[ ]+/);
    var valid = [];
    console.log("Converting text to array")
    for (let i = 0; i < parsed.length; i++) {
      if (isNaN(parsed[i])) {
        if (parsed[i].includes('MONDAY') == false && parsed[i].includes('TUESDAY') == false && parsed[i].includes('WEDNESDAY') == false && parsed[i].includes('THURSDAY') == false && parsed[i].includes('FRIDAY') == false) {
          valid.push(parsed[i].replace("\r\n", ""));
        }
      }
    }
    //console.log(valid)
    function date(day) {
      var today = new Date();
      return (today.getMonth() + 1) + "/" + day + "/" + today.getFullYear();
    }

    function isHoliday(day) {
      var today = new Date();
      var date = new Date(today.getFullYear(), today.getMonth(), day) // New Year's Day 2016
      return holidays.isHoliday(date, {
        bank: true
      })
    }
    var holidays = require('@date/holidays-us')
    var count = 1; // temp change to 6
    var final = {}
    // modified version of https://stackoverflow.com/a/1181236
    function isWeekend(month, day, year) {
      var myDate = new Date();
      myDate.setFullYear(year);
      myDate.setMonth(month);
      myDate.setDate(day);
      //console.log(myDate.getDay())
      if (myDate.getDay() == 6 || myDate.getDay() == 0) {
        return true;
      } else {
        return false;
      }
    }// end code

    function isCapital(word) {
      return word.charAt(0) === word.charAt(0).toUpperCase()
    }

    //console.log(JSON.stringify(valid, null, 4)); i forget why this is here
    // This is the main function I wrote where parsing stuff takes place, everyhting above this is basically a library and filesystem stuff
    console.log("Writing JSON")
    //console.log(valid)
    for (let i = 0; i < valid.length; i++) {
      var today = new Date();
      var b = 0;
      // skip weekends
      if (isWeekend(today.getMonth(), count, today.getFullYear()) == true) {
        final[date(count)] = "Weekend"
        count++;
        b = 1;
      }
      // don't add misc info
      if (valid[i].toLowerCase() == "“this") {
        break
      }
      // skip bank holidays
      /*if (isHoliday(count)) {
          final[date(count)] = "Holiday"
          count++;
          b = 1;
      }*/
      // main parse function
      // start fancy formatting
      var ending = " "
      // manual no school
      //if(valid[i] == "NO" && valid[i + 1] == "SCHOOL"){
      if ([].includes(count)) {
        final[date(count)] = "No School"
        count++;
        b = 1;
        i += 2;
      }
      // end no school
      if (valid[i - 1] == "veggies" && valid[i - 2] == "&") {
        count++
      }
      // remove space after "fruit & veggies"
      if (valid[i] == "veggies" && valid[i - 1] == "&") {
        ending = "";
      }
      if (valid[i] == "Assorted" && valid[i + 1] == "fruit") {
        valid[i] = "assorted"
      }
      if (valid[i + 1] != undefined) {
        if (isCapital(valid[i + 1]) && valid[i + 1].endsWith(",") == false && valid[i + 1] != "&" && valid[i] != "veggies" && valid[i] != "&") {
          if (valid[i].endsWith(",") == false) {
            ending = ", "
            valid[i + 1] = valid[i + 1].toLowerCase()
          } else {
            valid[i + 1] = valid[i + 1].toLowerCase()
          }
        }
      }
      if (valid[i + 1] == "Assorted" && valid[i + 2] == "fruit") {
        ending = ", "
      }
      // end fancy formatting (ff)
      i = i - b
      if (valid[i] != undefined) {
        if (final[date(count)] == undefined) {
          final[date(count)] = valid[i] + ending // + " " without ff
        } else {
          final[date(count)] = final[date(count)] + valid[i] + ending // + " " without ff
        }
      }
    }
    // write to file
    fs.writeFile("./lunch.json", JSON.stringify(final, "", 4), () => { });
    // server
    var express = require("express");
    var app = express();
    var cors = require('cors')
    app.use(cors())
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT || 3000);
    });
    app.get("/", (req, res, next) => {
      res.json(final);
    });
  }
}
// git push heroku master
