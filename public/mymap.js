// create the OSM layer
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution:
    'Map data © \
              <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
});

let getData = async function () {
  const geodata = await fetch("http://localhost:3000/allData");
  const biblioteker = geodata.json();
  return biblioteker;
};

let getNearest = async function (lon, lat) {
  const geodata = await fetch(
    `http://localhost:3000/bibliotek?lon=${lon}&lat=${lat}`
  );
  const bibliotek = geodata.json();
  return bibliotek;
};

const createMap = function () {
  var mymap = L.map("map", {
    center: [55.675706, 12.578745],
    zoom: 13,
    layers: [osm],
  });
  L.control.scale().addTo(mymap);
  var basemaps = { OpenStreetMap: osm };
  let controls = L.control.layers(basemaps).addTo(mymap);

  getData().then((bibliotekData) => {
    bibliotekData.forEach((bibliotek) => {
      let marker = L.marker(bibliotek.geometry.coordinates.reverse());
      marker.bindPopup(bibliotek.navn);
      biblioteker.push(marker);
    });

    let bibliotekGroup = L.layerGroup(biblioteker);

    mymap.addLayer(bibliotekGroup);
    controls.addOverlay(bibliotekGroup, "Biblioteker");
  });
  return mymap;
};

const biblioteker = [];
const mymap = createMap();
mymap.on("click", onMapClick);
let currentLocation = null;
let nearestLocation = null;

async function onMapClick(e) {
  if (currentLocation) {
    mymap.removeLayer(currentLocation);
  }
  currentLocation = L.marker(e.latlng).addTo(mymap);
  await getNearest(e.latlng.lng, e.latlng.lat).then((nearestData) => {
    if (nearestLocation) {
      mymap.removeLayer(nearestLocation);
    }
    nearestLocation = L.marker(
      nearestData[0].geometry.coordinates.reverse()
    ).addTo(mymap);
  });
}
