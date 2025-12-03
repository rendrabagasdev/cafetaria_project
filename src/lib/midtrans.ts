/**
 * Midtrans Integration Library
 *
 * Handles QRIS payment creation and webhook signature verification
 * Using official midtrans-client SDK
 *
 * Configuration from environment variables (NOT from database):
 * - MIDTRANS_SERVER_KEY
 * - MIDTRANS_CLIENT_KEY (optional)
 * - MIDTRANS_ENVIRONMENT ("production" or "sandbox")
 */

import crypto from "crypto";
import { getSettings } from "./settings";
import { logger } from "./logger";
// @ts-expect-error - midtrans-client doesn't have TypeScript types
import midtransClient from "midtrans-client";

export interface CreateQrisPaymentParams {
  orderId: string;
  grossAmount: number;
  customerName?: string;
  customerEmail?: string;
}

export interface MidtransQrisResponse {
  transactionId: string;
  orderId: string;
  qrisUrl: string;
  expireTime: string;
}

/**
 * Get Midtrans Core API client
 * Reads configuration from environment variables
 */
function getCoreApiClient() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";

  if (!serverKey) {
    const error = new Error(
      "MIDTRANS_SERVER_KEY not configured in environment variables"
    );
    logger.error("Midtrans configuration missing", {
      service: "Midtrans",
      action: "getCoreApiClient",
      environment: process.env.NODE_ENV,
      missingVariable: "MIDTRANS_SERVER_KEY",
    });
    throw error;
  }

  logger.info("Midtrans Core API client initialized", {
    service: "Midtrans",
    action: "getCoreApiClient",
    environment: isProduction ? "production" : "sandbox",
  });

  return new midtransClient.CoreApi({
    isProduction,
    serverKey,
    clientKey: clientKey || "",
  });
}

/**
 * Create QRIS payment via Midtrans API
 *
 * @throws Error if Midtrans API fails
 */
export async function createQrisPayment(
  params: CreateQrisPaymentParams
): Promise<MidtransQrisResponse> {
  logger.info("Creating QRIS payment", {
    service: "Midtrans",
    action: "createQrisPayment",
    orderId: params.orderId,
    grossAmount: params.grossAmount,
  });

  try {
    // Get payment timeout from Settings (business config, not credentials)
    const settings = await getSettings();
    const coreApi = getCoreApiClient();

    // Prepare request body
    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      qris: {
        acquirer: "gopay", // or 'airpay' based on preference
      },
      custom_expiry: {
        expiry_duration: settings.paymentTimeoutMinutes,
        unit: "minute",
      },
      ...(params.customerName && {
        customer_details: {
          first_name: params.customerName,
          email: params.customerEmail,
        },
      }),
    };

    // Call Midtrans charge API
    const chargeResponse = await coreApi.charge(parameter);

    logger.info("QRIS payment created successfully", {
      service: "Midtrans",
      action: "createQrisPayment",
      orderId: params.orderId,
      transactionId: chargeResponse.transaction_id,
      status: chargeResponse.transaction_status,
    });

    // Extract QR code URL from actions
    const qrisAction = chargeResponse.actions?.find(
      (action: any) => action.name === "generate-qr-code"
    );

    if (!qrisAction?.url) {
      const error = new Error("QRIS URL not found in Midtrans response");
      logger.error("Invalid Midtrans response - QRIS URL missing", {
        service: "Midtrans",
        action: "createQrisPayment",
        orderId: params.orderId,
        responseStatus: chargeResponse.transaction_status,
        availableActions: chargeResponse.actions?.map((a: any) => a.name),
      });
      throw error;
    }

    return {
      transactionId: chargeResponse.transaction_id,
      orderId: chargeResponse.order_id,
      qrisUrl: qrisAction.url,
      expireTime: chargeResponse.expiry_time,
    };
  } catch (error: any) {
    logger.error(
      "Midtrans API error while creating QRIS payment",
      {
        service: "Midtrans",
        action: "createQrisPayment",
        orderId: params.orderId,
        grossAmount: params.grossAmount,
        errorMessage: error.message,
        apiResponse: error.ApiResponse,
        httpStatusCode: error.httpStatusCode,
      },
      error
    );
    throw new Error(`Midtrans API error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Verify Midtrans webhook signature (SHA512)
 *
 * This is CRITICAL for security - prevents fake payment notifications
 *
 * @returns true if signature is valid
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    const error = new Error("MIDTRANS_SERVER_KEY not configured");
    logger.error("Midtrans configuration missing for signature verification", {
      service: "Midtrans",
      action: "verifyMidtransSignature",
      orderId,
      missingVariable: "MIDTRANS_SERVER_KEY",
    });
    throw error;
  }

  // Construct signature string
  const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;

  // Compute SHA512 hash
  const computedSignature = crypto
    .createHash("sha512")
    .update(signatureString)
    .digest("hex");

  // Compare signatures
  const isValid = computedSignature === signatureKey;

  if (!isValid) {
    logger.error("Midtrans webhook signature verification failed", {
      service: "Midtrans",
      action: "verifyMidtransSignature",
      orderId,
      statusCode,
      grossAmount,
      receivedSignature: signatureKey.substring(0, 10) + "...",
      computedSignature: computedSignature.substring(0, 10) + "...",
    });
  } else {
    logger.info("Midtrans webhook signature verified", {
      service: "Midtrans",
      action: "verifyMidtransSignature",
      orderId,
      statusCode,
    });
  }

  return isValid;
}

/**
 * Generate unique order ID for Midtrans
 * Format: TXN-{timestamp}-{randomId}
 *
 * @example
 * generateOrderId() // "TXN-1733184000000-a1b2c3d4"
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(4).toString("hex");
  return `TXN-${timestamp}-${randomId}`;
}

/**
 * Check transaction status via Midtrans API
 * Useful for polling payment status
 */
export async function checkTransactionStatus(orderId: string): Promise<any> {
  logger.info("Checking transaction status", {
    service: "Midtrans",
    action: "checkTransactionStatus",
    orderId,
  });

  const coreApi = getCoreApiClient();

  try {
    const statusResponse = await coreApi.transaction.status(orderId);

    logger.info("Transaction status retrieved", {
      service: "Midtrans",
      action: "checkTransactionStatus",
      orderId,
      status: statusResponse.transaction_status,
      paymentType: statusResponse.payment_type,
    });

    return statusResponse;
  } catch (error: any) {
    logger.error(
      "Failed to check transaction status",
      {
        service: "Midtrans",
        action: "checkTransactionStatus",
        orderId,
        errorMessage: error.message,
        httpStatusCode: error.httpStatusCode,
      },
      error
    );
    throw new Error(
      `Failed to check transaction status: ${error.message || "Unknown error"}`
    );
  }
}
