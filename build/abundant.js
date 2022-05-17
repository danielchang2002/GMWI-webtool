import {percentiles} from "./data.js"


export function plot_abundant(ele, sample) {
  const empty = sample === null || JSON.stringify(sample[0]) === "{}";
  const ranks = ["phylum", "class", "order", "family", "genus", "species"];

  ele.innerHTML = (
  `<table>
    <tbody>
      <tr>
        <th scope="col">Rank</th>
        <th scope="col">Most Abundant Taxon</th>
        <th scope="col">Relative Abundance</th>
        <th scope="col">Percentile (Healthy)</th>
        <th scope="col">Percentile (Nonhealthy)</th>
        <th scope="col">Percentile (All)</th>
      </tr>
        ${(ranks.map((rank, idx) => get_row(rank, sample, idx, empty))).join("")}
    </tbody>
  </table>`
  );

  let caption = `<br/><br/><b>Most Abundant Taxa.</b> The input sample's most abundant taxon at each taxonomic rank.`
  ele.innerHTML += caption;

}

function get_row(rank, sample, idx, empty) {
  if (empty) {
    return (`
        <th scope="row" style="black">${toTitleCase(rank)}</th>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        </tr>`
    );
  }

  // sort the taxonomic level by abundance
  const level = sample[idx];
  const level_sorted = Object.keys(level).map(ele => [ele, level[ele]])
  level_sorted.sort((a, b) => b[1] - a[1]);

  // Get the most abundant taxon
  const most_abundant = level_sorted[0];
  const name = most_abundant[0];
  const abundance = most_abundant[1];

  // Get the percentile
  const perc_h = get_perc(percentiles[name]['h'], abundance);
  const perc_n = get_perc(percentiles[name]['n'], abundance);
  const perc_a = get_perc(percentiles[name]['a'], abundance);

  return (
      `<tr>
        <th scope="row" style="black">${toTitleCase(rank)}</th>
        <td>${name.split(/\w__/)[1].replace("_", " ")}</td>
        <td>${(abundance * 100).toFixed(3) + "%"}</td>
        <td>${`${perc_h}<sup>th<sup>`}</td>
        <td>${`${perc_n}<sup>th<sup>`}</td>
        <td>${`${perc_a}<sup>th<sup>`}</td>
      </tr>`
  );
}

const get_perc = (percs, abundance) => {
  let perc;
  let first_larger_idx = 0;
  while (first_larger_idx <= 10 && percs[first_larger_idx] <= abundance) {
    first_larger_idx++;
  }

  if (first_larger_idx === 0) {return 0;}
  if (first_larger_idx === 11) {return 100;}

  const dist = (abundance - percs[first_larger_idx - 1]) / (percs[first_larger_idx] - percs[first_larger_idx - 1]);
  perc = 10 * (first_larger_idx - 1) + dist * 10;
  return perc.toFixed(2);
}

// https://stackoverflow.com/a/196991/14772896
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}