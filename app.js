const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://MathewPio:Nodedeveloper@cluster0.zvgvmzm.mongodb.net/messages?retryWrites=true&w=majority';
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth')

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(express.json());

app.use('/images', express.static('images'))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(auth);

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
        if(!err.originalError){
            return err
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occured';
        const code = err.originalError.code || 500;
        return {message: message, status: code, data: data}
    }
}))

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        app.listen(3000, () => {
            console.log('App is running on port 3000')
        });
    })
    .catch(err => (console.log(err)));

