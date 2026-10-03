export async function geocodeAddress(address) {
  if (!address || !String(address).trim()) {
    throw new Error("Address is required");
  }

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

  const latitude = Number(data[0].lat);
  const longitude = Number(data[0].lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates returned");
  }

  return {
    latitude,
    longitude,
    displayName: data[0].display_name,
  };
}
