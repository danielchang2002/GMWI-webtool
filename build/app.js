// driver code

import { get_table, get_percentile } from "./utils.js";
import { plot_histogram } from "./histogram.js";
import { parse_file } from "./utils.js";
import { index_data } from "./data.js";
import { indicies } from "./indicies.js";

// get element references
const inputElement = document.getElementById("inputElement");
const submit = document.getElementById("submit");
const index_box = document.getElementById("indexBox");
const pop_box = document.getElementById("popBox");
const result = document.getElementById("result");
const histogram = document.getElementById("d3-container");

// plot histogram before scoring
// plot_histogram(histogram, 1, index_data["GMHI"]["healthy"]);

submit.onclick = (e) => {
  const file = inputElement.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function (e) {
    const text = reader.result;
    const species = parse_file(text, "species");
    if (JSON.stringify(species) == "{}") {
      const message = "Please upload valid MetaPhlAn output file";
      window.alert(message);
      return;
    }
    // const index = Object.keys(indicies)[Math.floor(Math.random() * 5)];
    const index = index_box.value;
    const pop = pop_box.value;
    const data =
      pop === "all"
        ? index_data[index]["healthy"].concat(index_data[index]["unhealthy"])
        : index_data[index][pop];
    const score = indicies[index](species);
    const perc = get_percentile(data, score);
    result.innerHTML = `
    ${index} score: ${score} <br/>
    ${perc}<sup>th</sup> percentile
    `;

    plot_histogram(histogram, score, data);
  };
};
