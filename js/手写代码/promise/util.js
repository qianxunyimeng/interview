function isPromiseLike (fn) {
  if (fn != null && (typeof fn === "function" || typeof fn === "object") && typeof fn.then === "function") {
    return true
  }
  return false
}

module.exports = { isPromiseLike }