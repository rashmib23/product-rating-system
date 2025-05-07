// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRating {
    struct Rating {
        uint productId;
        uint userId;
        uint rating;
        string review;
    }

    mapping(uint => Rating[]) public productRatings;

    event RatingAdded(uint productId, uint userId, uint rating, string review);

    function addRating(uint _productId, uint _userId, uint _rating, string memory _review) public {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");

        productRatings[_productId].push(Rating(_productId, _userId, _rating, _review));
        emit RatingAdded(_productId, _userId, _rating, _review);
    }

    function getRatings(uint _productId) public view returns (Rating[] memory) {
        return productRatings[_productId];
    }

    function getAverageRating(uint _productId) public view returns (uint) {
        Rating[] memory ratings = productRatings[_productId];
        if (ratings.length == 0) {
            return 0;
        }
        uint sum = 0;
        for (uint i = 0; i < ratings.length; i++) {
            sum += ratings[i].rating;
        }
        return sum / ratings.length;
    }
}
