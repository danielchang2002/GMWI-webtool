import { gmhi_model } from "./data.js";

export const gmhi_score = (obj) => {
  const psi_mh = psi(obj, gmhi_model["health_abundant"]);
  const psi_mn = psi(obj, gmhi_model["health_scarce"]);
  return Math.log10(psi_mh / psi_mn).toFixed(4);
};

const psi = (sample, known) => {
  let richness = 0;
  let shannon = 0;
  const num = known.length;
  for (let i = 0; i < num; i++) {
    const species = known[i];
    if (species in sample) {
      richness++;
      const ab = sample[species];
      shannon -= ab * Math.log(ab);
    }
  }
  // shannon = 1;
  return (richness / num) * shannon + 0.00001;
};
