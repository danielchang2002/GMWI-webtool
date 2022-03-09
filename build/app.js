// driver code

import { get_table, get_percentile } from "./utils.js";
import { plot_histogram } from "./histogram.js";
import { plot_bar } from "./bar.js";
import { plot_pca } from "./pca.js";
import { parse_file, get_taxon_bar_list } from "./utils.js";
import { index_data, example, bar_data, pca_data } from "./data.js";
import { indicies } from "./indicies.js";

// get element references
const inputFile = document.getElementById("inputFile");
const inputText = document.getElementById("inputText");
const index_box = document.getElementById("indexBox");
const pop_box = document.getElementById("popBox");
const pop_box_bar = document.getElementById("popBoxBar");
const metric_form = document.getElementById("compMetric");
const rank_bar = document.getElementById("rankBar");
const title = document.getElementById("title");
const histogram = document.getElementById("histogram");
const histogram_caption = document.getElementById("histogram_caption");
const bar = document.getElementById("bar");
const pca = document.getElementById("pca");
const ex_butt = document.getElementById("example");

// updates all plots
const update_visuals = (e) => {
  update_hist()
  update_bar()
  update_pca()
};

// updates figure 1
const update_hist = () => {
  const text = inputText.value;
  const index = index_box.value;
  const pop = pop_box.value;
  const data =
    pop === "all"
      ? index_data[index]["healthy"].concat(index_data[index]["nonhealthy"])
      : index_data[index][pop];
  const species = parse_file(text, "species");
  const score =
    JSON.stringify(species) == "{}" ? null : indicies[index](species);
  const perc =
    JSON.stringify(species) == "{}" ? null : get_percentile(data, score);
  plot_histogram(histogram, score, data, index, pop, perc);
}

// updates figure 2
const update_bar = () => {
  const text = inputText.value;
  const pop_bar = pop_box_bar.value;
  const rank = rank_bar.value;
  const barData = bar_data[rank][pop_bar];
  const sample_bar = get_taxon_bar_list(parse_file(text, rank));
  plot_bar(bar, barData, sample_bar, rank);
}

// updates figure 3
const update_pca = () => {
  const text = inputText.value;
  const species = parse_file(text, "species");
  const metric = metric_form.value;
  plot_pca(pca, pca_data["scatter"], species, metric);
}

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

// Trigger plot update for side bar forms 
index_box.onchange = update_hist;
pop_box.onchange = update_hist;

pop_box_bar.onchange = update_bar;
rank_bar.onchange = update_bar;

inputText.oninput = update_visuals;
ex_butt.onclick = () => {
  inputText.value = example;
  update_visuals();
};

metric_form.onchange = update_pca;
