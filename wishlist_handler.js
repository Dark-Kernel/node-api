const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

const uri = "mongodb://127.0.0.1:27017/";
const dbName = "test";

// Database connection helper
async function getDb() {
    const client = await MongoClient.connect(uri);
    return { client, db: client.db(dbName) };
}

// GET - Read wishlist items
router.get('/wishlist/:emailId', async (req, res) => {
    try {
        const { client, db } = await getDb();
        const result = await db.collection("customers")
            .find({ email: req.params.emailId })
            .toArray();
        
        await client.close();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Create new wishlist
router.post('/wishlist', async (req, res) => {
    try {
        const { emailId, link, title, price } = req.body;
        const { client, db } = await getDb();

        const existingUser = await db.collection("customers")
            .findOne({ email: emailId });

        if (existingUser) {
            await db.collection("customers").updateOne(
                { email: emailId },
                { 
                    $push: { 
                        link: link,
                        title: title,
                        price: price 
                    }
                }
            );
        } else {
            await db.collection("customers").insertOne({
                email: emailId,
                link: [link],
                title: [title],
                price: [price]
            });
        }

        await client.close();
        res.status(201).json({ message: "Wishlist item added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Remove item from wishlist
router.delete('/wishlist/:emailId', async (req, res) => {
    try {
        const { link, title, price } = req.body;
        const { client, db } = await getDb();

        await db.collection("customers").updateOne(
            { email: req.params.emailId },
            {
                $pull: {
                    link: link,
                    title: title,
                    price: price
                }
            }
        );

        await client.close();
        res.json({ message: "Item removed from wishlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = router;
