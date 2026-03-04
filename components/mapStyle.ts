export const mapStyle = {
    version: 8,
    sources: {
      desa: {
        type: "vector",
        tiles: [
          "https://your-tile-server/tiles/desa/{z}/{x}/{y}.pbf"
        ],
        minzoom: 5,
        maxzoom: 14
      }
    },
    layers: [
      {
        id: "desa-fill",
        type: "fill",
        source: "desa",
        "source-layer": "desa",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.6
        }
      },
      {
        id: "desa-border",
        type: "line",
        source: "desa",
        "source-layer": "desa",
        paint: {
          "line-color": "#1e3a8a",
          "line-width": 0.8
        }
      },
      {
        id: "desa-label",
        type: "symbol",
        source: "desa",
        "source-layer": "desa",
        minzoom: 8,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-font": ["Open Sans Bold"],
          "text-allow-overlap": false,
          "text-ignore-placement": false
        },
        paint: {
          "text-color": "#1e3a8a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1
        }
      }
    ]
  }