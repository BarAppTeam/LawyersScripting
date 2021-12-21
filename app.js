import fetch from "node-fetch";
import jsdom from "jsdom";

import excel from "./utils/excel.js";

// Excel columns
const columns = [
  { header: "שם", key: "name" },
  { header: "כתובת", key: "adress" },
  { header: "טלפון", key: "phone" },
  { header: "פקס", key: "fax" },
  { header: "טלפון נייד", key: "phone_nayad" },
  { header: "כתובת אימייל", key: "email" },
  { header: "תחומי התמחות", key: "fields" },
];

// Category name
const categoryName = "אדריכלות";

// Get html text from link
const htmlText = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return text;
};

// Get all profile data from Link
const profileData = async (link) => {
  const profileHtml = await htmlText(link);
  const profileDom = new jsdom.JSDOM(profileHtml);
  const profileDocument = profileDom.window.document;

  var result = {};

  const fields = profileDocument.querySelectorAll(".field");
  fields.forEach((field) => {
    const fieldName = field.querySelector("label").textContent.replace(":", "");

    if (fieldName === 'דוא"ל') {
      const email = field.querySelector(".data");

      var emailText = unescape(email.textContent);
      var emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/gi;
      var emailArray = emailText.match(emailRegex);

      result = { ...result, [fieldName]: emailArray[0] };
    } else {
      const fieldValue = field.querySelector("div").textContent.trim();
      result = { ...result, [fieldName]: fieldValue };
    }
  });

  const adress = profileDocument.querySelector(".address");
  const adressText = adress.textContent.trim();
  result = { ...result, כתובת: adressText };

  return result;
};

// Get all HTML data from Link
const html = await htmlText(
  `http://www.lawyerinfo.co.il/search?s=${categoryName}`
);

// Create DOM
const dom = new jsdom.JSDOM(html);

// Get document from the DOM
const document = dom.window.document;

// Get table properties from the document
const tbody = document.querySelector("tbody");

const lawyersRows = [];
for (let i = 0; i < tbody.rows.length; i++) {
  const row = tbody.rows[i];
  const href = row.cells[0].querySelector("a").href;
  const link = `http://www.lawyerinfo.co.il${href}`;

  const name = row.cells[0].textContent;
  const city = row.cells[1].textContent;
  const field = row.cells[2].textContent;
  const profile = await profileData(link);

  console.log({ name, link, city, field, profile });

  lawyersRows.push({
    name: name,
    adress: profile["כתובת"],
    phone: profile["טלפון"],
    fax: profile["פקס"],
    phone_nayad: profile["נייד"],
    email: profile['דוא"ל'],
    fields: field,
  });
}

excel(categoryName, columns, lawyersRows);
