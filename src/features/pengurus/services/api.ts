/**
 * Pengurus API Services
 */

export async function approveItem(itemId: number): Promise<void> {
  const response = await fetch(`/api/items/${itemId}/approve`, {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to approve item");
  }
}

export async function rejectItem(itemId: number): Promise<void> {
  const response = await fetch(`/api/items/${itemId}/reject`, {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to reject item");
  }
}

export async function deleteUser(userId: number): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete user");
  }
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<void> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to create user");
  }
}

export async function updateUser(
  userId: number,
  userData: {
    name: string;
    email: string;
    password?: string;
    role: string;
  }
): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to update user");
  }
}
