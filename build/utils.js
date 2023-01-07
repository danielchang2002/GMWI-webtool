import { indicies } from "./indicies.js";
import { index_data, gmwi_model } from "./data.js";

export function get_export_svg_link(name, svg) {
  const a = document.createElement('a');
  a.setAttribute("href", "#!");
  a.innerText = "Export as .svg";

  a.onclick = () => {
    console.log("hi");
    const b = get_svg_blob(svg);
    saveAs(b, name + ".svg");
  }
  return a;
}

export function get_export_png_link(name, ele) {
  const a = document.createElement('a');
  a.setAttribute("href", "#!");
  a.innerText = "Export as .png";

  a.onclick = () => {
    export_plot(a, ele, name)
  }
  return a;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function export_plot(self, ele, name) {
  for (const ele of document.querySelectorAll("*")) {
    ele.classList.add("wait");
  }
  // self.innerText = "Exporting..."
  console.log("done setting css");
  await sleep(100);
  console.log("done sleeping");
  console.log("Start export");
  const start = performance.now();
  const pca = document.getElementById("pca");
  const isPCA = pca.contains(ele);
  html2canvas(ele, {scale : 8,
    ignoreElements : function(element) {
      const ignore = !isPCA && (element.id == pca || pca.contains(element));
      return ignore;
      // const ignore = element.id !== ele.id && !ele.contains(element) && !element.contains(ele);
      // return ignore;
    },
    onclone : function(doc) {
      const eles = doc.getElementsByTagName("a");
      for (const e of eles) {
        e.innerHTML = "";
      }
    }  
  }).then(
    function(canvas) {
      console.log("Finished canvas conversion");
      const w = canvas.width;
      const h = canvas.height;
      const img = canvas.toBlob(function(blob){
        saveAs(blob, name + ".png");
        for (const ele of document.querySelectorAll("*")) {
          ele.classList.remove("wait");
        }
        // self.innerText = "Export me!"
      });
  })
}

export const get_svg_blob = (svgEl) => {
  // svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.innerHTML;
  var head = '<svg title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">';

  const style = `<style> .footer {
    color: #ccc;
    /* position: fixed; */
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
  }
  
  #sideButton {
    position: sticky !important;
    top: 0 !important;
  }
  
  .tick {
    font-family : "Latin Modern" !important;
  }
  
  .bottom-link {
    color: inherit;
  }
  
  .hide {
    z-index: -5;
  }
  
  .btn-close {
    margin-right: 10px;
    margin-top: 10px;
  }
  
  red {
    color: #a00 !important;
  }
  
  #example {
    color: #a00 !important;
    text-decoration: underline;
  }
  
  * {
    box-shadow: none !important;
  }
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  *::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  * {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  header {
    margin-bottom: 100px;
  }
  
  .setting {
    margin-bottom: 80px;
  }
  
  .fig {
    margin-bottom: 150px;
  }
  
  /* latex font */
  
  @font-face {
    font-family: "Latin Modern";
    font-style: normal;
    font-weight: normal;
    font-display: swap;
    src: url("https://raw.githubusercontent.com/vincentdoerig/latex-css/master/fonts/LM-regular.woff2")
        format("woff2"),
      url("https://raw.githubusercontent.com/vincentdoerig/latex-css/master/fonts/LM-regular.woff")
        format("woff"),
      url("https://raw.githubusercontent.com/vincentdoerig/latex-css/master/fonts/LM-regular.ttf")
        format("truetype");
  }
  
  @font-face {
    font-family: "Latin Modern";
    font-style: normal;
    font-weight: bold;
    font-display: swap;
    src: url("https://raw.githubusercontent.com/vincentdoerig/latex-css/master/fonts/LM-bold.woff2")
        format("woff2"),
      url("https://raw.githubusercontent.com/vincentdoerig/latex-css/master/fonts/LM-bold.woff")
        format("woff"),
      url("https://raw.githubusercontent.com/vincentdoerig/latex-css/master/fonts/LM-bold.ttf")
        format("truetype");
  }
  
  body {
    font-family: "Latin Modern", Georgia, Cambria, "Times New Roman", Times, serif;
    overscroll-behavior-y: none;
  }
  
  
  /* table stuff */
  
  /* Better tables */
  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: auto;
    max-width: 100%;
    border-top: 2.27px solid black;
    border-bottom: 2.27px solid black;
    /* display: block; */
    overflow-x: auto; /* does not work because element is not block */
    /* white-space: nowrap; */
    counter-increment: caption;
  }
  /* add bottom border on column table headings  */
  table tr > th[scope='col'] {
    border-bottom: 1.36px solid black;
  }
  /* add right border on row table headings  */
  table tr > th[scope='row'] {
    border-right: 1.36px solid black;
  }
  table > tbody > tr:first-child > td,
  table > tbody > tr:first-child > th {
    border-top: 1.36px solid black;
  }
  table > tbody > tr:last-child > td,
  table > tbody > tr:last-child > th {
    border-bottom: 1.36px solid black;
  }
  
  th,
  td {
    text-align: left;
    padding: 0.5rem;
    line-height: 1.1;
  }
  /* Table caption */
  caption {
    text-align: left;
    font-size: 0.923em;
    /* border-bottom: 2pt solid #000; */
    padding: 0 0.25em 0.25em;
    width: 100%;
    margin-left: 0;
  }
  
  caption::before {
    content: 'Table ' counter(caption) '. ';
    font-weight: bold;
  }
  
  /* allow scroll on the x-axis */
  .scroll-wrapper {
    overflow-x: auto;
  }
  
  /* if a table is wrapped in a scroll wrapper,
    the table cells shouldn't wrap */
  .scroll-wrapper > table td {
    white-space: nowrap;
  }
  
  td {
    text-align: center;
  }
  
  .carousel-control-prev {
    margin-left: -90px;
    margin-top: -100px;
  }
  
  .carousel-control-next {
    margin-right: -80px;
    margin-top: -100px;
  }
  
  header {
    border-radius: 25px;
    background-color: #E0FFFF; 
  }
  
  .grey {
    background-color : #f2f2f2;
  }
  
  text {
    font-family: "Latin Modern", Georgia, Cambria, "Times New Roman", Times, serif;
  }</style>`;

  var svgBlob = new Blob([head, style, svgData, "</svg>"], {type:"image/svg+xml;charset=utf-8"});
  return svgBlob;
}

export const get_tabs = (title, names, active) => {
  let carousel = `<ul class="nav nav-tabs mb-3 nav-justified justify-content-center" id="${title}-pills-tab" role="tablist">`

  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    name = name.replace(" ", "_");
    carousel += `
  <li class="nav-item" role="presentation">
    <button class="nav-link ${i === active ? "active" : ""}" id="${title}-pills-${i}-tab" data-bs-toggle="pill" data-bs-target="#${title}-pills-${i}" type="button" role="tab" aria-controls="${title}-pills-${i}" aria-selected="true">${name.replace("_", " ")}</button>
  </li>
  `;
  }
  carousel += `</ul> <div class="tab-content" id="pills-tabContent">`;

  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    name = name.replace(" ", "_");
    carousel += `<div class="tab-pane fade show ${i === active ? "active" : ""}" id="${title}-pills-${i}" role="tabpanel" aria-labelledby="${title}-pills-${i}-tab">${name}</div>`
  }
  carousel += "</div>";
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
  const abundance = (line) => parseFloat(line.split("\t")[idx + 1]) / 100;

  const min_val = 0.00001;
  const reducer = (prev, curr) => {
    const name = taxon_name(curr);
    const ab = abundance(curr);
    if (ab < min_val) {
      return { ...prev };
    }
    if (rank == "species" && !gmwi_model["features"].has(name)) {
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
  return Object.keys(taxons).map(key => ({pop : "Input Sample", taxon : key, abundance : taxons[key]}));
}