import { Settings } from "../models/Settings.js"
import config from "../../config/config.js"
import crypto from "crypto"

const algorithm = "aes-256-cbc"
const key = Buffer.from(config.key, "hex")

export async function encrypt(text: string) {
  let db_res = await Settings.findOne({}, { jwt_secret: 1, _id: 0 })
  if (!db_res) return
  const iv = Buffer.from(db_res.jwt_secret, "hex")

  let cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString("hex")
}

export async function decrypt(text: string | undefined) {
  if (text === "" || !text) return text
  let db_res = await Settings.findOne({}, { jwt_secret: 1, _id: 0 })
  if (!db_res) return
  const iv = Buffer.from(db_res.jwt_secret, "hex")

  let encryptedText = Buffer.from(text, "hex")

  let decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}
