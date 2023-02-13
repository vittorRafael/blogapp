if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI: "mongodb+srv://vittorRafael:rafas4650@blogapp.bobiuww.mongodb.net/?retryWrites=true&w=majority"
  }
} else {
  module.exports = {
    mongoURI: "mongodb://127.0.0.1/blogapp"
  }
}