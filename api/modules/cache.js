const setCache = async (model, key, keyData, data) => {
  return await model.findOneAndUpdate({ [key]: keyData }, { cache: data }, { new: true, upsert: true })
}
const getCache = async (model, key, data) => {
  return await model.findOne({ [key]: data })
}

const timeComp = (oldTime, offset = 1 * 24 * 60 * 60 * 1000) => {
  const past = new Date(oldTime)
  const now = new Date()

  const timeDiff = now.getTime() - past.getTime()

  if (timeDiff >= offset) return true
  else return false
}

module.exports = { setCache, getCache, timeComp }
