require('dotenv').config()


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


axios.interceptors.request.use(x => {
    // console.log(x);
    return (x);
})

axios.interceptors.response.use(x => {
    //  console.log(x);
    return (x);
})

async function getProducts(req) {
    try {
        let id = '';
        let desc = '';
        let data = null;

        const auth = await getClientCredentials();
        const Authorization = auth.token_type + auth.access_token;

        if (req.headers.product_id)
            id = req.headers.product_id.toUpperCase();

        if (req.headers.product_desc)
            desc = req.headers.product_desc;

        if (req.body.Image) {
            data = {};
          //  console.log(data);
            data.Image = req.body.Image;
            data.MaxLabels = parseInt(process.env.MAX_LABELS, 10);
            data.MinConfidence = parseInt(process.env.MIN_CONFIDENCE, 10);
          //  console.log(data);
        }

        let response = await axios({
            method: 'post',
            url: process.env.PRODUCTS_URL,
            headers: {
                Authorization: Authorization,
                product_id: id,
                product_desc: desc
            },
            data: data
        });

        console.log("id = " + id);
        console.log("desc = " + desc);
        console.log("labels = " + response.headers.rek_labels);

        res = {};
        res.products = response.data.d.results;
        console.log(response.headers.rek_labels)
        const labelsObject = JSON.parse(response.headers.rek_labels);
        if (response.headers.rek_labels) {
            let labels = [];
            labels.push(['Label', 'Confidence']);

            for (const [key, value] of Object.entries(labelsObject)) {
                labels.push([ key, value ]);
            }
            res.labels = labels;
            console.log(res.labels);
        }

        return res;
    } catch (error) {
        console.error(error)
    }
};

router.get('/', async function (req, res, next) {
    const resp = await getProducts(req);
    res.send(resp);
});

router.post('/', async function (req, res, next) {
    process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
    console.clear();
    //console.log(process.env.TOKEN_URL);
    const resp = await getProducts(req);
    res.send(resp);
});

module.exports = router;