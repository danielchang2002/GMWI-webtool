export function plot_abundant(ele, sample) {
  const empty = sample === null;
  const ranks = ["phylum", "class", "order", "family", "genus", "species"];

  ele.innerHTML = (
  `<table>
    <tbody>
      <tr>
        <th scope="col">Rank</th>
        <th scope="col">Most Abundant Taxon</th>
        <th scope="col">Relative Abundance</th>
      </tr>
        ${(ranks.map((rank, idx) => get_row(rank, sample, idx, empty))).join("")}
    </tbody>
  </table>`
  );

  let caption = `<br/><br/><b>Most Abundant Taxa.</b> The input sample's most abundant taxa at each taxonomic rank.`
  ele.innerHTML += caption;

}

const get_row = (rank, sample, idx, empty) => {
  if (empty) {
    return (`
        <th scope="row" style="black">${toTitleCase(rank)}</th>
        <td>-</td>
        <td>-</td>
        </tr>`
    );
  }
  const level = sample[idx];
  const level_sorted = Object.keys(level).map(ele => [ele, level[ele]])
  level_sorted.sort((a, b) => b[1] - a[1]);
  const most_abundant = level_sorted[0];
  return (
      `<tr>
        <th scope="row" style="black">${toTitleCase(rank)}</th>
        <td>${most_abundant[0].split(/\w__/)[1].replace("_", " ")}</td>
        <td>${(most_abundant[1] * 100).toFixed(3) + "%"}</td>
      </tr>`
  );
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