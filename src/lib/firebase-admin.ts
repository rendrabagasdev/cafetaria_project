/**
 * Firebase Admin SDK Export
 * Re-export dari firebase.ts untuk digunakan di API routes
 */

import { getApps } from "firebase-admin/app";

// Import untuk inisialisasi
import "./firebase";

// Export app instance
export const app = getApps()[0];
