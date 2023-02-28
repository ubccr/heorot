const crypto = require("crypto")
const config = require("../config")
const Settings = require("../models/Settings")

const algorithm = "aes-256-cbc"
const key = Buffer.from(config.key, "hex")

async function encrypt(text) {
  let db_res = await Settings.findOne({}, { jwt_secret: 1, _id: 0 })
  const iv = Buffer.from(db_res.jwt_secret, "hex")

  let cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString("hex")
}

async function decrypt(text) {
  if (text === "") return text
  let db_res = await Settings.findOne({}, { jwt_secret: 1, _id: 0 })
  const iv = Buffer.from(db_res.jwt_secret, "hex")

  let encryptedText = Buffer.from(text, "hex")

  let decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

module.exports = { encrypt, decrypt }
