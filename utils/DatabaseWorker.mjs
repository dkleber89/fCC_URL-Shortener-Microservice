

export default class DatabaseWorker {
  constructor(mongoose) {
    this.urlShema = new mongoose.Schema({
      url: { type: String, required: true },
      shortUrl: { type: Number, required: true, unique: true },
    });

    this.UrlModel = mongoose.model('Url', this.urlShema);
  }

  findUrl = (shortUrl, cb) => {
    this.UrlModel.find({ shortUrl }, (err, data) => {
      if (err) {
        cb();
      } else {
        cb(data);
      }
    });
  };

  cuDatabase = (url, cb) => {
    this.UrlModel.find({ url }, (err, data) => {
      if (err || data.length === 0) {
        const newUrl = new this.UrlModel({ url, shortUrl: 1 });

        newUrl.save((error, dataSaved) => {
          if (error) {
            cb();
          } else {
            cb(dataSaved);
          }
        });
      } else {
        cb(data);
      }
    });
  };
}
