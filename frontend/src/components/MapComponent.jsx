import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ restaurants }) => {
  // Center map on USA by default, or the first restaurant
  const centerLat = restaurants.length > 0 && restaurants[0].lat ? restaurants[0].lat : 39.8283;
  const centerLng = restaurants.length > 0 && restaurants[0].lng ? restaurants[0].lng : -98.5795;
  const zoomLevel = restaurants.length > 0 ? 4 : 3;

  return (
    <div style={{ height: '450px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}>
      <MapContainer center={[centerLat, centerLng]} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {restaurants.map((restaurant) => {
          if (restaurant.lat && restaurant.lng) {
            return (
              <Marker key={restaurant.id} position={[restaurant.lat, restaurant.lng]}>
                <Popup>
                  <div style={{ textAlign: 'center', minWidth: '150px' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#1a1a1a' }}>{restaurant.name}</h3>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>{restaurant.cuisine}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#2563eb' }}>⭐ {restaurant.rating}</p>
                    <Link 
                      to={`/restaurants/${restaurant.id}`} 
                      style={{ 
                        display: 'block', 
                        backgroundColor: '#2563eb', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
