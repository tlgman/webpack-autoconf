/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const path = require(`path`)
const RestAPI = require(`./src/api/RestAPI`);

exports.onCreateDevServer = ({ app }) => {
  const restAPI = new RestAPI();
  restAPI.init(app);
};

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
