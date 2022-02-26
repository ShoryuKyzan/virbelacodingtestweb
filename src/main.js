const express = require('express');
// XXX probably don't need const fetch = require('node-fetch');
const util = require('util');
// XXX const url = util.format(SEARCH_URL, symbol); ... ig thats string formatting???
const app = express();
const port = 8000;

var cors = require('cors')

/* holdover from another project, makes it easy to do this in frontend stuff */
var copts = {
  origin: function (origin, callback) {
    // allow all
    callback(null, true);
  }
}


app.get('/test', cors(copts), (req, res) => {
    res.send(JSON.stringify({message: 'your a foo'}));
    // XXX const prom = fetch(url).then(response => response.json());
    // use async/await instead!
});


app.listen(port, () => console.log(`Server started on ${port}!`));
