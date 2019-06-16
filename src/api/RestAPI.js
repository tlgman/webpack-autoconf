const https = require('https');
const dns = require( 'dns');
const _ = require('lodash');
const RestAPIUtils = require('../utils/RestAPIUtils');

const DOWNLOAD_PROEJECT_DOMAIN = 's3-eu-west-1.amazonaws.com';
const BASE_DOWNLOAD_PROJECT_WEBPACK_URL = `https://${DOWNLOAD_PROEJECT_DOMAIN}/jakoblind/zips-webpack/`;

class RestAPI {
  init(app) {
    this.checkDnsAccessibility();
    app.get('/api/webpack/', this.getProject.bind(this));
  }

  getProject(req, res) {
    if(!this.isAccessibleDomain) {
      res.status(503).send('Resource unreachable');
      return;
    }

    const params = _.mapValues(req.query, (value) => typeof value === 'string' ? value.toLowerCase() : '');
    const baseProjectLib = (params['main-library'] === 'react' || params['main-library'] === 'vue') ? params['main-library'] : '';
    const transpilers = RestAPIUtils.getTranspilersFromParams(params);
    const styling = RestAPIUtils.getAvailablesValuesFromParams(params.styling, ['css', 'css-modules', 'sass', 'less']);
    const images = RestAPIUtils.getAvailablesValuesFromParams(params.image, ['svg', 'png']);
    const utilities = RestAPIUtils.getAvailablesValuesFromParams(params.utilities, ['lodash', 'moment']);
    const optimizations = RestAPIUtils.getOptimizationFromParams(params, transpilers);

    const features = _.concat(_.sortBy(_.concat(transpilers, styling, images, optimizations, baseProjectLib)), utilities);
    const filename = `empty-project-${ _.kebabCase(features)}.zip`;

    const url = `${BASE_DOWNLOAD_PROJECT_WEBPACK_URL}${filename}`;
    https.get(url, function(resultFile) {
      if(resultFile.statusCode !== 200) {
        res.status(404).send('File not found');
        return;
      }
      res.setHeader('Content-Type','application/zip');
      res.setHeader('Content-Disposition',`attachment; filename=${filename}`);
      resultFile.pipe(res);
    });
  }

  checkDnsAccessibility() {
    dns.lookup(DOWNLOAD_PROEJECT_DOMAIN, (err) => {
      if (err) {
        this.isAccessibleDomain = false;
        console.error(`Domain ${DOWNLOAD_PROEJECT_DOMAIN} is unreachable`);
        return;
      }
      this.isAccessibleDomain = true;
    })
  }
}

module.exports = RestAPI;
