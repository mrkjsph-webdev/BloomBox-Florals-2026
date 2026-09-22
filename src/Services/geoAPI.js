export async function geocodeAddress(address) {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=jsonv2&limit=1&countrycodes=ph&q=` +
    encodeURIComponent(address);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Geocoding request failed");
  }

  const data = await response.json();

  if (!data.length) {
    throw new Error("Address could not be found");
  }

  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    displayName: data[0].display_name,
  };
}