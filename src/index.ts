// SEARCH ELEMENTS
const search_input = document.getElementById(
  "search-input"
) as HTMLInputElement;
// FORM
const form = document.querySelector("form");
// ICON - image element
const icon = document.getElementById("icon") as HTMLImageElement;
// LOADER - image element
const loader = document.getElementById("loader") as HTMLSpanElement;
// Maximize Map Button
const expandBtn = document.getElementById("expand-btn") as HTMLButtonElement;
const resElement = document.getElementById("result-element") as HTMLDivElement;
const mapElement = document.getElementById("map") as HTMLDivElement;

// RENDER ELEMENTS
const ip_address = document.getElementById("ip-address") as HTMLSpanElement;
const _location = document.getElementById("location") as HTMLSpanElement;
const _timezone = document.getElementById("timezone") as HTMLSpanElement;
const _isp = document.getElementById("isp") as HTMLSpanElement;

// LEAFLET
let isCardInFront = false;
const map = L.map("map");
const API_KEY = "at_U9S38hGHy8KZnQMgwS7rbI4ZQw6p3";

// change map location i.e add location icon to leaflet map
const renderMarker = (lat: number, lng: number) => {
  const mIcon = L.icon({
    iconUrl: "../dist/images/icon-location.svg",
    iconSize: [60, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94],
  });

  let marker = new L.Marker(
    {
      lat: lat,
      lng: lng,
    },
    {
      icon: mIcon,
    }
  );
  marker.addTo(map);
};

// handle loader
function showLoader(variant: "none" | "block") {
  loader.style.display = variant;
  variant == "none"
    ? (icon.style.display = "block")
    : (icon.style.display = "none");
}

interface ResponseData {
  as: { domain: string };
  ip: string;
  isp: string;
  location: {
    country: string;
    region: string;
    timezone: string;
    lat: number;
    lng: number;
    postalCode: string;
  };
}

expandBtn.addEventListener("click", function () {
  isCardInFront = !isCardInFront;
  if (isCardInFront) {
    mapElement.style.height = "100%";
    resElement.style.zIndex = "0";
    resElement.style.visibility = "hidden";
  } else {
    mapElement.style.height = "60%";
    resElement.style.zIndex = "2";
    resElement.style.visibility = "initial";
  }
});

const updateElements = (response: ResponseData) => {
  const { country, region, timezone, postalCode } = response.location;
  ip_address.innerHTML = response.ip;
  _timezone.innerHTML = timezone;
  _isp.innerHTML = response.isp;
  _location.innerHTML = `${region}, ${country}, ${postalCode}`;
};

const api = async <T>(url: string): Promise<T> => {
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
};

const getClientRequestPublicIp = async () => {
  let responseData = api<ResponseData>(
    `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}`
  );
  return responseData;
};

interface SearchQuery {
  ipAddress?: string;
  domain?: string;
}

const handleSearch = (query: SearchQuery) => {
  api<ResponseData>(
    `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}${
      query.ipAddress !== undefined
        ? `&ipAddress=${query.ipAddress}`
        : `&domain=${query.domain}`
    }`
  ).then((response) => {
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
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
  });
});

function isDomainOrIpAddress(
  input: string
): "domain" | "ipaddress" | "unknown" {
  const domainRegex = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

  if (input.match(domainRegex)) {
    return "domain";
  } else if (input.match(ipRegex)) {
    return "ipaddress";
  } else {
    return "unknown";
  }
}

form?.addEventListener("submit", function (e: SubmitEvent) {
  e.preventDefault(); // prevent the default form submission

  // perform validation on the search input
  if (search_input.value === "") {
    alert("Please enter a search term.");
    return;
  }

  if (isDomainOrIpAddress(search_input.value) === "domain") {
    handleSearch({
      domain: search_input.value,
    });
  } else if (isDomainOrIpAddress(search_input.value) === "ipaddress") {
    handleSearch({
      ipAddress: search_input.value,
    });
  } else {
    alert("unknown parameter");
  }
});
