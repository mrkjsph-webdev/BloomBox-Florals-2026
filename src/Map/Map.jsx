import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./Map.css";

function MapView({ shop, destination, route }) {
  const map = useMap();

  if (
    shop &&
    destination &&
    Number.isFinite(Number(shop.latitude)) &&
    Number.isFinite(Number(shop.longitude)) &&
    Number.isFinite(Number(destination.latitude)) &&
    Number.isFinite(Number(destination.longitude))
  ) {
    const points =
      route && route.length > 0
        ? route
        : [
            [shop.latitude, shop.longitude],
            [destination.latitude, destination.longitude],
          ];

    const bounds = points.map(([latitude, longitude]) => [
      Number(latitude),
      Number(longitude),
    ]);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  }

  return null;
}

function Map({ shop, destination, route = [] }) {
  if (!shop || !destination) {
    return <p>Loading map...</p>;
  }

  const shopLatitude = Number(shop.latitude);
  const shopLongitude = Number(shop.longitude);

  const destinationLatitude = Number(destination.latitude);
  const destinationLongitude = Number(destination.longitude);

  if (
    !Number.isFinite(shopLatitude) ||
    !Number.isFinite(shopLongitude) ||
    !Number.isFinite(destinationLatitude) ||
    !Number.isFinite(destinationLongitude)
  ) {
    return <p>Unable to load map locations.</p>;
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[shopLatitude, shopLongitude]}
        zoom={14}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapView shop={shop} destination={destination} route={route} />

        {/* SHOP PIN */}
        <Marker position={[shopLatitude, shopLongitude]}>
          <Popup>
            <strong>BloomBox Florals</strong>
            <br />
            {shop.displayName || "Bacoor, Cavite"}
          </Popup>
        </Marker>

        {/* CLIENT PIN */}
        <Marker position={[destinationLatitude, destinationLongitude]}>
          <Popup>
            <strong>Delivery Address</strong>
            <br />
            {destination.displayName}
          </Popup>
        </Marker>

        {/* DRIVING ROUTE */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              weight: 6,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default Map;
