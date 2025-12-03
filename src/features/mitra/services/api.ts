/**
 * Mitra API Services
 */

export async function deleteItem(itemId: number): Promise<void> {
  const response = await fetch(`/api/items/${itemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete item");
  }
}

export async function updateItemStatus(
  itemId: number,
  status: string
): Promise<void> {
  const response = await fetch(`/api/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to update status");
  }
}
