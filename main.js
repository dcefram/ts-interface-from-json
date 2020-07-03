import parser from "fast-xml-parser";

const inputText = document.getElementById("input");
const outputTypesText = document.getElementById("output-types");
const outputJsonText = document.getElementById("output-json");
const generateButton = document.getElementById("generate");
const alertBox = document.getElementById("alert");

generateButton.addEventListener("click", () => {
  try {
    const { json, isXml } = parseText(inputText.value);

    const generated = generateTypes(json, "IGeneratedInterface");
    outputTypesText.querySelector("code").textContent = generated;

    if (isXml) {
      outputTypesText.classList.remove("height-100");
      outputTypesText.classList.add("height-50");

      outputJsonText.classList.remove("hidden");
      outputJsonText.querySelector("code").textContent = JSON.stringify(
        json,
        null,
        2
      );
    } else {
      outputTypesText.classList.remove("height-50");
      outputTypesText.classList.add("height-100");
      outputJsonText.classList.add("hidden");
    }
  } catch (e) {
    showAlert(`Hey, something went wrong: ${e.message}`);
  }
});

function parseText(text) {
  let json = {};
  let isXml = false;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = parser.parse(
      text,
      {
        attributeNamePrefix: "",
        ignoreAttributes: false,
      },
      true
    );
    isXml = true;
  }

  return { json, isXml };
}

function generateTypes(obj, name) {
  const objects = [];
  const parsed = Object.keys(obj).reduce((str, key) => {
    let type = Array.isArray(obj[key]) ? typeof obj[key][0] : typeof obj[key];

    if (type === "object" && obj[key] !== null) {
      type = key.charAt(0).toUpperCase() + key.slice(1, key.length);
      objects.push({ obj: obj[key], type });
    } else if (obj[key] === null) {
      type = "null";
    }

    type = type === "undefined" ? "any" : type;
    type = Array.isArray(obj[key]) ? type + "[]" : type;

    return `${str}\n  ${key}: ${type};`;
  }, "");

  let subTypes = "";

  objects.forEach((item) => {
    subTypes +=
      generateTypes(
        Array.isArray(item.obj) ? item.obj[0] : item.obj,
        item.type
      ) + "\n\n";
  });

  return `${subTypes}interface I${name} {${parsed}\n}`;
}

let alertTimeout = null;
function showAlert(message = "") {
  alertBox.querySelector(".alert").textContent = message;
  alertBox.classList.add("visible");
  clearTimeout(alertTimeout);

  alertTimeout = setTimeout(() => {
    alertBox.classList.remove("visible");
  }, 4000);
}
