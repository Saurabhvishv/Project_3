const validUrl = require('valid-url')
const urlModel = require("../model/urlModel")
const redis = require("redis");
const shortid = require('shortid')
const baseUrl = 'http://localhost:3000'
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  19581,
  "redis-19581.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("94bdATdMIJHhc0h6TW6Lr6YJ70TVWP0n", function (err) {
  if (err) throw err;
});
redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number') return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}



const genrateShortUrl = async function (req, res) {
    let longUrl = req.body.longUrl
    const shortCode = shortid.generate()
    let checkUrl = await urlModel.findOne({ longUrl: req.body.longUrl })
    if (!checkUrl) {
        try {
            let requestBody = req.body
            if (!isValidRequestBody(requestBody)) {
                return res.status(400).send({ status: false, msg: "body cant be empty please provide details" })
            }
            longUrl = longUrl.trim()

            if (!(longUrl.includes('//'))) {
                return res.status(400).send({ status: false, msg: 'Invalid longUrl' })
            }
            const urlParts = longUrl.split('//')
            const scheme = urlParts[0]
            const uri = urlParts[1]
            let shortenedUrlDetails
            if (!(uri.includes('.'))) {
                return res.status(400).send({ status: false, msg: 'Invalid longUrl' })
            }
            const uriParts = uri.split('.')
            if (!(((scheme == "http:") || (scheme == "https:")) && (scheme.trim().length) && (uri.trim().length))) {
                return res.status(400).send({ status: false, msg: 'Invalid longUrl please provide valid url' })
            }
            shortenedUrlDetails = await urlModel.findOne({
                longUrl: longUrl
            })
            if (shortenedUrlDetails) {
                res.status(201).send({ status: true, data: shortenedUrlDetails })
            } else {
                const shortUrl = baseUrl + '/' + shortCode.toLowerCase()
                shortenedUrlDetails = await urlModel.create({ longUrl: longUrl, shortUrl: shortUrl, urlCode: shortCode })

                await SET_ASYNC(shortCode.toLowerCase(), longUrl);
                res.status(201).send({ status: true, data: shortenedUrlDetails })
            }
        }
        catch (error) {
            res.status(500).send({ status: false, msg: error.message })
        }
    } else {
        res.status(401).send({ status: false, msg: 'longUrl must be present in the body' })
    }
}



const getUrl = async function (req, res) {
    try {
        let urlCode = await GET_ASYNC (req.params.urlCode);
        let urlData = await urlModel.findOne({urlCode: req.params.urlCode})
        if (!urlData) {
            return res.status(400).send({ status: false, msg: "this short url does not exist please provide valid url code " })
        }
        res.redirect(301, `${urlData.longUrl}`);
       
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports.genrateShortUrl = genrateShortUrl;
module.exports.getUrl = getUrl;