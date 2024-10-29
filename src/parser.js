function parseXML(xml) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");

  const items = Array.from(xmlDoc.getElementsByTagName("item")).map((item, index) => {
      const port = item.getElementsByTagName("port")[0]?.textContent || "N/A";
      const lockIcon = port === "443" 
          ? '<i class="fa fa-lock text-green-500"></i>' 
          : '<i class="fa fa-lock text-red-500"></i>';

      return {
          id: index + 1,
          time: item.getElementsByTagName("time")[0]?.textContent || "N/A",
          url: item.getElementsByTagName("url")[0]?.textContent || "N/A",
          host: item.getElementsByTagName("host")[0]?.textContent || "Unknown",
          ip: item.getElementsByTagName("host")[0]?.getAttribute("ip") || "N/A",
          port: port,
          lockIcon: lockIcon,  // Assign lock icon based on port
          method: item.getElementsByTagName("method")[0]?.textContent || "N/A",
          status: item.getElementsByTagName("status")[0]?.textContent || "N/A",
          request: decodeBase64Content(item.getElementsByTagName("request")[0]),
          response: decodeBase64Content(item.getElementsByTagName("response")[0]),
      };
  });
  return items;
}


function decodeBase64Content(element) {
  if (element && element.getAttribute("base64") === "true") {
    return atob(element.textContent);
  }
  return element ? element.textContent : "No content";
}

export { parseXML };
