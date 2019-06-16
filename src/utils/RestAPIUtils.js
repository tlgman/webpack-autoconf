
class RestAPIUtils {
  static getTranspilersFromParams(params) {
    const transpilerParams = params.transpiler ? params.transpiler.split(',') : [];
    const transpilers = [];
    if(transpilerParams.includes('babel')) {
      transpilers.push('babel');
    }
    if(transpilerParams.includes('typescript')) {
      transpilers.push('typescript');
    }
    if(!transpilers.length && params['main-library'] === 'react') {
      transpilers.push('babel');
    }
    return transpilers;
  }

  static getOptimizationFromParams(params, transpilers) {
    const optiParams = params.optimization ? params.optimization.split(',') : [];
    const optis = [];
    if(optiParams.includes('code-split-vendors')) {
      optis.push('code-split-vendors');
    }
    if(optiParams.includes('react-hot-loader') && params['main-library'] === 'react' && !transpilers.includes('typescript')) {
      optis.push('react-hot-loader');
    }
    return optis;
  }

  static getAvailablesValuesFromParams(param, availableValues) {
    const valuesParam = param ? param.split(',') : null;
    if(!valuesParam) {
      return [];
    }
    return availableValues.filter((availableParam) => valuesParam.includes(availableParam));
  }
}

module.exports = RestAPIUtils;
