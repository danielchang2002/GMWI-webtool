import { gmhi_model } from "./data.js"

export function plot_hphm(ele, sample) {
  const hp = gmhi_model['health_abundant']
  const hm = gmhi_model['health_scarce']

  const empty = JSON.stringify(sample) === "{}";

  ele.innerHTML = (
  `<table>
    <tbody>
      <tr>
        <th scope="col">Species Name</th>
        <th scope="col">Presence</th>
        <th scope="col">Relative Abundance</th>
      </tr>
      ${get_rows(hp, sample, "green", empty)}
      ${get_rows(hm, sample, "#a00", empty)}
    </tbody>
  </table>`
  );

  const num_hp = Object.keys(sample).filter(ele => hp.has(ele)).length;
  const num_hm = Object.keys(sample).filter(ele => hm.has(ele)).length;
  let caption = `<br/><br/><b>GMHI Species. </b> Presence/absence of health prevalent (green) and health scarce (red) species.`
  if (!empty) {
    caption += ` The input sample has ${num_hp} health prevalent and ${num_hm} health scarce species.`
  }
  ele.innerHTML += caption;

}

const get_rows = (features, sample, color, empty) => Array.from(features).map(s => (
    `<tr>
      <th scope="row" style="color: ${color};">${s.split("s__")[1].replace("_", " ")}</th>
      <td>${empty ? "-" : (s in sample ? "✅" : "❌")}</td>
      <td>${empty ? "-" : (s in sample ? sample[s].toFixed(5) : 0)}</td>
    </tr>`
    )).join("")