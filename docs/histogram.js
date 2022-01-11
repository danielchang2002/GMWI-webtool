import { dict } from "./data/gmhi_scores.js";
import { colors } from "./data/colors.js";

export function plot_histogram(score) {
  const ele = document.getElementById("d3-container");

  ele.innerHTML = "";

  const gmhi_scores = dict["all"];
  const hist = Histogram(gmhi_scores, score, {
    color: "steelblue",
    xLabel: "score",
  });
  ele.appendChild(hist);
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
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width of chart, in pixels
    height = 400, // outer height of chart, in pixels
    insetLeft = 0, // inset left edge of bar
    insetRight = 0.5, // inset right edge of bar
    xType = type, // type of x-scale
    xDomain = domain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    xLabel = label, // a label for the x-axis
    xFormat = format, // a format specifier string for the x-axis
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yLabel = "↑ Frequency", // a label for the y-axis
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
    yDomain = [0, d3.max(bins, (I) => d3.sum(I, (i) => Y[i]))];

  console.log(xDomain);
  console.log(yDomain);

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
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

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
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (d) => xScale(d.x0) + insetLeft)
    .attr("fill", (data) => {
      if (data.x0 <= score && score < data.x1) {
        return "rgb(64,224,208)";
      }
      const color = colors[Math.round((data.x0 + 5) * 5)];
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
    .call((g) =>
      g
        .append("text")
        .attr("x", width - marginRight)
        .attr("y", 27)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(xLabel)
    );

  return svg.node();
}
