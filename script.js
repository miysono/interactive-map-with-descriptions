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

//ZOOM TO COUNTRY FUNCTION
const zoomToCountry = function (data) {
  map.setView(data.latlng, 6);
};

//INSERT MODAL FUNCTION
const insertModalWithAnimation = function (html) {
  document.getElementById(`map`).insertAdjacentHTML("beforebegin", html);
  setTimeout(function () {
    document.querySelector(`.modal-body`).classList.add(`modal-transition-in`);
  }, 100);
};

//REMOVE MODAL FUNCTION
const removeModalWithAnimation = function () {
  document.querySelector(`.modal`).addEventListener(`click`, function (e) {
    if (!e.target.closest(`.modal-body`)) {
      setTimeout(function () {
        document.querySelector(`.modal`).remove();
      }, 200);
      document
        .querySelector(`.modal-body`)
        .classList.add(`modal-transition-out`);
    }
  });
};

//return the borders -> the neighbours
const getNeighbours = function (data) {
  if (data.hasOwnProperty(`borders`)) return data.borders;
  else return false;
};

const addNeighbourHTML = function (data) {
  const html = `
  <div class = "neighbour">
    <img src ="${data.flags.png}" class = "img-fluid">
    <p>${data.name.common}</p>
  </div>
  `;
  document.querySelector(`.modal-footer`).insertAdjacentHTML(`beforeend`, html);
};

const getNeighbourData = function (code) {
  fetch(`
  https://restcountries.com/v3.1/alpha/${code}`)
    .then((response) => response.json())
    .then((data) => {
      addNeighbourHTML(data[0]);
    });
};

const renderNeighbours = function (data) {
  if (!getNeighbours(data)) return;

  const neighbours = getNeighbours(data).filter((_, index) => index < 4);
  let html = "";
  neighbours.forEach((neighbour) => {
    html += getNeighbourData(neighbour);
  });
};

//CREATE MODAL FUNCTION
const createModal = function (data) {
  console.log(data);
  console.log(!data.languages);
  //html part
  const html = `
  <div class="modal center">
    <div class="modal-body">
      <div class="modal-image">
        <img src="${data.flags.png}" class="img-fluid" />
      </div>
      <div class="modal-text">
        <h1>${data.name.common}</h1>
        <h3>🗣️ Language: ${
          !data.languages ? "English" : `${Object.values(data.languages)[0]}`
        }</h3>
        <h3>👶🏻 Population: ${
          data.population >= 1000000
            ? (data.population / 1000000).toFixed(1)
            : data.population
        } ${data.population >= 1000000 ? "million" : ""}</h3>
        <h3>💸 Currency: ${
          !data.currencies
            ? "No currency"
            : `${Object.values(data.currencies)[0].name}`
        }</h3>
      </div>

      <div class = "modal-footer">
      </div>
    </div>
  </div>
  `;

  renderNeighbours(data);

  //insert the document and add animation
  insertModalWithAnimation(html);
  //insertNeighbours();

  //add animation and remove document.
  removeModalWithAnimation();
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

const countrySelect = function () {
  geojson.eachLayer((layer) => {
    layer.on(`click`, (e) => {
      let name = e.target.feature.properties.name;

      //United kingdom bug
      if (name === "Wales" || name === "England" || name === "Scotland")
        name = "United Kingdom";

      getCountryData(name);
    });
  });
};

countrySelect();
