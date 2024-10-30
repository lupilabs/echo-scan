function parseXML(xml) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");

  const items = Array.from(xmlDoc.getElementsByTagName("item")).map((item, index) => {
    const port = item.getElementsByTagName("port")[0]?.textContent || "N/A";
    const lockIcon = port === "443" 
      ? '<i class="fa fa-lock text-green-500"></i>' 
      : '<i class="fa fa-lock text-red-500"></i>';

    const requestContent = decodeBase64Content(item.getElementsByTagName("request")[0]);
    const responseContent = decodeBase64Content(item.getElementsByTagName("response")[0]);

    // Use parseHeadersAndBody to split requests and responses
    const { headers: requestHeaders, body: requestBody } = parseHeadersAndBody(requestContent);
    const { headers: responseHeaders, body: responseBody } = parseHeadersAndBody(responseContent);

    return {
      id: index + 1,
      time: item.getElementsByTagName("time")[0]?.textContent || "N/A",
      url: item.getElementsByTagName("url")[0]?.textContent || "N/A",
      host: item.getElementsByTagName("host")[0]?.textContent || "Unknown",
      ip: item.getElementsByTagName("host")[0]?.getAttribute("ip") || "N/A",
      port: port,
      lockIcon: lockIcon,
      method: item.getElementsByTagName("method")[0]?.textContent || "N/A",
      status: item.getElementsByTagName("status")[0]?.textContent || "N/A",
      requestHeaders,
      requestBody,
      responseHeaders,
      responseBody,
    };
  });

  return items;
}

// Helper function to split headers and body
function parseHeadersAndBody(content) {
  // Check for CRLF first (\r\n\r\n), then LF (\n\n)
  let delimiterIndex = content.indexOf("\r\n\r\n");
  let offset = 4; // for CRLF delimiter
  
  if (delimiterIndex === -1) {
    // Fall back to LF if CRLF not found
    delimiterIndex = content.indexOf("\n\n");
    offset = 2; // for LF delimiter
  }

  if (delimiterIndex !== -1) {
    return {
      headers: content.slice(0, delimiterIndex).trim(),
      body: content.slice(delimiterIndex + offset).trim(),
    };
  } else {
    return {
      headers: content.trim(),
      body: "No content",
    };
  }
}



function decodeBase64Content(element) {
  if (element && element.getAttribute("base64") === "true") {
    return atob(element.textContent);
  }
  return element ? element.textContent : "No content";
}

export { parseXML };