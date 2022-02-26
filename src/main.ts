// seems wierd, but this seems to be the way to typescript+node for these things.
import {Express} from 'express';
const express = require('express');
import {CorsOptions} from 'cors';
const cors = require('cors')

// XXX probably don't need const fetch = require('node-fetch');
const util = require('util');
// XXX const url = util.format(SEARCH_URL, symbol); ... ig thats string formatting???

const app: Express = express();
const port = 8000;


/* holdover from another project, makes it easy to do this in frontend stuff */
const copts: CorsOptions = {
    origin: (origin, callback) => { // allow all
        callback(null, true);
    }
}


app.get('/test', cors(copts), (req, res) => {
    res.send(JSON.stringify({message: 'your a foo'}));
    // XXX const prom = fetch(url).then(response => response.json());
    // use async/await instead!
});


app.listen(port, () => console.log(`Server started on ${port}!`));
