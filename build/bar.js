import { get_export_svg_link, get_export_png_link } from "./utils.js";

export function plot_bar(ele, data, sample, rank) {
  ele.innerHTML = "";

  let xDomain = [data[0].pop];
  if (sample.length != 0) {
    xDomain = ["Input Sample"].concat(xDomain);
  }

  const [final_data, taxons] = preprocess(data, sample);

  const bar = StackedBarChart(final_data, rank, {
    x: (d) => d.pop,
    y: (d) => d.abundance,
    z: (d) => d.taxon,
    xDomain,
    zDomain: taxons,
    colors: d3.schemeSpectral[taxons.length],
    width: 740,
    height: 500,
  });

  ele.appendChild(bar);
  const caption = get_caption(data[0].pop, rank, sample);
  ele.innerHTML += caption;
  let a = get_export_svg_link(`${rank}-Stacked-bar`, bar);
  ele.appendChild(a);
  ele.insertAdjacentHTML('beforeend', " ");
  a = get_export_png_link(`${rank}-Stacked-bar`, ele);
  ele.appendChild(a);

  // hover events
  for (const tax of final_data.map((ele) => ele["taxon"])) {
    d3.selectAll(`#${rank}_${tax}_bar`)
      .on("mouseover", function () {
        handle_mouseover(tax, taxons, rank);
      })
      .on("mouseout", function () {
        handle_mouseout(tax, taxons, rank);
      });

    // d3.selectAll(`#${tax}_square`)
    // .on("mouseover", function(){handle_mouseover(tax, taxons)})
    // .on("mouseout", function(){handle_mouseout(tax, taxons)});

    d3.selectAll(`#${rank}_${tax}_square-text`)
      .on("mouseover", function () {
        handle_mouseover(tax, taxons, rank);
      })
      .on("mouseout", function () {
        handle_mouseout(tax, taxons, rank);
      });
  }
}

const preprocess = (data, sample) => {
  let final_data;
  let taxons;
  if (sample.length == 0) {
    const data_copy = [...data];
    data_copy.sort(sort_func);

    const num_taxons = Math.min(10, data_copy.length);
    const reduced_data = data_copy.slice(0, num_taxons);

    taxons = reduced_data.map((ele) => ele.taxon);

    const data_sum = reduced_data.reduce(
      (prev, curr) => prev + curr.abundance,
      0
    );

    const reduced_data_filled = [
      ...reduced_data,
      { pop: reduced_data[0].pop, taxon: `Others`, abundance: 1 - data_sum },
    ];

    final_data = reduced_data_filled;
    taxons = taxons.concat(["Others"]);
  } else {
    const data_copy = [...data];
    const sample_copy = [...sample];
    data_copy.sort(sort_func);
    sample_copy.sort(sort_func);

    // get the 10 most abundant taxons from the sample
    const num_taxons = Math.min(10, sample_copy.length);
    const reduced_sample = sample_copy.slice(0, num_taxons);

    // retrieve those same taxons from the dataset (average)
    taxons = reduced_sample.map((ele) => ele.taxon);
    let reduced_data = data_copy.filter((ele) => taxons.includes(ele.taxon));
    const reduced_data_taxons = reduced_data.map((ele) => ele.taxon);

    // If dataset does not contain one of the taxons that the sample has
    // Add a dummy sample to dataset
    reduced_data = reduced_data.concat(
      taxons.filter((ele) => !reduced_data_taxons.includes(ele))
        .map((taxon) => ({pop : data_copy[0]["pop"], taxon, abundance : 0}))
    );

    // Add a dummy taxon, others, such that the sum of each column is 1
    const sample_sum = reduced_sample.reduce(
      (prev, curr) => prev + curr.abundance,
      0
    );
    const data_sum = reduced_data.reduce(
      (prev, curr) => prev + curr.abundance,
      0
    );

    const reduced_sample_filled = [
      ...reduced_sample,
      { pop: "Input Sample", taxon: "Others", abundance: 1 - sample_sum },
    ];
    const reduced_data_filled = [
      ...reduced_data,
      { pop: reduced_data[0].pop, taxon: "Others", abundance: 1 - data_sum },
    ];

    // Get the final dataset
    final_data = reduced_data_filled.concat(reduced_sample_filled);
    taxons = taxons.concat(["Others"]);
  }

  // Sort the taxons in alphabetical order (but "Others" is first)
  const alpha = (a, b) => {
    if (a === "Others") return 1;
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  }
  taxons.sort(alpha);

  return [final_data, taxons];
};

const handle_mouseover = (taxon, taxons, rank) => {
  // highlight taxon
  for (const tax of taxons) {
    if (tax !== taxon) {
      // d3.selectAll(`#${tax}_bar`).attr("opacity", "0.5")
      // d3.selectAll(`#${tax}_square`).attr("opacity", "0.5")
      d3.selectAll(`#${rank}_${tax}_bar`).attr("filter", "brightness(50%)");
      d3.selectAll(`#${rank}_${tax}_square`).attr("filter", "brightness(50%)");
      d3.selectAll(`#${rank}_${tax}_square-text`).attr("opacity", "0.5");
    }
  }
  d3.selectAll(`#${rank}_${taxon}_text`).attr("opacity", "1");
};

const handle_mouseout = (taxon, taxons, rank) => {
  // unhighlight taxon
  for (const tax of taxons) {
    // d3.selectAll(`#${tax}_bar`).attr("opacity", "1")
    // d3.selectAll(`#${tax}_square`).attr("opacity", "1")
    d3.selectAll(`#${rank}_${tax}_bar`).attr("filter", "brightness(100%)");
    d3.selectAll(`#${rank}_${tax}_square`).attr("filter", "brightness(100%)");
    d3.selectAll(`#${rank}_${tax}_square-text`).attr("opacity", "1");
  }
  d3.selectAll(`#${rank}_${taxon}_text`).attr("opacity", "0");
};

const get_caption = (pop, rank, sample) => {
  const desc = {
    "Average Healthy": "2754 healthy",
    "Average Nonhealthy": "2272 nonhealthy",
    Average: "5026 healthy and nonhealthy",
  };
  let string;
  const figname = "Taxonomic Distribution";
  if (sample.length == 0) {
    string = `<br/><br/><b>${figname}. </b> Distribution of the average relative abundances of the gut microbes of ${desc[pop]} persons at the ${rank} level. `;
  } else {
    string = `<br/><br/><b>${figname}. </b> Distribution of the relative abundances of the input sample microbes (left) and average relative abundances of the gut microbes of ${desc[pop]} persons (right) at the ${rank} level. `;
  }
  return string;
};

const sort_func = function (a, b) {
  const keyA = a.abundance;
  const keyB = b.abundance;
  if (keyA < keyB) return 1;
  if (keyA > keyB) return -1;
  return 0;
};

function StackedBarChart(
  data,
  rank,
  {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = (d) => d, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    marginTop = 30, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 70, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 500, // outer height, in pixels
    xDomain, // array of x-values
    // xRange = [marginLeft, width - marginRight], // [left, right]
    xPadding = 0.05, // amount of x-range to reserve to separate bars
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    zDomain, // array of z-values
    offset = d3.stackOffsetDiverging, // stack offset method
    order = d3.stackOrderNone, // stack order method
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors
  } = {}
) {
  const graph_width = 0.5 * width;
  const xRange = [marginLeft, graph_width - marginRight]; // [left, right]

  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);

  // Compute default x- and z-domains, and unique them.
  if (xDomain === undefined) xDomain = X;
  if (zDomain === undefined) zDomain = Z;
  xDomain = new d3.InternSet(xDomain);
  const taxons = zDomain;
  zDomain = new d3.InternSet(zDomain);

  // Omit any data not present in the x- and z-domains.
  const I = d3
    .range(X.length)
    .filter((i) => xDomain.has(X[i]) && zDomain.has(Z[i]));

  // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
  // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
  // each tuple has an i (index) property so that we can refer back to the
  // original data point (data[i]). This code assumes that there is only one
  // data point for a given unique x- and z-value.
  const series = d3
    .stack()
    .keys(zDomain)
    .value(([x, I], z) => Y[I.get(z)])
    .order(order)
    .offset(offset)(
      d3.rollup(
        I,
        ([i]) => i,
        (i) => X[i],
        (i) => Z[i]
      )
    )
    .map((s) => s.map((d) => Object.assign(d, { i: d.data[1].get(s.key) })));

  // Compute the default y-domain. Note: diverging stacks can be negative.
  // if (yDomain === undefined) yDomain = d3.extent(series.flat(2));
  yDomain = [0, 1];

  // Construct scales, axes, and formats.
  const xScale = d3
    .scaleBand(xDomain, xRange)
    .paddingInner(xPadding)
    .paddingOuter(xPadding);
  const yScale = yType(yDomain, yRange);
  const color = d3.scaleOrdinal(zDomain, colors);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 60, d3.format(",%"));

  // Compute titles.
  if (title === undefined) {
    const formatValue = yScale.tickFormat(100, yFormat);
    title = (i) => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
  } else {
    const O = d3.map(data, (d) => d);
    const T = title;
    title = (i) => T(O[i], i, data);
  }

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("id", `bar-${rank}`);

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(yAxis)
    .style("font-family", "latin-modern")
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", graph_width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
    )
    .style("stroke-dasharray", "3, 3");

  const bar = svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", ([{ i }]) => color(Z[i]))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", ({ i }) => xScale(X[i]))
    .attr("y", ([y1, y2]) => Math.min(yScale(y1), yScale(y2)))
    .attr("height", ([y1, y2]) => Math.abs(yScale(y1) - yScale(y2)))
    .attr("width", xScale.bandwidth())
    .attr("id", ({ i }) => `${rank}_${data[i]["taxon"]}_bar`);

  if (title) bar.append("title").text(({ i }) => title(i));

  svg
    .append("g")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(xAxis)
    .style("font-family", "latin-modern")
    .style("font-size", "1em");

  // border box
  svg
    .append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("height", height - marginTop - marginBottom)
    .attr("width", graph_width - marginLeft - marginRight)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 1);

  // y label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2)
    .attr("y", 20)
    .text("Relative Abundance")
    .attr("transform", function (d) {
      return "rotate(-90)";
    });

  const x_start = graph_width + 50;
  const y_start = 100;
  const space = 20;
  const size = 10;

  svg
    .append("text")
    .attr("x", x_start - 10)
    .attr("y", y_start - 30)
    .text(rank[0].toUpperCase() + rank.slice(1))
    .style("font-size", "20px")
    .attr("font-weight", "900")
    .attr("alignment-baseline", "middle")

  for (let i = taxons.length - 1; i >= 0; i--) {
    const x = x_start;
    const y = y_start + (taxons.length - 1 - i) * space;

    // color square
    svg
      .append("rect")
      .attr("x", x - size)
      .attr("y", y - 0.5 * size)
      .attr("width", size)
      .attr("height", size)
      .style("fill", colors[i])
      .style("stroke", "black")
      .style("stroke-width", 1)
      .attr("id", `${rank}_${taxons[i]}_square`);

    const text =
      taxons[i] != "Others" ? taxons[i].slice(3, taxons[i].length) : "Others";
    svg
      .append("text")
      .attr("x", x + 10)
      .attr("y", y + 2)
      .text(text)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .attr("id", `${rank}_${taxons[i]}_square-text`);

    const x_tool = x;
    const y_tool = y_start + (1.2 * taxons.length - 1) * space + 20;

    // tooltip

    const average = data.filter(
      (ele) => ele["pop"] !== "Sample" && ele["taxon"] == taxons[i]
    );

    const average_text = `${average[0]["pop"]}: ${(
      average[0]["abundance"] * 100
    ).toFixed(2)}%`;

    svg
      .append("text")
      .attr("x", x_tool)
      .attr("y", y_tool)
      .text(average_text)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .attr("opacity", "0")
      .attr("id", `${rank}_${taxons[i]}_text`);

    const sample = data.filter(
      (ele) => ele["pop"] === "Input Sample" && ele["taxon"] == taxons[i]
    );

    if (sample.length === 0) {
      continue;
    }

    const sample_text = `Input Sample: ${(sample[0]["abundance"] * 100).toFixed(2)}%`;

    svg
      .append("text")
      .attr("x", x_tool)
      .attr("y", y_tool + 20)
      .text(sample_text)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .attr("opacity", "0")
      .attr("id", `${rank}_${taxons[i]}_text`);
  }

  return Object.assign(svg.node(), { scales: { color } });
}
