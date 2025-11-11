import express from "express";
import * as postController from "../controllers/postController.mjs";

const router = express.Router();

// RESTful Routes (mounted at /posts in server)
// GET /posts        -> list all posts
// POST /posts       -> create a new post
router
  .route("/")
  .get(postController.getAllPosts)
  .post(postController.createPost);

// GET /posts/new    -> show new post form
router.get("/new", postController.showNewPostForm);

// GET /posts/:id    -> show single post
router.get("/:id", postController.getPostById);

// POST /posts/:id/delete -> delete (keeps POST for browser compatibility)
router.post("/:id/delete", postController.deletePost);

// GET /posts/:id/edit and POST /posts/:id/edit -> show edit form and submit updates
router
  .route("/:id/edit")
  .get(postController.showEditForm)
  .post(postController.updatePost);

export default router;
