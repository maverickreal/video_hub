const express  = require('express'),
    helmet     = require('helmet'),
    cors       = require('cors'),
    morgan     = require('morgan'),
    controller = require('./api/controllers/'),
    dotenv     = require('dotenv');

const app = express();
app.use(controller);
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
dotenv.config();

app.listen(process.env.PORT,
    () => console.log(
        `Started web server @ ${process.env.PORT}.`
    ));