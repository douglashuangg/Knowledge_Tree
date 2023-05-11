const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

// seret hash for encryption
const key = crypto
  .createHash("sha512")
  .update(process.env.SECRET_KEY)
  .digest("hex")
  .substring(0, 32);

const encryptionIV = crypto
  .createHash("sha256")
  .update(process.env.SECRET_IV)
  .digest("hex")
  .substring(0, 16);

function encryptData(data) {
  const cipher = crypto.createCipheriv(
    process.env.ENCRYPTION_METHOD,
    key,
    encryptionIV
  );
  return Buffer.from(
    cipher.update(data, "utf8", "hex") + cipher.final("hex")
  ).toString("base64");
}

function decryptData(encryptedData) {
  try {
    const buff = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_METHOD,
      key,
      encryptionIV
    );
    return (
      decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8")
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  encryptData,
  decryptData,
};
