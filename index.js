const axios = require("axios").default;
const cheerio = require("cheerio");
const fs = require("fs");

const options = {
  method: "GET",
  url: "http://www.bom.gov.au/products/IDQ60901/IDQ60901.94576.shtml",
  headers: {
    Host: "www.bom.gov.au",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-UK,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
  },
};

(async () => {
  const response = await axios.request(options);
  const $ = cheerio.load(response.data);

  var data = $("tbody .rowleftcolumn").first().text().replace(/  /g, "");

  data = data.split("\n");
  data.splice(0, 1);

  let info = $(".stationdetails tbody tr").text().replace(/  /g, "\n");

  info = info.split("\n");
  info.splice(0, 1);

  // replace with contents after ": "
  for (let i = 0; i < info.length; i++) {
    info[i] = info[i].split(": ")[1];
  }

  fs.writeFileSync(
    "./data.json",
    JSON.stringify({
      notice: {
        copyright:
          "Copyright Commonwealth of Australia 2024, Bureau of Meteorology. For more information see: http://www.bom.gov.au/other/copyright.shtml http://www.bom.gov.au/other/disclaimer.shtml",
        copyright_url: "http://www.bom.gov.au/other/copyright.shtml",
        disclaimer_url: "http://www.bom.gov.au/other/disclaimer.shtml",
        feedback_url: "http://www.bom.gov.au/other/feedback",
      },
      station: {
        id: info[0],
        time: data[0],
        name: info[1],
        lat: info[2],
        lon: info[3],
        height: info[4],
      },
      weather: {
        temp: data[1],
        apparentTemp: data[2],
        dewPoint: data[3],
        relHumidity: data[4],
        deltaT: data[5],
        wind: {
          dir: data[6],
          speed: data[7],
          gust: data[8],
          speedKnots: data[9],
          gustKnots: data[10],
        },
        pressure: data[11],
        rain: data[12],
      },
    })
  );
})();
