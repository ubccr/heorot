const setCache = async (model, data) => {
  let newData = new model({ ...data })
  newData.save((err, data) => {
    if (err) return { status: "error", message: "An error occured while saving to the DB" }
    else return { status: "success", message: "Data successfully cached" }
  })
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
