import express from "express";
import * as postController from "../controllers/postController.mjs";

const router = express.Router();

// Routes
router.get("/", postController.getAllPosts);
router.get("/post/:id", postController.getPostById);

// Handle deletion of a post
router.post("/post/:id/delete", postController.deletePost);

// Edit routes: show edit form (GET) and handle edit submission (POST)
router
  .route("/post/:id/edit")
  .get(postController.showEditForm)
  .post(postController.updatePost);

// Route to show form for creating a new post
// Route to show form for creating a new post and to handle form submission
router
  .route("/posts/new")
  .get(postController.showNewPostForm)
  .post(postController.createPost);

export default router;
