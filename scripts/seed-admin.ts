// scripts/seed-admin.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ⚠️ Đổi theo env của bạn
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ahh_travel";

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email:    { type: String, unique: true },
  name:     String,
  password: String, // hashed
  roles:    { type: [String], default: ["admin"] },
}, { collection: "admins", timestamps: true });

const Admin = mongoose.model("Admin", AdminSchema);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const username = process.env.SEED_ADMIN_USER || "admin";
    const email    = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const rawPass  = process.env.SEED_ADMIN_PASS  || "Admin@123";

    const existed = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existed) {
      console.log("⚠️ Admin existed:", existed.username || existed.email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(rawPass, 10);
    const admin = await Admin.create({
      username, email, name: "Super Admin", password: hash, roles: ["admin", "superadmin"]
    });

    console.log("✅ Seeded admin:", { username, email, pass: rawPass, id: admin._id.toString() });
    process.exit(0);
  } catch (e) {
    console.error("Seed admin error:", e);
    process.exit(1);
  }
})();
