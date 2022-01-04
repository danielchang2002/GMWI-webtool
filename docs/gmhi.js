import { health_abundant, health_scarce } from "./trainingResults.js";

export const getScore = (text) => {
  const obj = getObj(text);
  const psi_mh = psi(obj, health_abundant);
  const psi_mn = psi(obj, health_scarce);
  return Math.log10(psi_mh / psi_mn);
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

export const getObj = (text) => {
  const list = text.split("\n");
  const species = list.filter(
    (line) => line.includes("s__") && !line.includes("t__")
  );
  const species_name = (line) => /s__(\w)*/.exec(line)[0];
  const abundance = (line) => parseFloat(/(\d)+\.(\d)+/.exec(line)[0]) / 100;
  // const reducer = (prev, curr) => ({
  //   ...prev,
  //   [curr.split("|").pop().split("\t")[0]]:
  //     parseFloat(curr.split("\t")[2]) / 100,
  // });
  const reducer = (prev, curr) => ({
    ...prev,
    [species_name(curr)]: abundance(curr),
  });
  const obj = species.reduce(reducer, {});
  return obj;
};
