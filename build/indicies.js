import { gmwi_model } from "./data.js";

const get_inv_simpsons = (obj) =>
  (
    1 / Object.keys(obj).reduce((prev, curr) => prev + obj[curr] * obj[curr], 0)
  ).toFixed(2);

const get_shannon_precise = (obj) =>
  Object.keys(obj)
    .reduce((prev, curr) => prev - obj[curr] * Math.log(obj[curr]), 0)

const get_shannon = (obj) =>
  get_shannon_precise(obj)
    .toFixed(2);

const get_richness = (obj) => Object.keys(obj).length;

const get_evenness = (obj) => (get_shannon_precise(obj) / Math.log(313)).toFixed(4);

const get_gmwi = (obj) => {
  const psi_mh = psi(obj, gmwi_model["health_abundant"]);
  const psi_mn = psi(obj, gmwi_model["health_scarce"]);
  return Math.log10(psi_mh / psi_mn).toFixed(4);
};

const psi = (sample, set) => {
  const new_obj = get_reduced(sample, set);
  return (get_richness(new_obj) / set.size) * get_shannon_precise(new_obj) + 0.00001;
};

const get_reduced = (sample, set) =>
  Object.keys(sample).reduce((prev, curr) => {
    if (!set.has(curr)) {
      return { ...prev };
    }
    return { ...prev, [curr]: sample[curr] };
  }, {});

export const indicies = {
  GMWI: get_gmwi,
  Richness: get_richness,
  Evenness: get_evenness,
  Shannon: get_shannon,
  "Inverse Simpson": get_inv_simpsons,
};
