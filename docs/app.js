import { getScore } from "./gmhi.js";
import { plot_histogram } from "./graph.js";

// get a reference to the inputElement in any way you choose
const inputElement = document.getElementById("inputElement");
const submit = document.getElementById("submit");
const result = document.getElementById("result");

plot_histogram(-100000);

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
    if (score == null) {
      const message = "Please upload valid MetaPhlAn output file";
      // result.innerHTML = "Please upload valid MetaPhlAn output file";
      window.alert(message);
      return;
    }
    result.innerHTML = "GMHI score: " + score.toFixed(2);
    plot_histogram(score);
  };
};
