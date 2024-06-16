const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/BookDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  return mongoose.connection.db.collection('Book').createIndex(
    { title: "text", author: "text", genre: "text" }
  );
})
.catch((err) => {
  console.error('Connection error:', err.message);
});

const db = mongoose.connection;

const bookSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: String,
  genre: String,
  price :Number
});

const Book = mongoose.model("Book", bookSchema);

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    if (books.length > 0) {
      res.status(200).json(books);
    } else {
      res.status(404).json({ error: 'No books found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/books/:id' , async (req , res) => {
     const id = req.params.id
     try {
      const books = await Book.find({_id : id})
      if(books.length > 0){
        res.status(200).json(books)
      }else{
        res.status(404).json({error : 'internal server error '})
      }
      
     } catch (error) {
      
     }
})

app.post('/books', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid book data' });
  }
});



app.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.search;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } },
        { genre: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const books = await Book.find(query);

    if (books.length > 0) {
      res.status(200).json(books);
    } else {
      res.status(404).json({ error: 'Books not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/books/purchase', async (req, res) => {
  const bookId = req.body.id;

  try {
    // Find the book by ID
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Simulate processing payment
    const paymentProcessed = await processPayment(book.price);

    if (!paymentProcessed) {
      return res.status(400).json({ error: 'Payment processing failed' });
    }

    res.status(200).json({ message: 'Purchase successful', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function processPayment(price) {
  // Simulate processing payment
  // Replace with your payment gateway integration logic
  return true;  // Return true if payment is successful
}