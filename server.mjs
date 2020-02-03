// server.js
// where your node app starts

// init project
import dns from 'dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { gDirname } from './utils/utilityFunctions.mjs';
import DatabaseWorker from './utils/DatabaseWorker.mjs';

dotenv.config();

const app = express();

/** this project needs a db !! * */
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
app.use(cors({ optionSuccessStatus: 200 })); // some legacy browsers choke on 204

/** this project needs to parse POST bodies * */
app.use(bodyParser.urlencoded({ extended: false }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (req, res) => {
  res.sendFile(`${gDirname(import.meta.url)}/views/index.html`);
});

// your first API endpoint...
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

const databaseWorker = new DatabaseWorker(mongoose);

app.post('/api/shorturl/new', (req, res) => {
  if (req.body.url.match(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)) {
    const startUrl = req.body.url.indexOf('://') + 3;
    const endUrl = req.body.url.indexOf('/', startUrl);
    const shortUrl = req.body.url.substring(startUrl, endUrl > startUrl ? endUrl : undefined);

    dns.lookup(shortUrl, err => {
      if (err) {
        res.json({ error: 'invalid URL' });
      } else {
        databaseWorker.cuDatabase(req.body.url, (data) => {
          if (data) {
            console.log(data);
            res.json(data);
          } else {
            console.log('Problem with databaseWorker');
          }
        });
      }
    });
  } else {
    res.json({ error: 'invalid URL 1' });
  }
});

// listen for requests :)
const port = process.env.PORT || 3000;

const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
