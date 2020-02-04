// server.js
// where your node app starts

// init project
import dns from 'dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { gDirname } from './utils/utilityFunctions.mjs';

dotenv.config();

const app = express();

/** this project needs a db !! * */
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', err => {
  console.log(err);
});

const AutoIncrement = mongooseSequence(mongoose);

const urlSchema = new mongoose.Schema({
  url: { type: String, require: true },
});

urlSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Url = mongoose.model('Url', urlSchema);

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

app.get('/api/shorturl/:urlNumber', (req, res) => {
  if (Number(req.params.urlNumber)) {
    Url.findOne({ id: parseInt(req.params.urlNumber, 10) }, (err, data) => {
      if (err || !data) {
        res.json({ error: 'invalid URL' });
      } else {
        res.redirect(data.url);
      }
    });
  }
});

app.post('/api/shorturl/new', (req, res) => {
  if (req.body.url.match(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)) {
    const startUrl = req.body.url.indexOf('://') + 3;
    const endUrl = req.body.url.indexOf('/', startUrl);
    const shortUrl = req.body.url.substring(startUrl, endUrl > startUrl ? endUrl : undefined);

    dns.lookup(shortUrl, err => {
      if (err) {
        res.json({ error: 'invalid URL' });
      } else {
        Url.findOne({ url: req.body.url }, (error, data) => {
          if (!data) {
            const newUrl = new Url({ url: req.body.url });

            newUrl.save((e, d) => {
              if (e) {
                res.json({ error: e });
              } else {
                res.json({ url: d.url, shortUrl: d.id });
              }
            });
          } else {
            res.json({ url: data.url, shortUrl: data.id });
          }
        });
      }
    });
  } else {
    res.json({ error: 'invalid URL' });
  }
});

// listen for requests :)
const port = process.env.PORT || 3000;

const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
