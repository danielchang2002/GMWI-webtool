// driver code

import { get_table, get_percentile } from "./utils.js";
import { plot_histogram } from "./histogram.js";
import { parse_file } from "./utils.js";
import { index_data, example } from "./data.js";
import { indicies } from "./indicies.js";

// get element references
const inputFile = document.getElementById("inputFile");
const inputText = document.getElementById("inputText");
const index_box = document.getElementById("indexBox");
const pop_box = document.getElementById("popBox");
const title = document.getElementById("title");
const histogram = document.getElementById("histogram");
const bar = document.getElementById("bar");
const ex_butt = document.getElementById("example");

const update_visuals = (e) => {
  const text = inputText.value;
  const index = index_box.value;
  const pop = pop_box.value;
  const data =
    pop === "all"
      ? index_data[index]["healthy"].concat(index_data[index]["nonhealthy"])
      : index_data[index][pop];
  const species = parse_file(text, "species");

  if (JSON.stringify(species) == "{}") {
    plot_histogram(histogram, null, data, index, pop, null);
    return;
  }
  const score = indicies[index](species);
  const perc = get_percentile(data, score);
  plot_histogram(histogram, score, data, index, pop, perc);
  plot_bar(bar);
};

update_visuals();

inputFile.onchange = (e) => {
  const file = inputFile.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (e) => {
    const text = reader.result;
    inputText.value = text;
    update_visuals();
    inputFile.value = "";
  };
};

index_box.onchange = update_visuals;
pop_box.onchange = update_visuals;
inputText.oninput = update_visuals;
ex_butt.onclick = () => {
  inputText.value = example;
  update_visuals();
};
