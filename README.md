The UI is intentionally tiny:

# 🚀 Quick Start

```bash
# Install dependencies
npm install

# (Optional) ensure MongoDB is running locally on default port
# Seed two educational posts
npm run populate

# Start the server
npm run start
```

Open: `http://localhost:3000/`

## API examples (curl)

Assuming the server runs on http://localhost:3000 and you've mounted the posts router at `/blog` (the default here):

- List all posts (GET):

```bash
curl -i http://localhost:3000/blog/
```

- Open the "new post" form (GET):

```bash
curl -i http://localhost:3000/blog/posts/new
```

- Create a new post (POST):

```bash
curl -i -X POST http://localhost:3000/blog/posts/new \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "title=My+New+Post&body=This+is+the+body+of+the+post"
```

Notes:

- The server currently redirects to the newly created post on success.
- If you use JSON instead, you can POST to the same endpoint with `-H "Content-Type: application/json" -d '{"title":"...","body":"..."}'`, but the form expects URL-encoded data.

## Validation — problem and solutions

Problem:

- User-supplied input can be missing, excessively long, or contain unsafe content (XSS, unexpected types). If not validated, this leads to poor UX, broken pages, or security issues and corrupt/irreversible data in the database.

What this project implements (minimal, safe defaults):

- Server-side validation in `controllers/postController.mjs`:
  - Trims inputs, enforces presence for `title` and `body`.
  - Enforces reasonable length limits (title ≤ 200 chars, body ≤ 10,000 chars).
  - On validation failure, re-renders `views/new.ejs` with a safe `errors` array and the previously-entered values so the user doesn't lose their input.
- Safe rendering in `views/new.ejs` using `typeof` checks to avoid ReferenceError when no error data is provided.

Why server-side validation first?

- Server-side validation is authoritative: it protects the database even if a client bypasses JavaScript checks.

Further improvements you can add (recommended):

- Client-side validation for better UX (instant feedback) — non-security, convenience only.
- Use a validation library like `express-validator` for richer rules and sanitization:

  npm install express-validator

- Use an HTML sanitizer for any rich HTML user input (e.g. `sanitize-html` or sanitize with a whitelist):

  npm install sanitize-html

- Escape or sanitize values when rendering to prevent XSS (EJS escapes by default for <%= %> but be careful with raw HTML insertion).
- Add tests (unit/integration) for the controller validation behavior.
- When adding destructive operations (delete), add CSRF protection or authenticated endpoints before exposing the UI button.

If you'd like, I can add examples showing `express-validator` rules, integrate `sanitize-html`, or wire up client-side validation next.

## Deleting from the browser — why we use POST and safe options

Problem:

- Browsers' HTML forms only support GET and POST methods natively. They can't directly submit HTTP DELETE requests. That makes implementing a RESTful DELETE endpoint from a plain HTML form awkward.

What this project does (simple and safe):

- Uses a POST endpoint (`POST /blog/post/:id/delete`) triggered by a small form on the detail page. The form includes a JavaScript confirmation prompt to prevent accidental deletion.

Why POST instead of DELETE:

- Simplicity: works in any browser without extra middleware. POST requests are not pre-fetched by browsers and map naturally to an action with side effects.
- Safety: when paired with a confirmation prompt and server-side checks, POST is acceptable for destructive actions in simple apps.

Recommended alternatives and hardening:

1. Method override (to use true DELETE semantics):

- Install `method-override` and submit a POST with a hidden `_method` field set to `DELETE`.
- Example:

  npm install method-override

  In `server.mjs`:

  ```js
  import methodOverride from "method-override";
  app.use(methodOverride("_method"));
  ```

  Then your form can POST with `<input type="hidden" name="_method" value="DELETE">` and your router can handle `router.delete('/post/:id', ...)`.

2. CSRF protection:

- Any destructive endpoint (delete, update) should be protected by CSRF tokens if your app has authenticated users.
- Example middleware: `csurf` (and pass the token to forms). This prevents cross-site requests from triggering destructive actions.

3. Use JavaScript fetch/XHR with proper HTTP verbs and headers:

- For single-page apps or when you already use client-side JS, send a `fetch('/blog/post/:id', { method: 'DELETE', headers: { 'CSRF-Token': '...' } })` request.
- Still add server-side checks and CSRF protection.

4. Confirmations and audit:

- Keep the confirmation prompt and consider adding a soft-delete / trash mechanism if accidental deletes are a concern.
- Log deletions for traceability.

In short: using POST for delete actions is pragmatic for small apps and demos. For production apps, add method-override (for semantic verbs), CSRF protection, and authentication/authorization before exposing delete buttons in the UI.

- ✅ Use regular functions (not arrow functions)
- ✅ Have access to `this` (the document)
- ✅ Keep your code DRY (Don't Repeat Yourself)
- ✅ Make models smarter and controllers cleaner

---

**Happy Learning! 🚀**
