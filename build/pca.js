import { gmwi_model, pca_data } from "./data.js";
import { get_export_svg_link, get_export_png_link } from "./utils.js";

export function plot_pca(ele, data, sample, metric) {
  ele.innerHTML = "";

  let projected;
  if (JSON.stringify(sample) === "{}") {
    projected = null;
  } else {
    // get feature vector
    const vector = get_vector(sample);

    // mean normalization
    const means = pca_data["means"];
    const normalized = math.subtract(vector, means);

    // project data
    const components = pca_data["components"];
    projected = math.multiply(normalized, components);
  }

  const color_arr = get_color_arr(metric);

  const scatter = Scatterplot(data, projected, color_arr, metric, {
    x: (d) => d[0],
    y: (d) => d[1],
    stroke: "steelblue",
    fill: "steelblue",
    width: 740,
    height: 600,
  });

  ele.appendChild(scatter);
  const caption = get_caption(metric, sample);
  ele.innerHTML += caption;
  const metric_to_name = {Phenotype : "Health-Status", Phenotype_all : "Phenotype"};
  let a = get_export_svg_link(`${metric}-pca`, scatter);
  ele.appendChild(a);
  ele.insertAdjacentHTML('beforeend', " ");
  a = get_export_png_link(`${metric}-pca`, ele);
  ele.appendChild(a);

  const phens = pca_data["meta"]["encodings"][metric];
  phens.push("Nonhealthy");

  // Hover effects
  for (const phen of phens) {
    d3.selectAll(`#${phen}_square-text`)
    .on("mouseover", function(){handle_mouseover(phen, phens)})
    .on("mouseout", function(){handle_mouseout(phen, phens)})
  }
}

const short_to_long = {
      "Nonhealthy" : "Nonhealthy",
      "Healthy" : "Healthy",
      'ACVD' : "Atherosclerotic cardiovascular disease",
      'AS' : "Ankylosing spondylitis",
      'CRC' : "Colorectal cancer", 
      'CD' : "Crohn's disease",
      'IGT' : "Impaired glucose tolerance",
      'LC' : "Leptomeningeal carcinomatosis",
      'NAFLD' : "Nonalcoholic fatty liver disease",
      'OB' : "Obesity",
      'OW' : "Overweight",
      'RA' : "Rheumatoid arthritis",
      'SA' : "Symptomatic atherosclerosis",
      'T2D' : "Type 2 diabetes",
      'UC': "Ulcerative colitis",
      'UW' : "Underweight",
      'AA' : "Advanced adenoma"
}

const handle_mouseover = (phen, phens) => {
    for (const p of phens) {
      if (p === phen) {
        d3.selectAll(`#${p}_dot`).attr("style", "opacity: 1;")
        d3.selectAll(`#${p}_long`).attr("style", "opacity: 1")
      }
      else {
        d3.selectAll(`#${p}_dot`).attr("style", "opacity: 0.1;")
        d3.selectAll(`#${p}_square`).attr("opacity", "0.5")
        d3.selectAll(`#${p}_square-text`).attr("opacity", "0.5");
      }
    }
}

const handle_mouseout = (phen, phens) => {
    for (const p of phens) {
      d3.selectAll(`#${p}_dot`).attr("style", "opacity: 0.8;")
      d3.selectAll(`#${p}_square`).attr("opacity", "1")
      d3.selectAll(`#${p}_square-text`).attr("opacity", "1");
      d3.selectAll(`#${p}_long`).attr("style", "opacity: 0")
    }
}

const get_vector = (species) => {
  const features = Array.from(gmwi_model["features"]);
  const vector = math.matrix(features.map((feat) => (feat in species ? 1 : 0)));
  return vector;
};

const get_caption = (metric, sample) => {
  const nonhealthy_color =
    metric === "Phenotype" ? "(orange)" : "(other colors)";
  let string = `<br/><br/><b>PCA. </b> Principal component analysis (PCA) of the gut microbiomes of 5026 healthy (blue) and nonhealthy ${nonhealthy_color} persons. `;
  if (JSON.stringify(sample) !== "{}") {
    string += " The input sample (teal) is projected and highlighted. ";
  }
  return string;
};

const get_color_arr = (metric) => {
  // const meta = pca_data["meta"][metric];
  if (metric === "Phenotype") {
    return ["orange", "steelblue"];
    // return (i) => (meta[i] === 1 ? "steelblue" : "orange");
  }

  if (metric === "Phenotype_all") {
    return [
      "rgb(231.0,229.0,0)",
      "rgb(174.0,199.0,232.0)",
      "rgb(255.0,127.0,14.0)",
      "rgb(44.0,160.0,44.0)",
      // "rgb(152.0,223.0,138.0)",
      "steelblue",
      "rgb(214.0,39.0,40.0)",
      "rgb(148.0,103.0,189.0)",
      "rgb(197.0,176.0,213.0)",
      "rgb(140.0,86.0,75.0)",
      "rgb(227.0,119.0,194.0)",
      "rgb(247.0,182.0,210.0)",
      "rgb(127.0,127.0,127.0)",
      "rgb(188.0,189.0,34.0)",
      "rgb(219.0,219.0,141.0)",
      "rgb(23.0,190.0,207.0)",
      "rgb(158.0,218.0,229.0)",
    ];
  }

  // const min = Math.min(pca_data["meta"][metric]);
  // const max = Math.max(pca_data["meta"][metric]);
};

function Scatterplot(
  data,
  sample,
  color_arr,
  metric,
  {
    x = ([x]) => x, // given d in data, returns the (quantitative) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    r = 3, // (fixed) radius of dots, in pixels
    title, // given d in data, returns the title
    marginTop = 20, // top margin, in pixels
    marginRight = 130, // right margin, in pixels
    marginBottom = 40, // bottom margin, in pixels
    marginLeft = 60, // left margin, in pixels
    inset = r * 2, // inset the default range, in pixels
    insetTop = inset, // inset the default y-range
    insetRight = inset, // inset the default x-range
    insetBottom = inset, // inset the default y-range
    insetLeft = inset, // inset the default x-range
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = d3.scaleLinear, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft + insetLeft, width - marginRight - insetRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom - insetBottom, marginTop + insetTop], // [bottom, top]
    xLabel, // a label for the x-axis
    yLabel, // a label for the y-axis
    xFormat, // a format specifier string for the x-axis
    yFormat, // a format specifier string for the y-axis
    fill = "none", // fill color for dots
    stroke = "currentColor", // stroke color for the dots
    strokeWidth = 1.5, // stroke width for dots
    halo = "#fff", // color of label halo
    haloWidth = 3, // padding around the labels
  } = {}
) {
  const meta = pca_data["meta"][metric];
  const encoding = pca_data["meta"]["encodings"][metric];

  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const T = title == null ? null : d3.map(data, title);
  const I = d3.range(X.length).filter((i) => !isNaN(X[i]) && !isNaN(Y[i]));

  // Compute default domains.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = d3.extent(Y);
  xDomain = [xDomain[0] - 0.2, xDomain[1] + 0.2];
  yDomain = [yDomain[0] - 0.2, yDomain[1] + 0.2];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
  const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("id", `pca-${metric}`)


  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("y2", marginTop + marginBottom - height)
        .attr("stroke-opacity", 0.1)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", width)
        .attr("y", marginBottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(xLabel)
    );

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(yAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(yLabel)
    );


  svg
    .append("g")
    .selectAll("circle")
    .data(I)
    .join("circle")
    .attr("fill", (i) => color_arr[meta[i]])
    .style("opacity", 0.8)
    .attr("cx", (i) => xScale(X[i]))
    .attr("cy", (i) => yScale(Y[i]))
    .attr("r", r)
    .attr("id", (i) => `${encoding[meta[i]]}_dot`);

  if (sample !== null) {
    const cx = xScale(sample._data[0]);
    const cy = yScale(sample._data[1]);

    svg
      .append("g")
      .attr("fill", "rgb(8,232,222)")
      .style("opacity", 1)
      .selectAll("circle")
      .data([0])
      .join("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r * 3);
  }

  // border box
  svg
    .append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("height", height - marginTop - marginBottom)
    .attr("width", width - marginLeft - marginRight)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 1);

  // add x label
  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", marginLeft + (width - marginLeft - marginRight) / 2)
    .attr("y", height - 5)
    .text("PC1 (8.78%)");

  // add y label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2)
    .attr("y", 20)
    .text("PC2 (6.41%)")
    .attr("transform", function (d) {
      return "rotate(-90)";
    });

  // add legend

  const x_start = width - marginRight + 30;
  const y_start = marginTop + 100;

  const space = 20;
  const size = 10;

  for (let i = 0; i < color_arr.length; i++) {
    const x = x_start;
    const y = y_start + i * space;
    svg
      .append("rect")
      .attr("x", x - size)
      .attr("y", y - 0.5 * size)
      .attr("width", size)
      .attr("height", size)
      .style("fill", color_arr[i])
      .style("stroke", "black")
      .style("stroke-width", 1)
      .attr("id", `${encoding[i]}_square`);


    const text = encoding[i];
    svg
      .append("text")
      .attr("x", x + 10)
      .attr("y", y + 2)
      .text(text)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .attr("id", `${encoding[i]}_square-text`);

    svg
      .append("text")
      .attr("x", 100)
      .attr("y", 50)
      .text(short_to_long[text])
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .attr("opacity", 0)
      .attr("id", `${text}_long`);
  }

  if (sample !== null) {
    const x = x_start;
    const y = y_start - space;
    svg
      .append("circle")
      .attr("cx", x - 5)
      .attr("cy", y)
      .attr("r", r * 3)
      .style("fill", "rgb(8,232,222)");
    const text = "Input Sample";
    svg
      .append("text")
      .attr("x", x + 10)
      .attr("y", y + 2)
      .text(text)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }

  return svg.node();
}
