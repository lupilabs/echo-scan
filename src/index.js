import { parseXML } from './parser.js';
import axios from 'axios';

// Cache object to store GeoIP data
const geoIpCache = {};

async function getCountryInfo(ip) {
  // Check if the IP data is already cached
  if (geoIpCache[ip]) {
    return geoIpCache[ip];
  }

  const url = `https://freeipapi.com/api/json/${ip}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    // Cache the result for future use
    geoIpCache[ip] = {
      country: data.countryName || 'Unknown',
      flag: `https://flagcdn.com/w20/${data.countryCode.toLowerCase()}.png`,
    };

    return geoIpCache[ip]; // Return the cached result
  } catch (error) {
    console.error(`Error fetching data for IP ${ip}:`, error);
    return { country: 'Unknown', flag: '' };
  }
}

async function createRow(item, index) {
    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-200", "cursor-pointer");
  
    // Check the cache first to avoid redundant API calls
    const countryInfo = geoIpCache[item.ip] || await getCountryInfo(item.ip);
  
    // Set row content with the tooltip
    row.innerHTML = `
      <td class="p-2">${index + 1}</td>
      <td class="p-2">${item.time}</td>
      <td class="p-2">
        <span title="IP: ${item.ip}\nCountry: ${countryInfo.country}" class="flex items-center">
          <img src="${countryInfo.flag}" alt="Flag" class="w-5 h-3 mr-1">${item.lockIcon} ${item.url}
        </span>
      </td>
      <td class="p-2">${item.method}</td>
      <td class="p-2">${item.request.slice(0, 50)}...</td>
      <td class="p-2">${item.response.slice(0, 50)}...</td>
      <td class="p-2">${item.status}</td>
    `;
  
    // Add click event to display details
    row.onclick = () => renderDetails(item);
  
    return row;
  }
  
  async function renderTable() {
    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows
  
    // Render all rows without duplicate IP checks as createRow handles it
    const rows = await Promise.all(dataItems.map((item, index) => createRow(item, index)));
  
    // Append each row to the table body
    rows.forEach(row => tableBody.appendChild(row));
  }

  
// Constants for virtual scrolling
const rowHeight = 40; // Adjust to approximate row height
const visibleRows = 20; // Number of rows to display at a time
let startIndex = 0;
let dataItems = [];

  
  function renderDetails(item) {
    const detailsPane = document.getElementById("detailsPane");
    const [reqHeader, reqBody, resHeader, resBody] = detailsPane.querySelectorAll("pre");
  
    reqHeader.textContent = item.requestHeaders || "No headers";
    reqBody.textContent = item.request || "No request content";
    resHeader.textContent = item.responseHeaders || "No headers";
    resBody.textContent = item.response || "No response content";
  }
  
  

  async function handleScroll() {
    const listView = document.getElementById("listView");
    const scrollTop = listView.scrollTop;
    startIndex = Math.floor(scrollTop / rowHeight);
  
    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = ""; // Clear previous rows
  
    // Load only the visible rows asynchronously
    const rows = await Promise.all(
      dataItems.slice(startIndex, startIndex + visibleRows).map((item, i) => createRow(item, startIndex + i))
    );
  
    // Append each row to the table body
    rows.forEach(row => tableBody.appendChild(row));
  }
  

// File upload and data loading function
function loadData(items) {
  dataItems = items; // Store loaded items
  renderTable(); // Render the initial table
}

// Add event listener for scrolling to manage virtual scrolling
// document.getElementById("listView").addEventListener("scroll", handleScroll);

document.getElementById("fileUpload").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const text = await file.text();
    const items = parseXML(text); // from parser.js
    loadData(items); // Load parsed data into table
  });
  
