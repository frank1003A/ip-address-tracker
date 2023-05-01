var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { API_KEY } from "../config";
import L from "leaflet";
// SEARCH ELEMENTS
const search_input = document.getElementById("search-input");
// FORM
const form = document.querySelector("form");
// ICON - image element
const icon = document.getElementById("icon");
// LOADER - image element
const loader = document.getElementById("loader");
// Maximize Map Button
const expandBtn = document.getElementById("expand-btn");
const resElement = document.getElementById("result-element");
const mapElement = document.getElementById("map");
// RENDER ELEMENTS
const ip_address = document.getElementById("ip-address");
const _location = document.getElementById("location");
const _timezone = document.getElementById("timezone");
const _isp = document.getElementById("isp");
// LEAFLET 
let isCardInFront = false;
const map = L.map("map");
// change map location i.e add location icon to leaflet map
const renderMarker = (lat, lng) => {
    const mIcon = L.icon({
        iconUrl: "../dist/images/icon-location.svg",
        iconSize: [60, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowSize: [68, 95],
        shadowAnchor: [22, 94],
    });
    let marker = new L.Marker({
        lat: lat,
        lng: lng,
    }, {
        icon: mIcon,
    });
    marker.addTo(map);
};
// handle loader
function showLoader(variant) {
    loader.style.display = variant;
    variant == "none"
        ? (icon.style.display = "block")
        : (icon.style.display = "none");
}
expandBtn.addEventListener("click", function () {
    isCardInFront = !isCardInFront;
    if (isCardInFront) {
        mapElement.style.height = "100%";
        resElement.style.zIndex = "0";
        resElement.style.visibility = "hidden";
    }
    else {
        mapElement.style.height = "60%";
        resElement.style.zIndex = "2";
        resElement.style.visibility = "initial";
    }
});
const updateElements = (response) => {
    const { country, region, timezone, postalCode } = response.location;
    ip_address.innerHTML = response.ip;
    _timezone.innerHTML = timezone;
    _isp.innerHTML = response.isp;
    _location.innerHTML = `${region}, ${country}, ${postalCode}`;
};
const api = (url) => __awaiter(void 0, void 0, void 0, function* () {
    // show loading spinner
    showLoader("block");
    return fetch(url).then((response) => {
        // stop loading spinner
        showLoader("none");
        // error handler
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    });
});
const getClientRequestPublicIp = () => __awaiter(void 0, void 0, void 0, function* () {
    let responseData = api(`https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}`);
    return responseData;
});
const handleSearch = (query) => {
    api(`https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=${query.ipAddress}&domain=${query.domain}`).then((response) => {
        const { lat, lng } = response.location;
        updateElements(response);
        map.setView([lat, lng], 13);
        renderMarker(lat, lng);
    });
};
document.addEventListener("DOMContentLoaded", function () {
    //
    getClientRequestPublicIp().then((response) => {
        const { lat, lng } = response.location;
        updateElements(response);
        map.setView([lat, lng], 13);
        renderMarker(lat, lng);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
    });
});
form === null || form === void 0 ? void 0 : form.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent the default form submission
    // perform validation on the search input
    if (search_input.value === "") {
        alert("Please enter a search term.");
        return;
    }
    handleSearch({
        domain: search_input.value,
        ipAddress: search_input.value,
    });
});
