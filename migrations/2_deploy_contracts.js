const ProductRating = artifacts.require("ProductRating");

module.exports = function (deployer) {
  deployer.deploy(ProductRating);
};
