import { indicies } from "./indicies.js";
import { index_data, gmhi_model } from "./data.js";

export const get_tabs = (title, names) => {
  let carousel = `<ul class="nav nav-pills mb-3 nav-justified" id="${title}-pills-tab" role="tablist">`

  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    name = name.replace(" ", "_");
    carousel += `
  <li class="nav-item" role="presentation">
    <button class="nav-link ${i === 0 ? "active" : ""}" id="${title}-pills-${i}-tab" data-bs-toggle="pill" data-bs-target="#${title}-pills-${i}" type="button" role="tab" aria-controls="${title}-pills-${i}" aria-selected="true">${name.replace("_", " ")}</button>
  </li>
  `;
  }
  carousel += `</ul> <div class="tab-content" id="pills-tabContent">`;

  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    name = name.replace(" ", "_");
    carousel += `<div class="tab-pane fade show ${i === 0 ? "active" : ""}" id="${title}-pills-${i}" role="tabpanel" aria-labelledby="${title}-pills-${i}-tab">${name}</div>`
  }
  carousel += "</div>";
  return carousel;
}

export const get_carousel = (name, num_slides) => {
  let carousel = `<div id="${name}_carousel" class="carousel slide carousel-dark" data-bs-ride="carousel", data-bs-interval="false">
  <div class="carousel-inner">`;
  for (let i = 0; i < num_slides; i++) {
    carousel += `
    <div class="carousel-item ${i === 0 ? "active" : ""}" id="${name}_${i}">
      blank
    </div>`;
  }
  carousel += `
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#${name}_carousel" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#${name}_carousel" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>`;
  return carousel;
}

const next_rank = { k: "p", p: "c", c: "o", o: "f", f: "g", g: "s", s: "t" };
const get_filter_function = (rank) => (line) =>
  line.includes(rank.charAt(0) + "__") &&
  !line.includes(next_rank[rank.charAt(0)] + "__") && 
  true;

const get_taxon_extractor = (rank) => (line) =>
  new RegExp(String.raw`${rank.charAt(0)}__\w*`).exec(line)[0];

// text is the metaphlan file. rank is the taxonomic rank to be extracted
// returns an object where keys are taxons and values are abundances
export const parse_file = (text, rank, idx) => {
  const list = text.split("\n");

  const filter_function = get_filter_function(rank);
  const filtered = list.filter(filter_function);

  const taxon_name = get_taxon_extractor(rank);
  const abundance = (line) => parseFloat(line.match(/(\d)+\.(\d)+/g)[idx]) / 100;

  const min_val = 0.00001;
  const reducer = (prev, curr) => {
    const name = taxon_name(curr);
    const ab = abundance(curr);
    if (ab < min_val) {
      return { ...prev };
    }
    if (rank == "species" && !gmhi_model["features"].has(name)) {
      return { ...prev };
    }
    return {
      ...prev,
      [name]: ab,
    };
  };
  let obj = {};
  try {
    obj = filtered.reduce(reducer, {});
  } catch (error) {
    console.error(error);
  }
  return obj;
};

export const get_percentile = (values, score) =>
  (
    (100 * values.reduce((prev, curr) => prev + (score > curr ? 1 : 0), 0)) /
    values.length
  ).toFixed(2);

  // for sample
export const get_taxon_bar_list = (taxons) => {
  return Object.keys(taxons).map(key => ({pop : "Sample", taxon : key, abundance : taxons[key]}));
}