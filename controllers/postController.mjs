import BlogPost from "../models/blogspot.mjs";

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find();

    // Demonstrate virtuals and methods
    const postsWithExtras = posts.map((post) => ({
      id: post._id,
      title: post.title,
      body: post.body,
      url: post.url, // Virtual property
      summary: post.getSummary(50), // Instance method
    }));

    res.render("index", { posts: postsWithExtras, basePath: req.baseUrl });
  } catch (error) {
    res.status(500).send("Error fetching posts: " + error.message);
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("detail", {
      post: {
        id: post._id,
        title: post.title,
        body: post.body,
        url: post.url, // Virtual (now points under /posts)
      },
      basePath: req.baseUrl,
    });
  } catch (error) {
    res.status(500).send("Error fetching post: " + error.message);
  }
};

// Show form to create a new post
export const showNewPostForm = (req, res) => {
  return res.render("new", {
    // form posts to POST / (mounted path), which is handled by router.route('/').post(createPost)
    formAction: `${req.baseUrl}/`,
    submitLabel: "Add New Post",
    cancelHref: `${req.baseUrl}/`,
    pageTitle: "Add New Post",
    basePath: req.baseUrl,
  });
};

// Handle creation of a new post
export const createPost = async (req, res) => {
  try {
    // Pull and sanitize inputs
    const rawTitle =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const rawBody =
      typeof req.body.body === "string" ? req.body.body.trim() : "";

    const errors = [];

    // Validation rules
    if (!rawTitle) errors.push("Title is required.");
    if (!rawBody) errors.push("Body is required.");
    if (rawTitle && rawTitle.length > 200)
      errors.push("Title must be 200 characters or fewer.");
    if (rawBody && rawBody.length > 10000) errors.push("Body is too long.");

    if (errors.length > 0) {
      // Render the form again with error messages and previously entered values
      return res.status(400).render("new", {
        errors,
        title: rawTitle,
        body: rawBody,
        // keep formAction pointing to the collection POST endpoint
        formAction: `${req.baseUrl}/`,
        submitLabel: "Add New Post",
        cancelHref: `${req.baseUrl}/`,
        pageTitle: "Add New Post",
        basePath: req.baseUrl,
      });
    }

    const newPost = new BlogPost({ title: rawTitle, body: rawBody });
    const saved = await newPost.save();

    // Redirect to the newly created post detail
    return res.redirect(`${req.baseUrl}/${saved._id}`);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).send("Error creating post: " + error.message);
  }
};

// Delete a post by ID
export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("Post not found");
    }
    // Redirect to list after deletion
    return res.redirect(`${req.baseUrl}/`);
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).send("Error deleting post: " + error.message);
  }
};

// Show edit form (reuses new.ejs)
export const showEditForm = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    return res.render("new", {
      post: { id: post._id, title: post.title, body: post.body },
      formAction: `${req.baseUrl}/${post._id}/edit`,
      submitLabel: "Save Changes",
      cancelHref: `${req.baseUrl}/${post._id}`,
      pageTitle: `Edit: ${post.title}`,
      basePath: req.baseUrl,
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    return res.status(500).send("Error: " + error.message);
  }
};

// Handle edit submission (POST)
export const updatePost = async (req, res) => {
  try {
    const rawTitle =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const rawBody =
      typeof req.body.body === "string" ? req.body.body.trim() : "";

    const errors = [];
    if (!rawTitle) errors.push("Title is required.");
    if (!rawBody) errors.push("Body is required.");
    if (rawTitle && rawTitle.length > 200)
      errors.push("Title must be 200 characters or fewer.");

    if (errors.length > 0) {
      return res.status(400).render("new", {
        errors,
        title: rawTitle,
        body: rawBody,
        formAction: `${req.baseUrl}/${req.params.id}/edit`,
        submitLabel: "Save Changes",
        cancelHref: `${req.baseUrl}/${req.params.id}`,
        pageTitle: "Edit Post",
        basePath: req.baseUrl,
      });
    }

    const updated = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { title: rawTitle, body: rawBody },
      { new: true }
    );
    if (!updated) return res.status(404).send("Post not found");
    return res.redirect(`${req.baseUrl}/${updated._id}`);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).send("Error updating post: " + error.message);
  }
};
