var Promise = require('bluebird')
var redis = require("redis")
var redisClient = redis.createClient(require('../config/redis'))
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

module.exports = redisClient;
