import { colors } from "./data.js";

export function plot_histogram(ele, score, data, index, pop, perc) {
  const label = {
    GMHI: "Gut Microbiome Health Index (GMHI)",
    Shannon: "Shannon Diversity Index",
    Richness: "Species Richness",
    Evenness: "Species Evenness",
    "Inverse Simpson": "Inverse Simpson Diversity",
  };
  ele.innerHTML = "";
  const hist = Histogram(data, score, {
    xLabel: label[index],
  });
  ele.appendChild(hist);
  const num = { healthy: 2754, nonhealthy: 2272, all: 5026 };
  const popDesc = `${num[pop]} ${
    pop == "all" ? "healthy and nonhealthy" : pop
  } patients.`;
  let string = `<br/><br/><b>Figure 1. </b> ${label[index]} scores of the gut microbiomes of ${popDesc}`;
  if (score != null) {
    string += ` The input sample has a ${label[index]} score of ${score} (highlighted bin), and is in the ${perc} <sup>th</sup> percentile of a population of ${popDesc}`;
  }
  ele.innerHTML += string;
}

function Histogram(
  data,
  score, // index score
  {
    value = (d) => d, // convenience alias for x
    domain, // convenience alias for xDomain
    label, // convenience alias for xLabel
    format, // convenience alias for xFormat
    type = d3.scaleLinear, // convenience alias for xType
    x = value, // given d in data, returns the (quantitative) x-value
    y = () => 1, // given d in data, returns the (quantitative) weight
    thresholds = 40, // approximate number of bins to generate, or threshold function
    marginTop = 10, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 50, // bottom margin, in pixels
    marginLeft = 60, // left margin, in pixels
    width = 640, // outer width of chart, in pixels
    height = 400, // outer height of chart, in pixels
    insetLeft = 0, // inset left edge of bar
    insetRight = 0.5, // inset right edge of bar
    xType = type, // type of x-scale
    xDomain = domain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    xLabel = "score", // a label for the x-axis
    xFormat = format, // a format specifier string for the x-axis
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yLabel = "Patient Count", // a label for the y-axis
    yFormat, // a format specifier string for the y-axis
    color = "currentColor", // bar fill color
  } = {}
) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);

  // Compute bins.
  const bins = d3
    .bin()
    .thresholds(thresholds)
    .value((i) => X[i])(I);

  // Compute default domains.
  if (xDomain === undefined) xDomain = [bins[0].x0, bins[bins.length - 1].x1];
  if (yDomain === undefined)
    yDomain = [0, 1.2 * d3.max(bins, (I) => d3.sum(I, (i) => Y[i]))];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(width / 80, xFormat)
    .tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  yFormat = yScale.tickFormat(100, yFormat);

  const svg = d3
    .create("svg")
    // .attr("width", width)
    // .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

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
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
        .style("stroke-dasharray", "3, 3")
    );

  svg
    .append("g")
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (d) => xScale(d.x0) + insetLeft)
    .attr("fill", (data) => {
      if (score != null && data.x0 <= score && score < data.x1) {
        return "rgb(64,224,208)";
      }
      const distance_from_left =
        (data.x0 - xDomain[0]) / (xDomain[1] - xDomain[0]);
      const color = colors[Math.round(distance_from_left * 50)];
      return `rgb(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255})`;
    })
    .attr("width", (d) =>
      Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetLeft)
    )
    .attr("stroke", "black")
    .attr("y", (d) => yScale(d3.sum(d, (i) => Y[i])))
    .attr("height", (d) => yScale(0) - yScale(d3.sum(d, (i) => Y[i])))
    .append("title")
    .text((d, i) =>
      [`${d.x0} ≤ x < ${d.x1}`, yFormat(d3.sum(d, (i) => Y[i]))].join("\n")
    );

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .style("font-family", "latin-modern");

  // add x label
  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .text(xLabel);

  // add y label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2)
    .attr("y", 20)
    .text(yLabel)
    .attr("transform", function (d) {
      return "rotate(-90)";
    });

  // add border box
  svg
    .append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("height", height - marginTop - marginBottom)
    .attr("width", width - marginLeft - marginRight)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 1);

  // add title
  // svg
  //   .append("text")
  //   .attr("class", "title")
  //   .attr("text-anchor", "middle")
  //   .attr("x", width / 2)
  //   .attr("y", marginTop / 2)
  //   .text(title);

  return svg.node();
}
