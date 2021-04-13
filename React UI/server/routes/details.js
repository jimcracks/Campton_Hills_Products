require('dotenv').config();

var express = require('express');
var router = express.Router();
const axios = require('axios');
const oauth = require('axios-oauth-client');

let access_token = "";


const getClientCredentials = oauth.client(axios.create(), {
    url: process.env.TOKEN_URL,
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
});


async function getDetails(req) {
    try {

        const auth = await getClientCredentials();
        const Authorization = auth.token_type + auth.access_token;

        let response = await axios({
            method: 'get',
            url: process.env.DETAILS_URL,
            headers: {
                Authorization: Authorization,
                productID: req.headers.product_id
            }
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error)
    }
};

router.get('/', async function (req, res, next) {
    process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
    console.clear();
    const resp = await getDetails(req);
    res.send(resp);
});

module.exports = router;