/**
 * Test Firebase Connection
 *
 * Run this script to test if Firebase is properly configured:
 * npx ts-node scripts/test-firebase.ts
 */

import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Load environment variables
config();

async function testFirebase() {
  console.log("🔥 Testing Firebase Connection...\n");

  // Check environment variables
  console.log("1. Checking environment variables...");
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!serviceAccount) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT not set");
    process.exit(1);
  }
  if (!databaseURL) {
    console.error("❌ FIREBASE_DATABASE_URL not set");
    process.exit(1);
  }
  console.log("✅ Environment variables OK\n");

  // Parse service account
  console.log("2. Parsing service account JSON...");
  let parsedAccount;
  try {
    parsedAccount = JSON.parse(serviceAccount);
    console.log("✅ Service account parsed successfully");
    console.log("   Project ID:", parsedAccount.project_id);
    console.log("   Client Email:", parsedAccount.client_email);
    console.log("");
  } catch (error: any) {
    console.error(
      "❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:",
      error.message
    );
    process.exit(1);
  }

  // Initialize Firebase
  console.log("3. Initializing Firebase Admin SDK...");
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(parsedAccount),
        databaseURL: databaseURL,
      });
    }
    console.log("✅ Firebase Admin initialized\n");
  } catch (error: any) {
    console.error("❌ Firebase initialization failed:", error.message);
    process.exit(1);
  }

  // Test database write
  console.log("4. Testing database write...");
  try {
    const db = getDatabase();
    const testRef = db.ref("_test/connection");

    const testData = {
      timestamp: new Date().toISOString(),
      message: "Test connection successful",
    };

    await testRef.set(testData);
    console.log("✅ Write test successful\n");

    // Test database read
    console.log("5. Testing database read...");
    const snapshot = await testRef.get();
    const data = snapshot.val();
    console.log("✅ Read test successful");
    console.log("   Data:", data);
    console.log("");

    // Cleanup
    console.log("6. Cleaning up test data...");
    await testRef.remove();
    console.log("✅ Cleanup successful\n");

    console.log("🎉 All tests passed! Firebase is properly configured.");
    console.log("\nDatabase URL:", databaseURL);
    console.log("Project ID:", parsedAccount.project_id);
  } catch (error: any) {
    console.error("❌ Database operation failed:", error.message);
    console.error("\nPossible issues:");
    console.error("- Check Firebase Realtime Database Rules");
    console.error("- Ensure database exists and is enabled");
    console.error("- Verify service account has proper permissions");
    process.exit(1);
  }
}

testFirebase().catch(console.error);
