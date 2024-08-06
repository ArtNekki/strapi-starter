const crypto = require("crypto");

function generateKey(length = 32) {
  return crypto.randomBytes(length).toString("base64");
}

console.log(
  "APP_KEYS=" + generateKey() + "," + generateKey() + "," + generateKey() + "," + generateKey()
);
console.log("API_TOKEN_SALT=" + generateKey());
console.log("ADMIN_JWT_SECRET=" + generateKey());
console.log("TRANSFER_TOKEN_SALT=" + generateKey());
console.log("JWT_SECRET=" + generateKey());
