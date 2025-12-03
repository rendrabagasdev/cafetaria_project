export async function fetchItems(status: string = "TERSEDIA") {
  try {
    const res = await fetch(`/api/items?status=${status}`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

export async function fetchBestSellers(limit: number = 4) {
  try {
    const res = await fetch(
      `/api/items?status=TERSEDIA&bestSeller=true&limit=${limit}`
    );
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export async function fetchSettings() {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    return data.settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}
