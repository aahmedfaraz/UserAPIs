const express = require("express");

const app = express();

app.use(express.json({extended: false}));

const PORT = process.env.PORT || 5000;

app.get('/', async (req,res) => {
    try {
        await res.send(`These APIs are developed by Ahmed Faraz, Server has started on Port ${PORT}`);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

app.listen(PORT,() => {console.log(`The Server started on port ${PORT}`)});