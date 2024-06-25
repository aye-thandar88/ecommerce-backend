var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.TOKEN_SECRET;
  const api = process.env.API_URL;

  return jwt({
    secret: secret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      { url: /\/public\/assets(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /^\/api-docs/ },
      `${api}/users/login`,
      `${api}/users/register`,
      `${api}/users/refresh-token`,
    ],
  });
}

module.exports = authJwt;
