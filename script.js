const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weatherContainer");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFound = document.querySelector(".error-found");

// Current Tab
let currentTab = userTab;
currentTab.classList.add("current-tab");
const API_KEY = "eb9f0b888c1265b34c918b8545c06394";

grantAccessContainer.classList.add("active");

//Switching Between Tabs
function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        notFound.classList.remove("active");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        if (!searchForm.classList.contains("active")) {
            // If search form is invisble then make it visible
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
            notFound.classList.remove("active");
        }
        else {
            //Intialy I am at searchTab we click on userTab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            // I am at user Tab then we have to show weather, so check local storage for location ,if it gain location from that then Display weather with this, otherwise show grantLocation
            getfromSessionStorage();
        }
    }
}
userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});
searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

function getfromSessionStorage() {
    const localCoordinate = sessionStorage.getItem("user-coordinates");
    if (!localCoordinate) {
        // Show Grant Access page
        grantAccessContainer.classList.add("active");
    }
    else {
        // if Cordinate find then call api for show weather details 
        const coordinates = JSON.parse(localCoordinate);
        fetchUserWeatherInfo(coordinates);
    }
}
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    // Hide Grant Page
    grantAccessContainer.classList.remove("active");
    // Load page visible
    loadingScreen.classList.add("active");
    //Api call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        // activate weather details
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");
        grantAccessContainer.classList.remove("active");
    }

}

function renderWeatherInfo(data) {
    // Featch element from data
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloud]");
    // fetch values
    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windSpeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity} %`;
    cloud.innerText = `${data?.clouds?.all} %`;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        // show alert
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const grantAccessButton = document.querySelector("[data-grantAcess]");
grantAccessButton.addEventListener("click", getLocation);

let searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    notFound.classList.remove("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        notFound.classList.remove("active");
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        if (data?.name == undefined) {
            userInfoContainer.classList.remove("active");
            notFound.classList.add("active");
        }
    }
    catch (err) {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        notFound.classList.add("active");
    }
}