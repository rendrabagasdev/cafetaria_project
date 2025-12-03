/**
 * Library Index
 *
 * Central export point for all utility libraries
 */

// Settings management
export {
  getSettings,
  invalidateSettingsCache,
  getSettingsDirect,
} from "./settings";

// Fee calculation
export {
  calculateFees,
  formatRupiah,
  calculateCartTotal,
  type FeeCalculation,
} from "./fee-calculator";

// Cart utilities
export {
  calculateCartTotal as calculateCartTotalFromItems,
  calculateLocalCartTotal,
  transformToFirebaseCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  formatCurrency,
  validateCart,
  type CartItem,
  type LocalCartItem,
} from "./cart-utils";

// Midtrans integration
export {
  createQrisPayment,
  verifyMidtransSignature,
  generateOrderId,
  checkTransactionStatus,
  type CreateQrisPaymentParams,
  type MidtransQrisResponse,
} from "./midtrans";

// Stock management
export {
  deductStock,
  restoreStock,
  checkStockAvailability,
  getLowStockItems,
  type StockSnapshot,
} from "./stock";

// Firebase integration
export {
  initializeFirebaseSession,
  updateFirebaseCart,
  updateFirebaseSessionStatus,
  getFirebaseSession,
  deleteFirebaseSession,
  addItemToFirebaseCart,
  removeItemFromFirebaseCart,
  clearFirebaseCart,
} from "./firebase";

export type { PosSessionData } from "./firebase";

// Validation utilities
export {
  isValidEmail,
  isValidPhoneNumber,
  sanitizeInput,
  isValidPaymentMethod,
  isValidTransactionStatus,
  isPositiveNumber,
  isValidPercentage,
  isValidQuantity,
  isValidDateRange,
  parseDate,
  isValidUUID,
} from "./validation";

// Date utilities
export {
  getStartOfDay,
  getEndOfDay,
  getTodayRange,
  getYesterdayRange,
  getThisWeekRange,
  getThisMonthRange,
  formatDateIndonesian,
  formatDateTimeIndonesian,
  formatTime,
  addMinutes,
  addDays,
  isExpired,
  getRelativeTime,
  parseFlexibleDate,
} from "./date-utils";

// Error handling
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessError,
  errorResponse,
  successResponse,
  handlePrismaError,
  withErrorHandler,
} from "./errors";

// Re-export Prisma client
export { prisma } from "./prisma";
