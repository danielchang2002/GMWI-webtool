import { getScore } from "./gmhi.js";

// get a reference to the inputElement in any way you choose
const inputElement = document.getElementById("inputElement");
const submit = document.getElementById("submit");
const result = document.getElementById("result");

submit.onclick = (e) => {
  // inputElement.onchange = (e) => {
  const file = inputElement.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    // e.target points to the reader
    const textContent = e.target.result;
    console.log(`The content of ${file.name} is ${textContent}`);
  };
  reader.onerror = (e) => {
    const error = e.target.error;
    console.error(`Error occured while reading ${file.name}`, error);
  };
  reader.readAsText(file);
  reader.onload = function (e) {
    const text = reader.result;
    const score = getScore(text);
    console.log(score);
    result.innerHTML = "GMHI score: " + score.toFixed(2);
  };
};
