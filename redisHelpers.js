const Redis = require("redis");
const redisClient = Redis.createClient();

module.exports = async (key) => {
    // if key exit then delete it
    await redisClient.connect();
    const cachedKey = await redisClient.get(key);
    if (cachedKey) await redisClient.del(key);
    await redisClient.quit();
};
