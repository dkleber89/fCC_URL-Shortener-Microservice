// server.js
// where your node app starts

// init project
import express from 'express';
import cors from 'cors';
import { gDirname } from './utils/utilityFunctions.mjs';

const app = express();

/** this project needs a db !! * */
// mongoose.connect(process.env.MONGOLAB_URI);

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
app.use(cors({ optionSuccessStatus: 200 })); // some legacy browsers choke on 204

/** this project needs to parse POST bodies * */
// you should mount the body-parser here

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

// listen for requests :)
const port = process.env.PORT || 3000;

const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
