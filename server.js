const express = require('express');
const allRoutes = require('./routes');
const sequelize = require('./config/connection');
const cors = require("cors")

const app = express();

var corsOptions = {
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'] };

    app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', allRoutes);

sequelize.sync({ force: false }).then(function() {
    app.listen(PORT, function() {
    console.log('App listening on PORT ' + PORT);
    });
});