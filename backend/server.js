const express = require('express');
const Web3 = require("web3").default;
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Replace with your Ganache URL and deployed contract details
const web3 = new Web3("http://127.0.0.1:8545");
const contractAddress = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; // Replace with your deployed contract address
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rating",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "review",
        "type": "string"
      }
    ],
    "name": "RatingAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "productRatings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rating",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "review",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_productId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rating",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_review",
        "type": "string"
      }
    ],
    "name": "addRating",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_productId",
        "type": "uint256"
      }
    ],
    "name": "getRatings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "productId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rating",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "review",
            "type": "string"
          }
        ],
        "internalType": "struct ProductRating.Rating[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_productId",
        "type": "uint256"
      }
    ],
    "name": "getAverageRating",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]; // Replace with your contract ABI

let contract;

// Initialize contract only if Web3 is connected
web3.eth.net.isListening()
  .then(() => {
    console.log("✅ Connected to Ganache");
    contract = new web3.eth.Contract(contractABI, contractAddress);
  })
  .catch((err) => {
    console.error("🚫 Web3 failed to connect to Ganache:", err);
  });

// Test route
app.get('/', (req, res) => {
  res.send('Blockchain Product Rating System Backend');
});

// Add Rating Endpoint
app.post('/ratings', async (req, res) => {
  const { productId, userId, rating, review, userAddress } = req.body;

  // Validate input data
  if (!productId || !userId || !rating || !review || !userAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Ensure rating is between 1 and 5
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // Add rating to the smart contract
    await contract.methods.addRating(productId, userId, rating, review).send({ from: userAddress });

    // Respond with success
    return res.status(200).json({ message: 'Rating added successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Get Ratings Endpoint
// Modify the ratings and average rating serialization to handle BigInt

app.get('/ratings/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    console.log(`➡️ Fetching ratings for productId: ${productId}`);
    
    // Fetch ratings and average rating from smart contract
    const ratings = await contract.methods.getRatings(productId).call();
    const averageRating = await contract.methods.getAverageRating(productId).call();

    // Convert BigInt values to strings before sending in response
    const serializedRatings = ratings.map(rating => ({
      userId: rating.userId,
      rating: rating.rating.toString(),  // Convert BigInt to string
      review: rating.review,
    }));
    const serializedAverageRating = averageRating.toString();  // Convert BigInt to string

    // Send the response as JSON
    return res.json({
      ratings: serializedRatings,
      averageRating: serializedAverageRating,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error fetching ratings' });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});