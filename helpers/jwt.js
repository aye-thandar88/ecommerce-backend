var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.TOKEN_SECRET;
  const api = process.env.API_URL;

  return jwt({
    secret: secret,
    algorithms: ["HS256"],
    // isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/assets(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /^\/api-docs/ },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  const payloadData = { ...payload };

  const currentTimestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  const expirationTimestamp = payloadData.payload.exp; // Expiration timestamp from the JWT payload

  // Calculate the difference between the current time and the expiration time
  const timeDifference = expirationTimestamp - currentTimestamp;

  if (payload && payloadData.payload.isAdmin === false) {
  if (timeDifference <= 1800) {
    // return done(null, true);
    return true;
  }
  }
  // return done();
  return false;
}

module.exports = authJwt;
