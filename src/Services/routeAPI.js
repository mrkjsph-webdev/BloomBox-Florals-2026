export const SHOP_ADDRESS = "Bacoor, Cavite, Philippines";

export async function getShopLocation() {
  // Dasmariñas City, Cavite coordinates
  return {
    latitude: 14.3294,

    longitude: 120.9367,

    displayName: "BloomBox Florals, Dasmariñas City, Cavite",
  };
}
export async function getRoute(start, destination) {
  if (
    !start ||
    !Number.isFinite(Number(start.latitude)) ||
    !Number.isFinite(Number(start.longitude))
  ) {
    throw new Error("Shop coordinates are unavailable");
  }

  if (
    !destination ||
    !Number.isFinite(Number(destination.latitude)) ||
    !Number.isFinite(Number(destination.longitude))
  ) {
    throw new Error("Client coordinates are unavailable");
  }

  const coordinates =
    `${start.longitude},${start.latitude};` +
    `${destination.longitude},${destination.latitude}`;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${coordinates}?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Routing request failed");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes || !data.routes.length) {
    throw new Error("No route found");
  }

  return data.routes[0];
}
