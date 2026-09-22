export async function getRoute(start, destination) {
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

  if (data.code !== "Ok" || !data.routes.length) {
    throw new Error("No route found");
  }

  return data.routes[0];
}