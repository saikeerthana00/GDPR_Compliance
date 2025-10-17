// components/MapPlotter.jsx
import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { TrendingUp } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createCustomIcon = ({
  color = "#3B82F6",
  isFrequent = false,
  size = 34,
}) => {
  const border = 3;
  const total = size + 12;
  const haloSize = size * 1.9;
  const uid = Math.random().toString(36).slice(2);
  const shineId = `shine-${uid}`;
  const gradId = `grad-${uid}`;
  const shadowId = `dropshadow-${uid}`;

  const svg = `
  <svg width="${total}" height="${total + 6}" viewBox="0 0 ${total} ${
    total + 6
  }" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${
    isFrequent ? "Frequent location" : "Location"
  }">
    <defs>
      <radialGradient id="${shineId}" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
        <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.85"/>
      </linearGradient>
      <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    ${
      isFrequent
        ? `
    <g>
      <circle cx="${total / 2}" cy="${size / 2 + 2}" r="${
            haloSize / 2
          }" fill="${color}" opacity="0.12" class="pin-pulse"/>
    </g>`
        : ""
    }

    <g filter="url(#${shadowId})">
      <path d="
        M ${total / 2} 3
        C ${total / 2 + size * 0.52} 3, ${total - 6} ${size * 0.48}, ${
    total / 2
  } ${size + 6}
        C 6 ${size * 0.48}, ${total / 2 - size * 0.52} 3, ${total / 2} 3
        Z
      " fill="url(#${gradId})" stroke="#FFFFFF" stroke-width="${border}" />
      <circle cx="${total / 2}" cy="${size * 0.42}" r="${
    size * 0.32
  }" fill="url(#${shineId})"/>
      <g transform="translate(${total / 2}, ${size * 0.42})">
        ${
          isFrequent
            ? `<path d="M0,-8 L2.4,-1.0 L9, -1.0 L3.6,2.8 L5.8,9 L0,5.2 L-5.8,9 L-3.6,2.8 L-9,-1.0 L-2.4,-1.0 Z" fill="#FFFFFF"/>`
            : `<circle r="4" fill="#FFFFFF" />`
        }
      </g>
    </g>
  </svg>
  `;

  return L.divIcon({
    html: svg,
    className: isFrequent ? "pin frequent-pin" : "pin",
    iconSize: [total, total + 6],
    iconAnchor: [total / 2, total],
    popupAnchor: [0, -size * 0.6],
  });
};

async function geoLocate(ip) {
  const res = await fetch(`https://ipwho.is/${ip}`);
  if (!res.ok) throw new Error("Lookup failed");
  const data = await res.json();
  if (!data.success) throw new Error("Invalid IP");
  return { lat: data.latitude, lng: data.longitude };
}

export default function MapPlotter({
  logins,
  frequentLocations = null,
  showFrequentLocationsList = false,
}) {
  const [points, setPoints] = useState([]);

  const calculatedFrequentLocations = useMemo(() => {
    if (frequentLocations) return frequentLocations;
    if (!showFrequentLocationsList || !logins?.length) return [];
    const locationCounts = {};
    logins.forEach((login) => {
      const ip = login.IP || "Unknown Location";
      locationCounts[ip] = (locationCounts[ip] || 0) + 1;
    });
    return Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }, [logins, frequentLocations, showFrequentLocationsList]);

  const frequentIPs = useMemo(() => {
    return new Set(calculatedFrequentLocations.map((loc) => loc.location));
  }, [calculatedFrequentLocations]);

  useEffect(() => {
    async function load() {
      const lookups = (logins || []).map((login) =>
        geoLocate(login.IP)
          .then(({ lat, lng }) => ({
            ...login,
            lat,
            lng,
            isFrequent: frequentIPs.has(login.IP),
          }))
          .catch(() => null)
      );
      const results = await Promise.all(lookups);
      const clean = results.filter((p) => p && p.lat != null && p.lng != null);
      setPoints(clean);
    }
    if (logins && logins.length) load();
    else setPoints([]);
  }, [logins, frequentIPs]);

  const groupedPoints = useMemo(() => {
    const byCell = new Map();
    const keyFor = (lat, lng) => {
      const prec = 3;
      return `${lat.toFixed(prec)},${lng.toFixed(prec)}`;
    };
    for (const p of points) {
      const key = keyFor(p.lat, p.lng);
      if (!byCell.has(key)) {
        byCell.set(key, {
          lat: p.lat,
          lng: p.lng,
          isFrequent: !!p.isFrequent,
          ips: new Set([p.IP]),
          samples: [p],
        });
      } else {
        const bucket = byCell.get(key);
        bucket.isFrequent = bucket.isFrequent || !!p.isFrequent;
        bucket.ips.add(p.IP);
        bucket.samples.push(p);
      }
    }
    return Array.from(byCell.values()).map((bucket) => {
      const repr =
        bucket.samples.find((s) => s.isFrequent) || bucket.samples[0];
      return {
        ...repr,
        lat: bucket.lat,
        lng: bucket.lng,
        ipList: Array.from(bucket.ips),
        totalLogins: bucket.samples.length,
        isFrequent: bucket.isFrequent,
      };
    });
  }, [points]);

  const center = [20, 0];

  return (
    <div>
      <div className="relative h-[450px] w-full rounded-lg shadow-lg overflow-hidden">
        <style jsx>{`
          .frequent-pin .pin-pulse {
            transform-origin: center;
            animation: pulse 2.4s ease-out infinite;
          }
          @keyframes pulse {
            0% {
              transform: scale(0.6);
              opacity: 0.22;
            }
            60% {
              transform: scale(1);
              opacity: 0.08;
            }
            100% {
              transform: scale(1.2);
              opacity: 0;
            }
          }
          .leaflet-container {
            background: #f7f7fb;
          }
        `}</style>

        <MapContainer center={center} zoom={2} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {groupedPoints.map(
            (
              {
                IP,
                ipList,
                lat,
                lng,
                Date: dateString,
                DeviceModel,
                DeviceSystem,
                NetworkType,
                UserAgent,
                isFrequent,
                totalLogins,
              },
              idx
            ) => (
              <Marker
                key={`${lat}-${lng}-${idx}`}
                position={[lat, lng]}
                icon={createCustomIcon({
                  color: isFrequent ? "#F97316" : "#2563EB",
                  isFrequent,
                  size: isFrequent ? 36 : 32,
                })}
              >
                <Popup className="text-sm">
                  <div className="min-w-[220px]">
                    {isFrequent && (
                      <div className="mb-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Frequent Location
                      </div>
                    )}
                    <div className="font-mono mb-1 text-blue-700 font-semibold break-all">
                      {ipList && ipList.length > 1 ? (
                        <div>
                          {ipList.slice(0, 3).map((ip) => (
                            <div key={ip}>{ip}</div>
                          ))}
                          {ipList.length > 3 && (
                            <div className="text-xs text-gray-500">
                              + {ipList.length - 3} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>{IP}</span>
                      )}
                    </div>
                    {totalLogins > 1 && (
                      <div className="mb-1">
                        <strong>Sessions in area:</strong> {totalLogins}
                      </div>
                    )}
                    {dateString && (
                      <div className="mb-1">
                        <strong>When:</strong>{" "}
                        {new Date(dateString).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    {DeviceModel && (
                      <div className="mb-1">
                        <strong>Device:</strong> {DeviceModel}
                      </div>
                    )}
                    {DeviceSystem && (
                      <div className="mb-1">
                        <strong>OS:</strong> {DeviceSystem}
                      </div>
                    )}
                    {NetworkType && (
                      <div className="mb-1">
                        <strong>Network:</strong> {NetworkType}
                      </div>
                    )}
                    {UserAgent && (
                      <div>
                        <strong>User Agent:</strong> {UserAgent}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          )}
        </MapContainer>
      </div>

      {calculatedFrequentLocations.length > 0 && showFrequentLocationsList && (
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="text-md font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
            Most Frequent Login Locations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calculatedFrequentLocations.map((location, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-3 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {location.location}
                    </span>
                    <div className="text-xs text-gray-500">IP Address</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                    {location.count} {location.count === 1 ? "login" : "logins"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-700">
              <strong>Legend:</strong> Orange pins indicate frequent login
              locations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
