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
const result = document.getElementById("result");
const histogram = document.getElementById("histogram");
const ex_butt = document.getElementById("example");
const rem_butt = document.getElementById("remove");

const update_visuals = (e) => {
  const text = inputText.value;
  const index = index_box.value;
  const pop = pop_box.value;
  const data =
    pop === "all"
      ? index_data[index]["healthy"].concat(index_data[index]["unhealthy"])
      : index_data[index][pop];
  const species = parse_file(text, "species");
  if (JSON.stringify(species) == "{}") {
    // const message = "Please upload valid MetaPhlAn output file";
    // window.alert(message);
    // return;
    result.innerHTML = "";
    plot_histogram(histogram, -10000, data);
    return;
  }
  const score = indicies[index](species);
  const perc = get_percentile(data, score);
  result.innerHTML = `
    ${index} score: ${score} <br/>
    ${perc}<sup>th</sup> percentile
    `;
  plot_histogram(histogram, score, data);
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
rem_butt.onclick = () => {
  inputText.value = "";
  update_visuals();
};
