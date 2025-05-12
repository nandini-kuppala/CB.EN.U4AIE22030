require('dotenv').config();

module.exports = {
    TEST_SERVER_BASE_URL: process.env.TEST_SERVER_BASE_URL,
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
};