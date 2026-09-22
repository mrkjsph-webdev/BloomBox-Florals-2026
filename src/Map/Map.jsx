import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./Map.css";

function Map({ destination, route }) {
  if (!destination) {
    return <p>Loading map...</p>;
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[
          destination.latitude,
          destination.longitude,
        ]}
        zoom={14}
        className="leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[
            destination.latitude,
            destination.longitude,
          ]}
        >
          <Popup>
            <strong>Delivery Address</strong>
            <br />
            {destination.displayName}
          </Popup>
        </Marker>

        {route.length > 0 && (
          <Polyline positions={route} />
        )}
      </MapContainer>
    </div>
  );
}

export default Map;