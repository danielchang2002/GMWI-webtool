import { gmhi_score } from "./gmhi.js ";
import { features } from "./data/features.js";
import { dict as gmhi_dict } from "./data/gmhi_scores.js";
import { dict as richness_dict } from "./data/richness.js";
import { dict as shannon_dict } from "./data/shannon.js";
import { dict as simp_dict } from "./data/inverse_simpson.js";

export const parse_file = (text, rank) => {
  const list = text.split("\n");
  const filter_functions = {
    species: (line) => line.includes("s__") && !line.includes("t__"),
    phylum: (line) => line.includes("p__") && !line.includes("c__"),
    class: (line) => line.includes("c__") && !line.includes("o__"),
  };
  const filtered = list.filter(filter_functions[rank]);

  const taxon_extractors = {
    species: (line) => /s__(\w)*/.exec(line)[0],
    phylum: (line) => /p__(\w)*/.exec(line)[0],
    class: (line) => /c__(\w)*/.exec(line)[0],
  };

  const taxon_name = taxon_extractors[rank];
  const abundance = (line) => parseFloat(/(\d)+\.(\d)+/.exec(line)[0]) / 100;

  const min_val = 0.00001;
  const reducer = (prev, curr) => {
    const name = taxon_name(curr);
    const ab = abundance(curr);
    if (ab < min_val || !features.has(name)) {
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

export const get_inv_simpsons = (obj) =>
  (
    1 / Object.keys(obj).reduce((prev, curr) => prev + obj[curr] * obj[curr], 0)
  ).toFixed(2);

export const get_shannon = (obj) =>
  Object.keys(obj)
    .reduce((prev, curr) => prev - obj[curr] * Math.log(obj[curr]), 0)
    .toFixed(2);

export const get_richness = (obj) => Object.keys(obj).length;

const indicies = {
  GMHI: { function: gmhi_score, data: gmhi_dict },
  Shannon: { function: get_shannon, data: shannon_dict },
  Richness: { function: get_richness, data: richness_dict },
  "Inverse Simpson": { function: get_inv_simpsons, data: simp_dict },
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
      const score = indicies[curr]["function"](obj);
      return (
        prev +
        `
  <tr>
    <th scope="row">${curr}</th>
    <td>${score}</td>
    <td>${get_percentile(indicies[curr]["data"]["unhealthy"], score)}</td>
    <td>${get_percentile(indicies[curr]["data"]["healthy"], score)}</td>
    <td>${get_percentile(indicies[curr]["data"]["all"], score)}</td>
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
