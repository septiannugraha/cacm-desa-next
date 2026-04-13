import type { StyleSpecification } from "maplibre-gl"

export const mapStyle: StyleSpecification = {

  version: 8,

  sources: {

    provinsi:{
      type:"vector",
      tiles:["/tiles/provinsi/{z}/{x}/{y}.pbf"],
      minzoom:4,
      maxzoom:6
    },

    pemda:{
      type:"vector",
      tiles:["/tiles/pemda/{z}/{x}/{y}.pbf"],
      minzoom:6,
      maxzoom:8
    },

    kecamatan:{
      type:"vector",
      tiles:["/tiles/kecamatan/{z}/{x}/{y}.pbf"],
      minzoom:8,
      maxzoom:10
    },

    desa:{
      type:"vector",
      tiles:["/tiles/desa/{z}/{x}/{y}.pbf"],
      minzoom:10,
      maxzoom:14
    }

  },

  layers:[

    {
      id:"provinsi-fill",
      type:"fill",
      source:"provinsi",
      "source-layer":"provinsi_clean",
      paint:{
        "fill-color":"#e2e8f0",
        "fill-opacity":0.6
      }
    },

    {
      id:"pemda-fill",
      type:"fill",
      source:"pemda",
      "source-layer":"pemda_clean",
      minzoom:6,
      paint:{
        "fill-color":"#c7d2fe",
        "fill-opacity":0.6
      }
    },

    {
      id:"kecamatan-fill",
      type:"fill",
      source:"kecamatan",
      "source-layer":"kecamatan_clean",
      minzoom:8,
      paint:{
        "fill-color":"#93c5fd",
        "fill-opacity":0.6
      }
    },

    {
      id:"desa-fill",
      type:"fill",
      source:"desa",
      "source-layer":"desa_clean",
      minzoom:10,
      paint:{
        "fill-color":"#60a5fa",
        "fill-opacity":0.7
      }
    }

  ]
}