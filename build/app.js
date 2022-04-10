// driver code

import { get_percentile } from "./utils.js";
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
const clear_button = document.getElementById("clear");
const submit_button = document.getElementById("submit");
const sampleBox = document.getElementById("sampleBox");

// updates all plots
const update_visuals = (e) => {
  update_hist();
  update_bar();
  update_pca();
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
  const species = parse_file(text, "species", parseInt(sampleBox.value));
  const score =
    sampleBox.value == -1 ? null : indicies[index](species);
  const perc =
    sampleBox.value == -1 ? null : get_percentile(data, score);
  plot_histogram(histogram, score, data, index, pop, perc);
};

// updates figure 2
export const update_bar = () => {
  const text = inputText.value;
  const pop_bar = pop_box_bar.value;
  const rank = rank_bar.value;
  const barData = bar_data[rank][pop_bar];
  const sample_bar = sampleBox.value == -1 ? [] 
    : get_taxon_bar_list(parse_file(text, rank, parseInt(sampleBox.value)));
  plot_bar(bar, barData, sample_bar, rank);
};

// updates figure 3
const update_pca = () => {
  const text = inputText.value;
  const species = sampleBox.value == -1 ? {}
    : parse_file(text, "species", parseInt(sampleBox.value));
  const metric = metric_form.value;
  plot_pca(pca, pca_data["scatter"], species, metric);
};

const update_sample_box = () => {
  // Delete existing options
  const options = document.querySelectorAll('#sampleBox option');
  options.forEach(o => o.remove());

  // Add none option back
  const opt = document.createElement('option');
  opt.text = "None";
  opt.value = -1;
  sampleBox.add(opt);

  // Look at all sample names in file
  const text = inputText.value;
  const sample_names = text.split("\n")[0].split("\t").slice(1);
  for (let i = 0; i < sample_names.length; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = sample_names[i];
    sampleBox.add(opt);
  }
}

update_visuals();

inputFile.onchange = (e) => {
  const file = inputFile.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (e) => {
    const text = reader.result;
    inputText.value = text;
    // update_visuals();
    inputFile.value = "";
    update_sample_box();
  };
};

clear_button.onclick = (e) => {
  inputText.value = "";
  update_sample_box();
};

submit_button.onclick = (e) => {
  update_visuals();
};

// Trigger plot update for side bar forms
index_box.onchange = update_hist;
pop_box.onchange = update_hist;

pop_box_bar.onchange = update_bar;
rank_bar.onchange = update_bar;

inputText.oninput = update_sample_box;

ex_butt.onclick = () => {
  inputText.value = example;
  update_sample_box();
};

metric_form.onchange = update_pca;