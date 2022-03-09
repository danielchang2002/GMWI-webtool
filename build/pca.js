import { gmhi_model, pca_data } from "./data.js";

export function plot_pca(ele, data, sample, metric) {
  ele.innerHTML = "";

  let projected;
  if (JSON.stringify(sample) === "{}") {
    projected = null;
  }
  else {
    // get feature vector
    const vector = get_vector(sample);

    // mean normalization
    const means = pca_data["means"];
    const normalized = math.subtract(vector, means);

    // project data
    const components = pca_data["components"];
    projected = math.multiply(normalized, components)
  }

  const scatter = Scatterplot(data, projected, metric, {
    x: d => d[0],
    y: d => d[1],
    stroke: "steelblue",
    fill: "steelblue",
    width: 640,
    height: 600
  })

  ele.appendChild(scatter)
  const caption = get_caption(metric, sample);
  ele.innerHTML += caption;
}

const get_vector = (species) => {
  const features = Array.from(gmhi_model["features"]);
  const vector = math.matrix(features.map(feat => 
    feat in species ? 1 : 0
  ));
  return vector;
}

const get_caption = (metric, sample) => {
  let string;
  if (JSON.stringify(sample) === "{}") {
    string = `<br/><br/><b>Figure 3. </b> Principal component analysis (PCA) `
  }
  else {
    string = `<br/><br/><b>Figure 3. </b> Principal component analysis (PCA) `
  }
  return string;

};

const get_color = (i, metric) => {
  return pca_data["meta"]["Phenotype"][i] === 1 ? "steelblue" : "orange";
}

function Scatterplot(data, sample, metric, {
  x = ([x]) => x, // given d in data, returns the (quantitative) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  r = 3, // (fixed) radius of dots, in pixels
  title, // given d in data, returns the title
  marginTop = 20, // top margin, in pixels
  marginRight = 30, // right margin, in pixels
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
  haloWidth = 3 // padding around the labels
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const T = title == null ? null : d3.map(data, title);
  const I = d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]));

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

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("y2", marginTop + marginBottom - height)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text(xLabel));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  // if (T) svg.append("g")
  //     .attr("font-family", "sans-serif")
  //     .attr("font-size", 10)
  //     .attr("stroke-linejoin", "round")
  //     .attr("stroke-linecap", "round")
  //   .selectAll("text")
  //   .data(I)
  //   .join("text")
  //     .attr("dx", 7)
  //     .attr("dy", "0.35em")
  //     .attr("x", i => xScale(X[i]))
  //     .attr("y", i => yScale(Y[i]))
  //     .text(i => T[i])
  //     .call(text => text.clone(true))
  //     .attr("fill", "none")
  //     .attr("stroke", halo)
  //     .attr("stroke-width", haloWidth);

  svg.append("g")
    .selectAll("circle")
    .data(I)
    .join("circle")
      .attr("fill", i => get_color(i, metric))
      .style("opacity", 0.8)
      .attr("cx", i => xScale(X[i]))
      .attr("cy", i => yScale(Y[i]))
      .attr("r", r);


  if (sample !== null) svg.append("g")
      // .attr("fill", "rgb(8,232,222)")
      .attr("fill", "red")
      .style("opacity", 1)
      // .attr("stroke", "red")
      // .attr("stroke-width", strokeWidth)
    .selectAll("circle")
      .data([0])
    .join("circle")
      .attr("cx", i => xScale(sample._data[0]))
      .attr("cy", i => yScale(sample._data[1]))
      .attr("r", r * 3);

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

  return svg.node();
}