"use strict";

//create map
let map = L.map(`map`);

//map options
const minZoom = 2;
const maxZoom = 8;
const maxBounds = [
  [-90, -180],
  [90, 180],
];

//set map bounds
map.setMaxBounds([
  [-90, -180],
  [90, 180],
]);

//set map max/min zoom
map.setMinZoom(minZoom);
map.setMaxZoom(maxZoom);

//set the view of the map
map.setView([40, 0], minZoom);

//create panels
map.createPane("labels");
map.getPane("labels").style.zIndex = 650;
map.getPane("labels").style.pointerEvents = "none";

//first layer - tiles
let positron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
  {
    attribution: "©OpenStreetMap, ©CartoDB",
  }
).addTo(map);

//second layer - names
let positronLabels = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
  {
    attribution: "©OpenStreetMap, ©CartoDB",
    pane: "labels",
  }
).addTo(map);

//overlay layer - geojson
let geojson = L.geoJson(countries).addTo(map);

//zoom to country function
const zoomToCountry = function (data) {
  map.setView(data.latlng, 6);
};

//create modal function
const createModal = function (data) {
  //html part
  const html = `
  <div class="modal center">
    <div class="modal-body">
      <div class="modal-image">
        <img src="${data.flags.png}" class="img-fluid" />
      </div>
      <div class="modal-text">
        <h1>${data.name.common}</h1>
        <h3>🗣️ Language: ${Object.values(data.languages)[0]}</h3>
        <h3>👶🏻 Population: ${
          data.population >= 1000000
            ? (data.population / 1000000).toFixed(1)
            : data.population
        }</h3>
        <h3>💸 Currency: ${Object.values(data.currencies)[0].name}</h3>
      </div>
    </div>
  </div>
  `;

  //insert the document and add animation
  document.getElementById(`map`).insertAdjacentHTML("beforebegin", html);
  setTimeout(function () {
    document.querySelector(`.modal-body`).classList.add(`modal-transition-in`);
  }, 100);

  //add animation and remove document.
  document.querySelector(`.modal`).addEventListener(`click`, function (e) {
    if (!e.target.closest(`.modal-body`))
      setTimeout(function () {
        document.querySelector(`.modal`).remove();
      }, 200);
    document.querySelector(`.modal-body`).classList.add(`modal-transition-out`);
  });
};

//api call for country data
const getCountryData = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then((response) => response.json())
    .then((data) => {
      createModal(data[0]);
      zoomToCountry(data[0]);
    });
};

geojson.eachLayer((layer) => {
  layer.on(`click`, (e) => {
    const name = e.target.feature.properties.name;
    getCountryData(name);
  });
});
