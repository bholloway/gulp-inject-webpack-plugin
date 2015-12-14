var path = require('path'),
    fs   = require('fs');

/**
 * Determine the files in the compilation that match the given criteria.
 * @param {string|RegExp|Array.<string|RegExp>} criteria Files or packages to match
 * @param {object} stats The Webpack stats object
 * @param {string} [basePath] Optional path to search for assets
 * @returns {Array.<string>} A list of files that match the criteria
 */
function matchAssets(criteria, stats, basePath) {
  var candidate = stats.chunks
    .reduce(reduceAssetsToCandidateLists, {
      files : [],
      chunks: []
    });
  return [].concat(criteria)
    .reduce(reduceCriteriaToInjections, [])
    .filter(firstOccurrence);

  function reduceCriteriaToInjections(injections, criteria) {
    return injections
      .concat(matchInPath())
      .concat(matchInList(candidate.files))
      .concat(matchInList(candidate.chunks).reduce(chunkToFiles, []));

    function matchInPath() {
      return basePath && (typeof criteria === 'string') && fs.existsSync(path.resolve(basePath, criteria)) &&
        [criteria] || [];
    }

    function matchInList(list) {

      // string
      if ((typeof criteria === 'string') && (list.indexOf(criteria) >= 0)) {
        return [criteria];
      }
      // regular expression
      else if ((typeof criteria === 'object') && (typeof criteria.test === 'function')) {
        return list.reduce(reduceElementToMatches, []);
      }
      // unmatched
      else {
        return [];
      }

      function reduceElementToMatches(reduced, element) {
        return criteria.test(element) ? reduced.concat(element) : reduced;
      }
    }
  }

  function chunkToFiles(reduced, chunkName) {
    return reduced.concat(stats.assetsByChunkName[chunkName] || []);
  }
}

module.exports = matchAssets;

function reduceAssetsToCandidateLists(reduced, chunk) {
  chunk.names.reduce(unique, reduced.chunks);
  chunk.files.reduce(unique, reduced.files);
  return reduced;
}

function unique(reduced, value) {
  if (reduced.indexOf(value) < 0) {
    reduced.push(value);
  }
  return reduced;
}

function firstOccurrence(value, i, array) {
  return (array.indexOf(value) === i);
}