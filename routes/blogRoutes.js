const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const cleanCache = require("../middlewares/cleanCache");

const Blog = mongoose.model("Blog");

module.exports = (app) => {
  app.get("/api/blogs/:id", requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id,
    });

    res.send(blog);
  });

  app.get("/api/blogs", requireLogin, async (req, res) => {
    // const redis = require("redis");
    // const redisUrl = "redis://127.0.0.1:6379";
    // const client = redis.createClient(redisUrl);
    // const util = require("util");
    // // promisify is served by utill which returns promise for any function
    // client.get = util.promisify(client.get);
    // // do we have any cached data in dedis related to this query
    // // if yes then respond to the request right away and return
    // const cachedBlog = await client.get(req.user.id);
    // if (cachedBlog) {
    //   console.log("Serving from cache");
    //   return res.send(JSON.parse(cachedBlog));
    // }
    // //if no we to respond to request and update out cache to store the data

    // const blogs = await Blog.find({ _user: req.user.id });
    // console.log("serving from Mong0db");
    // res.send(blogs);
    // // update our cache
    // client.set(req.user.id, JSON.stringify(blogs));
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id,
    });
    res.send(blogs);
  });

  app.post("/api/blogs", requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({ 
      title,
      content,
      _user: req.user.id,
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
