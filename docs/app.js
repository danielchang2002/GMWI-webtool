// driver code

import { get_table } from "./utils.js";
// import { plot_histogram } from "./histogram.js";
import { get_histogram } from "./histogram2.js";
import { plot_bar } from "./bars.js";
import { parse_file } from "./utils.js";
import { gmhi_score } from "./gmhi.js";

// get element references
const inputElement = document.getElementById("inputElement");
const submit = document.getElementById("submit");
const result = document.getElementById("result");

// plot histogram before scoring
plot_histogram(-100000);

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

    plot_histogram(gmhi_score(species));
  };
};
