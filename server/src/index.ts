import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db.js";
// Load environment variables from .env file in parent directory
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== HEALTH CHECK ====================
/**
 * Health Check Endpoint
 * Tests database connection
 * GET http://localhost:5000/api/health
 */
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    res.status(200).json({
      status: "success",
      message: "✅ Database connection successful",
      timestamp: new Date().toISOString(),
      database: {
        provider: "MS SQL Server",
        authentication: "Windows Authentication",
        connected: true,
      },
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
    res.status(500).json({
      status: "error",
      message: "❌ Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      troubleshooting: [
        "1. Verify DATABASE_URL in .env file",
        "2. Check if SQL Server is running",
        "3. Verify server name (use \\\\ for instance names like LAPTOP-PC\\SQLEXPRESS)",
        "4. Ensure Windows Authentication is enabled",
        "5. Check network connectivity",
      ],
    });
  }
});

// ==================== USER ENDPOINTS ====================

/**
 * Get all users
 * GET http://localhost:5000/api/users
 */
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get a single user by ID
 * GET http://localhost:5000/api/users/:id
 */
app.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Create a new user (Registration)
 * POST http://localhost:5000/api/users
 * Body: { "email": "user@example.com", "name": "John Doe", "password": "pass123", "phone": "01700000000", "location": "ঢাকা" }
 */
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { email, name, password, phone, location } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        status: "error",
        message: "Email already exists",
      });
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        location: location || null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Update a user
 * PUT http://localhost:5000/api/users/:id
 * Body: { "email": "newemail@example.com", "name": "Jane Doe", "phone": "01800000000", "location": "চট্টগ্রাম" }
 */
app.put("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, password, phone, location } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(phone && { phone }),
        ...(location && { location }),
      },
    });

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Delete a user
 * DELETE http://localhost:5000/api/users/:id
 */
app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ==================== POST ENDPOINTS ====================

/**
 * Get all posts
 * GET http://localhost:5000/api/posts
 */
app.get("/api/posts", async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      message: "Posts fetched successfully",
      data: posts,
      count: posts.length,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Create a new post
 * POST http://localhost:5000/api/posts
 * Body: { "title": "My Post", "content": "Post content", "userId": 1 }
 */
app.post("/api/posts", async (req: Request, res: Response) => {
  try {
    const { title, content, userId } = req.body;

    if (!title || !userId) {
      res.status(400).json({
        status: "error",
        message: "Title and userId are required",
      });
      return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: content || null,
        userId,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ==================== ERROR HANDLING ====================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.path,
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: MS SQL Server (Windows Authentication)`);
  console.log(`🔗 Health Check: GET http://localhost:${PORT}/api/health`);
  console.log(`${"=".repeat(60)}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`  Users: GET    /api/users`);
  console.log(`         GET    /api/users/:id`);
  console.log(`         POST   /api/users (Registration)`);
  console.log(`         PUT    /api/users/:id`);
  console.log(`         DELETE /api/users/:id`);
  console.log(`  Posts: GET    /api/posts`);
  console.log(`         POST   /api/posts`);
  console.log(`${"=".repeat(60)}\n`);
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});