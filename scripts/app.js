/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

const weatherApp = {
  selectedLocations: {},
  addDialogContainer: document.getElementById('addDialogContainer'),
  btnContainer: document.getElementById('btnContainer'),
  mainForm: document.getElementById('indexCountForm'),
  infoBox: document.getElementById('info'),
  wynikBox: document.getElementById('wynik_row'),
  kartonsBox: document.getElementById('kartony_row'),
};

/* Obliczenia */

weatherApp.mainForm.addEventListener('change', function() {
  var inputWymiar = weatherApp.mainForm.inputWymiar.value;
  var inputSztuk = weatherApp.mainForm.inputSztuk.value;
  var inputSpeed = weatherApp.mainForm.inputSpeed.value;
  var inputPoIle = weatherApp.mainForm.inputPoIle.value;
  licz(inputWymiar, inputSztuk, inputSpeed, inputPoIle);
});

function licz(wymiar, sztuk, speed, poile) {
  //Zmienne komunikatów
  var wynikValue = document.getElementById('wynik');
  var kartonsValue = document.getElementById('kartony');

  var wynikCzas = '';
  var wynikKartons = '';


  //Obliczam czas
  var czas = (wymiar / 1000) * (sztuk / speed) / 60;
  //Konwertuje czas do tablicy
  var czasArray = czas.toString().split('.');
  //Sprawdzam ilosc rekordow
  var czasIsArray = czasArray.length;
  //Wykonuje sprawdzenie czy tablica
  if (czasIsArray == 1) {
    var wynikCzas = czasArray[0] + ' Godzin 0 Minut';
  } else {

    var minuty = Math.round(czasArray[1].substr(0, 2) / 100 * 60, 0);
    var wynikCzas = czasArray[0] + ' Godzin ' + minuty.toString() + ' Minut';
  }

  //Obliczam kartony
  var kartons = sztuk / poile;
  //Konwertuje czas do tablicy
  var kartonsArray = kartons.toString().split('.');
  //Sprawdzam ilosc rekordow
  var kartonsIsArray = kartonsArray.length;
  //Wykonuje sprawdzenie czy tablica
  if (kartonsIsArray == 1) {
    var wynikKartons = kartonsArray[0] + '';
  } else {
    var sztuki = Math.round(parseFloat('0.' + kartonsArray[1]) * poile, 0);
    var wynikKartons = kartonsArray[0] + ' po ' + poile + ' sztuk i reszta ' + sztuki.toString() + ' sztuk';
  }

  //Jezeli wymiar i speed null
  if (!wymiar && !speed && !sztuk) {
    weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Wprowadź dane do formularza aby obliczyć czas realizacji zamówienia i ilość kartonów!";
  } else {
    weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Dane w formularzu niekompletne! Wypełnij pola oznaczone gwiazdką.";
    if (isNaN(czasArray[0]) || isNaN(kartons)) {
      weatherApp.wynikBox.setAttribute('hidden', true);
      weatherApp.infoBox.removeAttribute('hidden');
      weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Dane w formularzu niekompletne! Wypełnij pola oznaczone gwiazdką.";
    } else {
      weatherApp.infoBox.removeAttribute('hidden');
      weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Dane w formularzu niekompletne! Wypełnij pola oznaczone gwiazdką.";

      if (wynikCzas != 0 && wynikCzas != Infinity) {
        weatherApp.infoBox.setAttribute('hidden', true);
        weatherApp.wynikBox.removeAttribute('hidden');
        wynikValue.innerHTML = "Szacowany czas realizacji: <strong>" + wynikCzas + "</strong>";
      } else {
        weatherApp.wynikBox.setAttribute('hidden', true);
        weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Dane w formularzu niekompletne! Wypełnij pola oznaczone gwiazdką.";
      }

      if (wynikKartons != 0 && wynikKartons != Infinity) {
        weatherApp.infoBox.setAttribute('hidden', true);
        weatherApp.kartonsBox.removeAttribute('hidden');
        kartonsValue.innerHTML = "Ilość kartonów do zrobienia: : <strong>" + wynikKartons + "</strong>";
      } else {
        weatherApp.kartonsBox.setAttribute('hidden', true);
        weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Dane w formularzu niekompletne! Wypełnij pola oznaczone gwiazdką.";
      }

    }
  }
  var ret = {
    "kartony": wynikKartons,
    "czas": wynikCzas,
  };
  return ret;

};


/**
 * Toggles the visibility of the add location dialog box.
 */

function cleanMainForm() {
  weatherApp.mainForm.reset();
  weatherApp.wynikBox.setAttribute('hidden', true);
  weatherApp.kartonsBox.setAttribute('hidden', true);
  weatherApp.infoBox.innerHTML = "<strong>Uwaga!</strong> Wprowadź dane do formularza aby obliczyć czas realizacji zamówienia i ilość kartonów!";
  weatherApp.infoBox.removeAttribute('hidden');
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
  // Hide the dialog
  toggleAddDialog();
  // Get the selected city
  const select = document.getElementById('selectCityToAdd');
  const selected = select.options[select.selectedIndex];
  const geo = selected.value;
  const label = selected.textContent;
  const location = {label: label, geo: geo};
  // Create a new card & get the weather data from the server
  const card = getForecastCard(location);
  getForecastFromNetwork(geo).then((forecast) => {
    renderForecast(card, forecast);
  });
  // Save the updated list of selected cities.
  weatherApp.selectedLocations[geo] = location;
  saveLocationList(weatherApp.selectedLocations);
}

/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
  const parent = evt.srcElement.parentElement;
  parent.remove();
  if (weatherApp.selectedLocations[parent.id]) {
    delete weatherApp.selectedLocations[parent.id];
    saveLocationList(weatherApp.selectedLocations);
  }
}

/**
 * Renders the forecast data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Weather forecast data to update the element with.
 */
function renderForecast(card, data) {
  if (!data) {
    // There's no data, skip the update.
    return;
  }

  // Find out when the element was last updated.
  const cardLastUpdatedElem = card.querySelector('.card-last-updated');
  const cardLastUpdated = cardLastUpdatedElem.textContent;
  const lastUpdated = parseInt(cardLastUpdated);

// If the data on the element is newer, skip the update.
if (lastUpdated >= data.currently.time) {
  return;
}
  cardLastUpdatedElem.textContent = data.currently.time;

  // Render the forecast data into the card.
  card.querySelector('.description').textContent = data.currently.summary;
  const forecastFrom = luxon.DateTime
      .fromSeconds(data.currently.time)
      .setZone(data.timezone)
      .toFormat('DDDD t');
  card.querySelector('.date').textContent = forecastFrom;
  card.querySelector('.current .icon')
      .className = `icon ${data.currently.icon}`;
  card.querySelector('.current .temperature .value')
      .textContent = Math.round(data.currently.temperature);
  card.querySelector('.current .humidity .value')
      .textContent = Math.round(data.currently.humidity * 100);
  card.querySelector('.current .wind .value')
      .textContent = Math.round(data.currently.windSpeed);
  card.querySelector('.current .wind .direction')
      .textContent = Math.round(data.currently.windBearing);
  const sunrise = luxon.DateTime
      .fromSeconds(data.daily.data[0].sunriseTime)
      .setZone(data.timezone)
      .toFormat('t');
  card.querySelector('.current .sunrise .value').textContent = sunrise;
  const sunset = luxon.DateTime
      .fromSeconds(data.daily.data[0].sunsetTime)
      .setZone(data.timezone)
      .toFormat('t');
  card.querySelector('.current .sunset .value').textContent = sunset;

  // Render the next 7 days.
  const futureTiles = card.querySelectorAll('.future .oneday');
  futureTiles.forEach((tile, index) => {
    const forecast = data.daily.data[index + 1];
    const forecastFor = luxon.DateTime
        .fromSeconds(forecast.time)
        .setZone(data.timezone)
        .toFormat('ccc');
    tile.querySelector('.date').textContent = forecastFor;
    tile.querySelector('.icon').className = `icon ${forecast.icon}`;
    tile.querySelector('.temp-high .value')
        .textContent = Math.round(forecast.temperatureHigh);
    tile.querySelector('.temp-low .value')
        .textContent = Math.round(forecast.temperatureLow);
  });

  // If the loading spinner is still visible, remove it.
  const spinner = card.querySelector('.card-spinner');
  if (spinner) {
    card.removeChild(spinner);
  }
}

/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */

/* do skasowania
function getForecastFromNetwork(coords) {
  return fetch(`/forecast/${coords}`)
      .then((response) => {
        return response.json();
      })
      .catch(() => {
        return null;
      });
}

*/

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(coords) {
// CODELAB: Add code to get weather forecast from the caches object.
if (!('caches' in window)) {
  return null;
}
const url = `${window.location.origin}/forecast/${coords}`;
return caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch((err) => {
      console.error('Error getting data from cache', err);
      return null;
    });

}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the weather forecast.
 */
function getForecastCard(location) {
  const id = location.geo;
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const newCard = document.getElementById('weather-template').cloneNode(true);
  newCard.querySelector('.location').textContent = location.label;
  newCard.setAttribute('id', id);
  newCard.querySelector('.remove-city')
      .addEventListener('click', removeLocation);
  document.querySelector('main').appendChild(newCard);
  newCard.removeAttribute('hidden');
  return newCard;
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */

 /* do skasowania
function updateData() {
  Object.keys(weatherApp.selectedLocations).forEach((key) => {
    const location = weatherApp.selectedLocations[key];
    const card = getForecastCard(location);
    // CODELAB: Add code to call getForecastFromCache.
getForecastFromCache(location.geo)
    .then((forecast) => {
      renderForecast(card, forecast);
    });

    // Get the forecast data from the network.
    getForecastFromNetwork(location.geo)
        .then((forecast) => {
          renderForecast(card, forecast);
        });
  });
} */

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem('locationList', data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadLocationList() {
  let locations = localStorage.getItem('locationList');
  if (locations) {
    try {
      locations = JSON.parse(locations);
    } catch (ex) {
      locations = {};
    }
  }
  if (!locations || Object.keys(locations).length === 0) {
    const key = '40.7720232,-73.9732319';
    locations = {};
    locations[key] = {label: 'New York City', geo: '40.7720232,-73.9732319'};
  }
  return locations;
}

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
  // Get the location list, and update the UI.
  weatherApp.selectedLocations = loadLocationList();
  /*updateData();*/

  // Set up the event handlers for all of the buttons.
  document.getElementById('butClean').addEventListener('click', cleanMainForm);
}

init();
