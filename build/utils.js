import { indicies } from "./indicies.js";
import { index_data, gmhi_model } from "./data.js";

const next_rank = { k: "p", p: "c", c: "o", o: "f", f: "g", g: "s", s: "t" };
const get_filter_function = (rank) => (line) =>
  line.includes(rank.charAt(0) + "__") &&
  !line.includes(next_rank[rank.charAt(0)] + "__");
const get_taxon_extractor = (rank) => (line) =>
  new RegExp(String.raw`${rank.charAt(0)}__\w*`).exec(line)[0];

// text is the metaphlan file. rank is the taxonomic rank to be extracted
// returns an object where keys are taxons and values are abundances
export const parse_file = (text, rank) => {
  const list = text.split("\n");

  const filter_function = get_filter_function(rank);
  const filtered = list.filter(filter_function);

  const taxon_name = get_taxon_extractor(rank);
  const abundance = (line) => parseFloat(/(\d)+\.(\d)+/.exec(line)[0]) / 100;

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
  const obj = filtered.reduce(reducer, {});
  return obj;
};

export const get_table = (obj) => {
  const table =
    `
  <table class="table">
  <thead>
  <tr>
    <th scope="col">Index</th>
    <th scope="col">Score</th>
    <th scope="col">Unhealthy pct</th>
    <th scope="col">Healthy pct</th>
    <th scope="col">All pct</th>
  </tr>
  </thead>` +
    Object.keys(indicies).reduce((prev, curr) => {
      const score = indicies[curr](obj);
      const healthy = index_data[curr]["healthy"];
      const unhealthy = index_data[curr]["unhealthy"];
      const all = healthy.concat(unhealthy);
      return (
        prev +
        `
  <tr>
    <th scope="row">${curr}</th>
    <td>${score}</td>
    <td>${get_percentile(unhealthy, score)}</td>
    <td>${get_percentile(healthy, score)}</td>
    <td>${get_percentile(all, score)}</td>
  </tr>
  `
      );
    }, "") +
    "</table>";
  return table;
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