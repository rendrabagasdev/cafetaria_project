/**
 * Error Handling Utilities
 *
 * Custom error classes and error response formatters
 */

import { NextResponse } from "next/server";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = "Resource") {
    super(`${resource} tidak ditemukan`, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Business logic error (422)
 */
export class BusinessError extends ApiError {
  constructor(message: string) {
    super(message, 422);
    this.name = "BusinessError";
  }
}

/**
 * Format error response for API
 */
export function errorResponse(
  error: unknown,
  defaultMessage: string = "Terjadi kesalahan"
) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        type: error.name,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        type: "Error",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: defaultMessage,
      type: "UnknownError",
    },
    { status: 500 }
  );
}

/**
 * Success response helper
 */
export function successResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error: any): ApiError {
  // Unique constraint violation
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    return new ConflictError(`${field} sudah digunakan`);
  }

  // Record not found
  if (error.code === "P2025") {
    return new NotFoundError("Data");
  }

  // Foreign key constraint failed
  if (error.code === "P2003") {
    return new BusinessError("Tidak dapat menghapus data yang masih digunakan");
  }

  // Default error
  return new ApiError(error.message || "Database error");
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
