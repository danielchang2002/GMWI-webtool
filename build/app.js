// driver code

import { get_table } from "./utils.js";
import { plot_histogram } from "./histogram.js";
import { parse_file } from "./utils.js";
import { scores } from "./test.js";
import { index_data } from "./data.js";

// get element references
const inputElement = document.getElementById("inputElement");
const submit = document.getElementById("submit");
const result = document.getElementById("result");
const histogram = document.getElementById("d3-container");

// plot histogram before scoring
plot_histogram(histogram, 1, scores);

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
    result.innerHTML = get_table(species);

    // plot_histogram(gmhi_score(species));
  };
};
