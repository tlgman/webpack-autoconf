/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const path = require(`path`)
const https = require(`https`);
const _ = require(`lodash`);
// const dns = require(`dns`);


function getTranspilersFromParams(params) {
  const transpilerParams = params.transpiler ? params.transpiler.split(',') : [];
  const transpilers = [];
  if(transpilerParams.includes('babel')) {
    transpilers.push('babel');
  }
  if(transpilerParams.includes('typescript')) {
    transpilers.push('typescript');
  }
  if(!transpilers.length && params.mainLibrary === 'react') {
    transpilers.push('babel');
  }
  return transpilers;
}

function getOptimizationFromParams(params, transpilers) {
  const optiParams = params.optimization ? params.optimization.split(',') : [];
  const optis = [];
  if(optiParams.includes('code-split-vendors')) {
    optis.push('code-split-vendors');
  }
  if(optiParams.includes('react-hot-loader') && params.mainLibrary === 'react' && !transpilers.includes('typescript')) {
    optis.push('react-hot-loader');
  }
  return optis;
}

function getValuesFromParamsAvailables(param, availableParams) {
  const valuesParam = param ? param.split(',') : null;
  if(!valuesParam) {
    return [];
  }
  return availableParams.filter((availableParam) => valuesParam.includes(availableParam));
}

exports.onCreateDevServer = ({ app }) => {

  // let opt = {host: 'https://s3-qsfdsqfsqfdseu-west-1.amazonaws.com/jakoblind/zips-webpack/'};
  // dns.lookup(opt.host, function (err, addr) {
  //   if (err) {
  //     // err code
  //   } else {
  //     // patches in the host header in order to please the HTTP/1.1 servers aka most of them
  //     opt.headers.host = opt.host;
  //     // makes the connection to the resolved address itself
  //     opt.host = addr;
  //     var req = https.request(opt);
  //     // [...]
  //   }
  // });

  app.get('/api/webpack/', function (req, res) {
    const baseUrl = 'https://s3-eu-west-1.amazonaws.com/jakoblind/zips-webpack/';
    // TODO rajouter _.default ==> if transpilers is undefined => error
    const params = _.mapValues(req.query, (value) => typeof value === 'string' ? value.toLowerCase() : '');

    let baseProjectLib = (params.mainLibrary === 'react' || params.mainLibrary === 'vue') ? params.mainLibrary : '';

    const transpilers = getTranspilersFromParams(params);
    const styling = getValuesFromParamsAvailables(params.styling, ['css', 'css-modules', 'sass', 'less']);
    const images = getValuesFromParamsAvailables(params.image, ['svg', 'png']);
    const utilities = getValuesFromParamsAvailables(params.utilities, ['lodash', 'moment']);
    const optimizations = getOptimizationFromParams(params, transpilers);

    const features = _.concat(_.sortBy(_.concat(transpilers, styling, images, optimizations, baseProjectLib)), utilities);
    const filename = `empty-project-${ _.kebabCase(features)}.zip`;

    let url = `${baseUrl}${filename}`;
    console.log('URL: ', url);
    res.send(url);
    https.get(url, function(resultFile) {
      if(resultFile.statusCode !== 200) {
        res.status(404);
        return;
      }
      res.setHeader('Content-Type','application/zip');
      res.setHeader('Content-Disposition',`attachment; filename=${filename}`);
      resultFile.pipe(res);
    });
  })
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const page = path.resolve(`src/pages/index.js`)
  createPage({
    path: `/webpack`,
    component: page,
    context: {
      selectedTab: 'webpack',
    },
  })

  createPage({
    path: `/parcel`,
    component: page,
    context: {
      selectedTab: 'parcel',
    },
  })
}
