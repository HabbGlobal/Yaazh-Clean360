import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db";
import { User } from "../models/User";

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "Admin@yaazh360.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@#1805";
  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    { name: "Yaazh360 Administrator", email, password: passwordHash, role: "admin", emailVerified: true, accountStatus: "active", phone: "021 222 2700", address: "Pradesa Sabha, Jaffna" },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
  console.log(`Admin account is ready for ${email}`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
