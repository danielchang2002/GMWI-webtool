// driver code

import { get_percentile, get_tabs, } from "./utils.js";
import { plot_histogram } from "./histogram.js";
import { plot_bar } from "./bar.js";
import { plot_hphm } from "./hphm.js";
import { plot_abundant } from "./abundant.js";
import { plot_pca } from "./pca.js";
import { parse_file, get_taxon_bar_list } from "./utils.js";
import { index_data, example, bar_data, pca_data } from "./data.js";
import { indicies } from "./indicies.js";

// get element references
const inputFile = document.getElementById("inputFile");
const inputText = document.getElementById("inputText");
const pop_box = document.getElementById("popBox");
const hphm = document.getElementById("hphm");
const abundant = document.getElementById("abundant");
const histogram = document.getElementById("histogram");
const bar = document.getElementById("bar");
const pca = document.getElementById("pca");
const ex_butt = document.getElementById("example");
const clear_button = document.getElementById("clear");
const submit_button = document.getElementById("submit");
const export_button = document.getElementById("export");
// const export_plots_button = document.getElementById("exportPlots");
const sampleBox = document.getElementById("sampleBox");
const sampleDiv = document.getElementById("sampleDiv");

// hide sample select initially
sampleDiv.style.display = 'none';

// updates all plots
const update_visuals = (e) => {
  update_hist();
  update_bar();
  update_pca();
  update_hphm();
  update_abundant();
};

// updates figure 1
const update_hist = () => {
  const title = "hist";
  const index_list = ["GMHI", "Richness", "Evenness", "Shannon", "Inverse Simpson"];
  let active = 0;

  // find the active one (if exists)
  const list = document.getElementById(`${title}-pills-tab`);
  if (list !== null) {
    const items = list.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      if (items[i].getElementsByTagName("button")[0].classList.contains("active")) {
        active = i;
      }
    }
  }

  const tabs = get_tabs(title, index_list, active);
  histogram.innerHTML = tabs;
  for (let i = 0; i < index_list.length; i++) {
    const text = inputText.value;
    const index = index_list[i];
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
    const ele = document.getElementById(`${title}-pills-${i}`);
    plot_histogram(ele, score, data, index, pop, perc);
  }
};

// updates figure 2
export const update_bar = () => {
  const title = "bar";
  const rank_list = ["Phylum", "Class", "Order", "Family"];
  let active = 0;

  // find the active one (if exists)
  const list = document.getElementById(`${title}-pills-tab`);
  if (list !== null) {
    const items = list.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      if (items[i].getElementsByTagName("button")[0].classList.contains("active")) {
        active = i;
      }
    }
  }
  const tabs = get_tabs(title, rank_list, active);
  bar.innerHTML = tabs;
  const text = inputText.value;
  const pop_bar = pop_box.value;
  for (let i = 0; i < rank_list.length; i++) {
    const rank = rank_list[i].toLowerCase();
    const barData = bar_data[rank][pop_bar];
    const sample_bar = sampleBox.value == -1 ? [] 
      : get_taxon_bar_list(parse_file(text, rank, parseInt(sampleBox.value)));
    const ele = document.getElementById(`${title}-pills-${i}`);
    plot_bar(ele, barData, sample_bar, rank);
  }
};

// updates figure 3
const update_pca = () => {
  const title = "pca";
  const metric_list = ["Health Status", "Phenotype"];
  const metric_list_true = ["Phenotype", "Phenotype_all"];
  let active = 0;

  // find the active one (if exists)
  const list = document.getElementById(`${title}-pills-tab`);
  if (list !== null) {
    const items = list.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      if (items[i].getElementsByTagName("button")[0].classList.contains("active")) {
        active = i;
      }
    }
  }

  const tabs = get_tabs(title, metric_list, active);
  pca.innerHTML = tabs;

  const text = inputText.value;
  const species = sampleBox.value == -1 ? {}
    : parse_file(text, "species", parseInt(sampleBox.value));
  for (let i = 0; i < metric_list_true.length; i++) {
    const metric = metric_list_true[i];
    const ele = document.getElementById(`${title}-pills-${i}`);
    plot_pca(ele, pca_data["scatter"], species, metric);
  }


};

const update_hphm = () => {
  const text = inputText.value;
  const species = sampleBox.value == -1 ? {}
    : parse_file(text, "species", parseInt(sampleBox.value));
  plot_hphm(hphm, species)
}

const update_abundant = () => {
  const text = inputText.value;
  const ranks = ["phylum", "class", "order", "family", "genus", "species"];
  
  let sample;
  if (text === "") {
    sample = null;
  }
  else {
    sample = ranks.map(rank => (sampleBox.value == -1 ? {}
      : parse_file(text, rank, parseInt(sampleBox.value))));
  }
  plot_abundant(abundant, sample);
}

const update_sample_box = () => {
  sampleDiv.style.display = 'initial';

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

  // Make sure that there is a one to one correspondence between sample names and actual abundance columns
  const num_cols_per_line = text.split("\n").map((line) => line.split("\t").length).slice(0, -1);
  const num_cols = Math.min(... num_cols_per_line);

  for (let i = 0; i < Math.min(sample_names.length, num_cols - 1); i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = sample_names[i];
    sampleBox.add(opt);
  }

  // Make the first sample be selected by default
  sampleBox.value = sampleBox.options.length > 1 ? 0 : -1;

  if (Math.min(sample_names.length, num_cols - 1) <= 1) {
    sampleDiv.style.display = 'none';
    // sampleDiv.style.visibility = 'hidden';
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
    update_sample_box();
  };
};

inputText.oninput = (e) => {
    update_sample_box();
} 

clear_button.onclick = (e) => {
  inputText.value = "";
  inputFile.value = "";

  // Make drop down boxes go back to default
  const elements = document.getElementsByTagName('select');
  for (var i = 0; i < elements.length; i++) {
      elements[i].selectedIndex = 0;
  }

  update_sample_box();

  update_visuals()
};

const shit_file = () => {
  // Check if shit file
  const text = inputText.value;
  if (text === "") {
    alert("Please upload or paste MetaPhlAn output data first");
    return true;
  }

  const phylum = parse_file(text, "phylum", 0);
  if (JSON.stringify(phylum) === "{}") {
    if (text !== "") {
      alert("Input file/text is not valid MetaPhlAn output");
      return true;
    }
  }

  return false;
}

submit_button.onclick = (e) => {

  if (shit_file()) return;
  update_visuals();
};

ex_butt.onclick = () => {
  inputText.value = example;
  inputFile.value = "";
  update_sample_box();
};


// tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

export_button.onclick = () => {
  if (shit_file()) return;

  const text = inputText.value;
  const samples = [...Array(sampleBox.options.length - 1).keys()].map(idx => (
    parse_file(text, "species", idx)
  ));

  const gmhi_scores = samples.map(sample => indicies['GMHI'](sample));
  const richness = samples.map(sample => indicies['Richness'](sample));
  const evenness = samples.map(sample => indicies['Evenness'](sample));
  const shannon = samples.map(sample => indicies['Shannon'](sample));
  const inverse_simpson = samples.map(sample => indicies['Inverse Simpson'](sample));
  const sample_names = text.split("\n")[0].split("\t").slice(1);

  const output = [...Array(sampleBox.options.length - 1).keys()].map((
    i => `${sample_names[i]}, ${gmhi_scores[i]}, ${richness[i]}, ${evenness[i]}, ${shannon[i]}, ${inverse_simpson[i]}\n`
  ));
  output[0] = "Sample, GMHI, Richness, Evenness, Shannon, Inverse Simpson\n" + output[0];

  var blob = new Blob(output,
  { type: "text/plain;charset=utf-8" });
  let name = "gmhi_analysis.csv";
  if (sample_names.length === 1) name = sample_names[0];
  saveAs(blob, name);
}