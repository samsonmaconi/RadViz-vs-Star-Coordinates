//Samson Maconi
//B00801169


const svgWidth = "1000";
const svgHeight = "600";
let root = d3.select("#main");
let DATASET = [];
let svg_radviz = d3.select("#main_rad").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
let svg_starviz = d3.select("#main_star").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
let renderRadviz, renderStarviz;

function onFIleInput() {
    let f = event.target.files[0]; // FileList object
    let reader = new FileReader();

    reader.onload = function (event) {
        load(event.target.result)
    };
    reader.readAsDataURL(f);
}

d3.select("#uploadFile")
    .on("change", onFIleInput);

// Set Control input listeners
d3.select("#adjustOpacity")
    .on("change", () => {
        renderRadviz();
        renderStarviz();
    });
d3.select("#encodeShape")
    .on("change", () => {
        renderRadviz();
        renderStarviz();
    });

load('data/winequality-red.csv');
function load(file) {
    d3.csv(file).then((result) => {

        if (!result) { alert("Invalid dataset"); return; }
        render(result);
    }).catch((err) => {
        console.log("Error: " + err);
    });
}

function render(data) {
    DATASET = data;
    renderRadviz = createRadVis(svg_radviz, 600, 600, DATASET);
    renderRadviz();
    renderStarviz = createStarVis(svg_starviz, 600, 600, DATASET);
    renderStarviz();
}

function createRadVis(svg, width, height, dataset) {
    let anchors = [];
    let categories = [];
    let classifications = [];
    let springConstants;
    let margins = { top: 60, bottom: 60, left: 60, right: 60 };
    let chartWidth = width - margins.left - margins.right;
    let chartHeight = height - margins.top - margins.bottom;
    let center = { x: chartWidth / 2, y: chartHeight / 2 };
    let radius = Math.min(center.x, center.y);

    svg.selectAll(".tooltip").remove()
    svg.selectAll(".chart-group").remove()
    svg.selectAll(".chartBorder-group").remove()
    svg.selectAll(".chartColumnLegend").remove()
    svg.selectAll(".chartClassificationLegend").remove()

    let tooltip = root.append("div")
        .classed("tooltip tooltip_rad", true);

    let chart = svg.selectAll(".chart-group")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chart-group", true);
    let chartBorder = svg.selectAll(".chartBorder-group")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartBorder-group", true);
    let chartColumnLegend = svg.selectAll(".chartColumnLegend")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartColumnLegend", true);
    let chartClassificationLegend = svg.selectAll(".chartClassificationLegend")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartClassificationLegend", true);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    let symbolGenerator = d3.symbol()
        .size(50);


    let symbolTypes = [d3.symbolTriangle, d3.symbolCircle, d3.symbolDiamond, d3.symbolCross, d3.symbolStar]
    let symbolsCount = symbolTypes.length

    let lastColumn = Object.keys(dataset[0])[Object.keys(dataset[0]).length - 1];
    setAnchors();
    setTooltip();
    setCategories();
    setClassifications();

    let getSymbol = (classification) => {
        return classifications.filter((elem, i) => elem.classi == classification)[0].symbol
    }

    let getFill = (classification) => {
        return classifications.filter((elem, i) => elem.classi == classification)[0].fill
    }

    function render() {
        // Create circle for RadViz
        chartBorder.selectAll("circle.chartBorder-0")
            .data([0])
            .enter()
            .append("circle")
            .attr("cx", center.x)
            .attr("cy", center.y)
            .attr("r", radius)
            .style("stroke", "lightblue")
            .style("stroke-width", 4)
            .style("fill", "none")
            .classed("chartBorder-0", true);
        chartBorder.selectAll("circle.chartBorder-1")
            .data([0])
            .enter()
            .append("circle")
            .attr("cx", center.x)
            .attr("cy", center.y)
            .attr("r", radius - 2)
            .style("stroke", "skyblue")
            .style("fill", "none")
            .classed("chartBorder-1", true);
        chartBorder.selectAll("circle.chartBorder-2")
            .data([0])
            .enter()
            .append("circle")
            .attr("cx", center.x)
            .attr("cy", center.y)
            .attr("r", radius + 2)
            .style("stroke", "skyblue")
            .style("fill", "none")
            .classed("chartBorder-2", true);


        // Create Column Legend
        let columnLegendItem = chartColumnLegend.selectAll("g.columnLegendItem")
            .data(anchors)
            .enter()
            .append("g")
            .attr("class", (d, i) => `columnLegendItem columnLegendItem-${i}`)
            .on("mouseover", onMouseOverLegend)
            .on("mouseout", onMouseOutLegend);
        chartColumnLegend.append("text")
            .attr("x", -10)
            .attr("y", (d, i) => -25)
            .style("fill", "blue")
            .attr("text-anchor", "start")
            .text((d, i) => `Hover to Highlight Anchor`);
        columnLegendItem
            .append("circle")
            .attr("cx", 0)
            .attr("cy", (d, i) => 35 * i)
            .attr("r", 15)
            .style("stroke", "skyblue")    // set the line color
            .style("fill", "white")
            .classed("anchor", true);
        columnLegendItem
            .append("text")
            .attr("x", 0)
            .attr("y", (d, i) => 35 * i + 5)
            .classed("anchor-label", true)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .text((d, i) => i + 1);
        columnLegendItem
            .append("rect")
            .attr("x", 20)
            .attr("y", (d, i) => 35 * i - 15)
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("width", 200)
            .attr("height", 30)
            .style("stroke", "skyblue")    // set the line color
            .style("fill", "white")
            .classed("anchor", true);
        columnLegendItem
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => 35 * i + 5)
            .classed("anchor-label", true)
            .style("fill", "black")
            .attr("text-anchor", "start")
            .text((d, i) => d[0]);
        chartColumnLegend
            .attr("transform", "translate(" + (margins.left + margins.right + chartWidth) + "," + (margins.top * 2) + ")");


        // Create Classification Legend
        let classificationLegendItem = chartClassificationLegend.selectAll("g.classificationLegendItem")
            .data(classifications)
            .enter()
            .append("g")
            .attr("class", (d, i) => `classificationLegendItem classificationLegendItem-${i}`)
            .on("mouseover", onMouseOverClassLegend)
            .on("mouseout", onMouseOutClassLegend);
        chartClassificationLegend.append("text")
            .attr("x", -10)
            .attr("y", (d, i) => -25)
            .style("fill", "blue")
            .attr("text-anchor", "start")
            .text((d, i) => `Hover to filter ${lastColumn} classification`);
        classificationLegendItem
            .append("circle")
            .attr("cx", 0)
            .attr("cy", (d, i) => 35 * i)
            .attr("r", 15)
            .style("stroke", "skyblue")
            .style("fill", "white")
            .classed("anchor", true);
        classificationLegendItem
            .append("path")
            .attr("d", (d) => symbolGenerator())
            .style("stroke", "black")
            .style("fill", (d) => { return d.fill })
            .style("opacity", 1)
            .attr("text-anchor", "middle")
            .attr("transform", (d, i) => "translate(" + 0 + "," + (35 * i) + ")");
        classificationLegendItem
            .append("rect")
            .attr("x", 20)
            .attr("y", (d, i) => 35 * i - 15)
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("width", 200)
            .attr("height", 30)
            .style("stroke", "skyblue")    // set the line color
            .style("fill", "white")
            .classed("anchor", true);
        classificationLegendItem
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => 35 * i + 5)
            .style("fill", "black")
            .attr("text-anchor", "start")
            .text((d, i) => d.classi);
        chartClassificationLegend
            .attr("transform", "translate(" + (margins.left + margins.right * 6 + chartWidth) + "," + (margins.top * 2) + ")");

        // Create anchor points
        let anchorGroup = chartBorder.selectAll("g.anchor-group")
            .data(anchors)
            .enter()
            .append("g")
            .attr("class", (d, i) => `anchor-group anchor-group-${i}`)
            .on("mouseover", onMouseOverAnchor)
            .on("mouseleave", onMouseLeaveAnchor);
        anchorGroup
            .append("circle")
            .attr("cx", (d, i) => d[1].x)
            .attr("cy", (d, i) => d[1].y)
            .attr("r", 15)
            .style("stroke", "skyblue")    // set the line color
            .style("stroke-width", 2)
            .style("fill", "white")
            .classed("anchor", true);
        anchorGroup
            .append("text")
            .attr("x", (d, i) => d[1].x)
            .attr("y", (d, i) => d[1].y + 5)
            .classed("anchor-label", true)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .text((d, i) => i + 1);
        let anchorDragHandler = d3.drag()
            .on("drag", function () {
                d3.select(this)
                    .selectAll(".anchor-label")
                    .attr("x", d3.event.x)
                    .attr("y", d3.event.y + 5);
                d3.select(this)
                    .selectAll(".anchor")
                    .attr("cx", d3.event.x)
                    .attr("cy", d3.event.y);
            })
            .on("end", onMouseDragEnd);
        anchorDragHandler(chartBorder.selectAll("g.anchor-group"));

        // Create Datapoints
        springConstants = categories.map(() => d3.scaleLinear().range([0, 1]));
        springConstants.forEach((element, index) => {
            element.domain(d3.extent(dataset, function (d) { return +d[categories[index]]; }));
        });

        let datapoints = chart.selectAll(".datapoint")
            .data(dataset);
        datapoints.exit()
            .remove();

        datapoints
            .enter()
            .append("g")
            .attr("class", (d) => `datapoint datapoint-${d[lastColumn]}`)
            .append("path")
            .attr("d", (d) => {
                if (d3.select("#encodeShape").property("checked")) {
                    return getSymbol(d[lastColumn]);
                }
                return symbolGenerator()
            })
            .on("mouseover", onMouseOverDatapoint)
            .on("mousemove", onMouseMoveDatapoint)
            .on("mouseout", onMouseOutDatapoint);
        // symbolGenerator.type(symbolTypes[i % (symbolsCount - 1)])()

        chart.selectAll(".datapoint path").transition("position_datapoints")
            .ease(d3.easeLinear)
            .duration(300)
            .attr("transform", (d) => "translate(" + getDataCoord(d).x + "," + getDataCoord(d).y + ")")
            .style("stroke", "black")
            .style("fill", (d) => getFill(d[lastColumn]))
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);
    }

    function updateDataPoints() {

        chart.selectAll(".datapoint path")
            .attr("d", (d) => {
                if (d3.select("#encodeShape").property("checked")) {
                    return getSymbol(d[lastColumn]);
                }
                return symbolGenerator()
            });

        chart.selectAll(".datapoint path").transition()
            .ease(d3.easeLinear)
            .duration(500)
            .attr("transform", (d) => "translate(" + getDataCoord(d).x + "," + getDataCoord(d).y + ")")
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);

        chartClassificationLegend.selectAll('.classificationLegendItem path')
            .attr("d", (d) => {
                if (d3.select("#encodeShape").property("checked")) {
                    return getSymbol(d.classi);
                }
                return symbolGenerator()
            });
    }

    function onMouseOverLegend(d, i) {
        svg.select(`.anchor-group-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("stroke", "gold")
            .style("stroke-width", 3);
    }

    function onMouseOutLegend(d, i) {
        svg.select(`.anchor-group-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("stroke", "skyblue")
            .style("stroke-width", 1);
    }

    function onMouseOverClassLegend(d, i) {
        svg.selectAll(`.datapoint path`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("opacity", 0);


        svg.selectAll(`.datapoint-${d.classi} path`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("opacity", 1);

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("stroke", "gold")
            .style("stroke-width", 3);
    }

    function onMouseOutClassLegend(d, i) {

        svg.selectAll(`.datapoint path`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);

        svg.selectAll(`.datapoint-${d.classi} path`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("stroke", "skyblue")
            .style("stroke-width", 1);
    }

    function onMouseOverAnchor(d, i) {
        d3.select(this).select("circle").transition("onMouseOverAnchor")
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        svg.select(`.columnLegendItem-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        svg.select(`.columnLegendItem-${i} rect`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("stroke", "gold")
            .style("stroke-width", 3);
    }

    function onMouseLeaveAnchor(d, i) {
        d3.select(this).select("circle").transition("onMouseLeaveAnchor")
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        svg.select(`.columnLegendItem-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        svg.select(`.columnLegendItem-${i} rect`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("stroke", "skyblue")
            .style("stroke-width", 1);
    }

    function onMouseOverDatapoint(d) {
        tooltip.style("visibility", "visible");
        anchors.forEach((anchor, i) => {
            tooltip.select(`.data-${i} .value`)
                .text(d[anchor[0]]);
        });
    }

    function onMouseMoveDatapoint(d) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px")
    }

    function onMouseOutDatapoint(d) {
        tooltip.style("visibility", "hidden");
    }

    function calculateNewAnchorCoord(d) {
        let a = [center.x, center.y];
        let b = [d3.event.x, d3.event.y];
        let c = [center.x, center.y, radius];

        let intersections = getIntersections(a, b, c);


        d[1].x = intersections.points.intersection2.coords[0];
        d[1].y = intersections.points.intersection2.coords[1];
    }

    function onMouseDragEnd(d, i) {
        calculateNewAnchorCoord(d);
        updateDataPoints();
        d3.select(this).transition("onMouseDragEndText")
            .ease(d3.easeLinear)
            .duration(100)
            .select("text.anchor-label")
            .attr("x", (d, i) => d[1].x)
            .attr("y", (d, i) => d[1].y + 5);

        d3.select(this).transition("onMouseDragEndCircle")
            .ease(d3.easeLinear)
            .duration(100)
            .selectAll("circle.anchor")
            .attr("cx", (d, i) => d[1].x)
            .attr("cy", (d, i) => d[1].y);
    }

    function setAnchors() {
        let anchorCount = Object.keys(dataset[0]).length - 1; // except last column

        Object.keys(dataset[0]).forEach((key, i) => {
            let angle = (Math.PI * 2 / anchorCount) * i;
            if (i != anchorCount) {
                // except last column
                anchors.push([key, angleToPoint(angle)]);
            }
        });
    }

    function setTooltip() {
        anchors.forEach((anchor, i) => {
            let toolTipItem = tooltip.append("div")
                .classed(`data-${i}`, true);
            toolTipItem
                .append("span")
                .text(`${anchor[0]}: `)
            toolTipItem
                .append("span")
                .classed(`value`, true)
                .text(`Placeholder`)
        });
    }

    function setClassifications() {
        dataset.forEach((element) => {
            if (!classifications.includes(element[lastColumn])) {
                classifications.push(element[lastColumn])
            }
        });

        classifications = classifications.map((element, i) => {
            let obj = {
                classi: element,
                symbol: symbolGenerator.type(symbolTypes[i % (symbolsCount - 1)])(),
                fill: colorScale(i)
            }
            return obj;
        })
    }

    function angleToPoint(angle) {
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        };
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function setCategories() {
        categories = [];
        for (property in dataset[0]) {
            if (isNumeric(dataset[0][property]) && property !== Object.keys(dataset[0])[Object.keys(dataset[0]).length - 1]) {
                categories.push(property);
            }
        }
    }

    function getDataCoord(d) {
        var list = springConstants.map(function (element, index) {
            return element(d[categories[index]]);
        }
        );
        var sum = list.reduce(function (prev, cur) { return prev + cur; });
        var pt = { x: 0, y: 0 };
        for (var i = 0; i < anchors.length; i++) {
            pt.x += (list[i] / sum) * anchors[i][1].x
            pt.y += (list[i] / sum) * anchors[i][1].y
        }
        return pt;
    }

    render();
    return updateDataPoints;
}





// Star Coordinates Implementation
function createStarVis(svg, width, height, dataset) {
    let anchors = [];
    let categories = [];
    let classifications = [];
    let springConstants;
    let margins = { top: 60, bottom: 60, left: 60, right: 60 };
    let chartWidth = width - margins.left - margins.right;
    let chartHeight = height - margins.top - margins.bottom;
    let center = { x: chartWidth / 2, y: chartHeight / 2 };
    let radius = Math.min(center.x, center.y);

    svg.selectAll(".tooltip").remove()
    svg.selectAll(".chart-group").remove()
    svg.selectAll(".chartVectorLines-group").remove()
    svg.selectAll(".chartBorder-group").remove()
    svg.selectAll(".chartColumnLegend").remove()
    svg.selectAll(".chartClassificationLegend").remove()

    let tooltip = root.append("div")
        .classed("tooltip tooltip_star", true);

    let chart = svg.selectAll(".chart-group")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chart-group", true);
    let chartVectorLines = svg.selectAll(".chartVectorLines-group")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartVectorLines-group", true);
    let chartBorder = svg.selectAll(".chartBorder-group")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartBorder-group", true);
    let chartColumnLegend = svg.selectAll(".chartColumnLegend")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartColumnLegend", true);
    let chartClassificationLegend = svg.selectAll(".chartClassificationLegend")
        .data([0])
        .enter()
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .classed("chartClassificationLegend", true);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    let symbolGenerator = d3.symbol()
        .size(50);


    let symbolTypes = [d3.symbolTriangle, d3.symbolCircle, d3.symbolDiamond, d3.symbolCross, d3.symbolStar]
    let symbolsCount = symbolTypes.length

    let lastColumn = Object.keys(dataset[0])[Object.keys(dataset[0]).length - 1];
    setAnchors();
    setTooltip();
    setCategories();
    setClassifications();

    let getSymbol = (classification) => {
        return classifications.filter((elem, i) => elem.classi == classification)[0].symbol
    }

    let getFill = (classification) => {
        return classifications.filter((elem, i) => elem.classi == classification)[0].fill
    }

    function render() {

        // Create Vector Lines for Star Coord
        chartVectorLines.selectAll("line.chartVectorLine")
            .data(anchors)
            .enter()
            .append("line")
            .attr("x1", center.x)
            .attr("y1", center.y)
            .attr("x2", (d) => d[1].x)
            .attr("y2", (d) => d[1].y)
            .style("stroke", "lightblue")
            .style("stroke-width", 2)
            .style("fill", "none")
            .attr("class", (d, i) => `chartVectorLine chartVectorLine-${i}`);

        // Create Column Legend
        let columnLegendItem = chartColumnLegend.selectAll("g.columnLegendItem")
            .data(anchors)
            .enter()
            .append("g")
            .attr("class", (d, i) => `columnLegendItem columnLegendItem-${i}`)
            .on("mouseover", onMouseOverLegend)
            .on("mouseout", onMouseOutLegend);
        chartColumnLegend.append("text")
            .attr("x", -10)
            .attr("y", -25)
            .style("fill", "blue")
            .attr("text-anchor", "start")
            .text(`Hover to Highlight Anchor`);
        columnLegendItem
            .append("circle")
            .attr("cx", 0)
            .attr("cy", (d, i) => 35 * i)
            .attr("r", 15)
            .style("stroke", "skyblue")    // set the line color
            .style("fill", "white")
            .classed("anchor", true);
        columnLegendItem
            .append("text")
            .attr("x", 0)
            .attr("y", (d, i) => 35 * i + 5)
            .classed("anchor-label", true)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .text((d, i) => i + 1);
        columnLegendItem
            .append("rect")
            .attr("x", 20)
            .attr("y", (d, i) => 35 * i - 15)
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("width", 200)
            .attr("height", 30)
            .style("stroke", "skyblue")    // set the line color
            .style("fill", "white")
            .classed("anchor", true);
        columnLegendItem
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => 35 * i + 5)
            .classed("anchor-label", true)
            .style("fill", "black")
            .attr("text-anchor", "start")
            .text((d, i) => d[0]);
        chartColumnLegend
            .attr("transform", "translate(" + (margins.left + margins.right + chartWidth) + "," + (margins.top * 2) + ")");


        // Create Classification Legend
        let classificationLegendItem = chartClassificationLegend.selectAll("g.classificationLegendItem")
            .data(classifications)
            .enter()
            .append("g")
            .attr("class", (d, i) => `classificationLegendItem classificationLegendItem-${i}`)
            .on("mouseover", onMouseOverClassLegend)
            .on("mouseout", onMouseOutClassLegend);
        chartClassificationLegend.append("text")
            .attr("x", -10)
            .attr("y", (d, i) => -25)
            .style("fill", "blue")
            .attr("text-anchor", "start")
            .text((d, i) => `Hover to filter ${lastColumn} classification`);
        classificationLegendItem
            .append("circle")
            .attr("cx", 0)
            .attr("cy", (d, i) => 35 * i)
            .attr("r", 15)
            .style("stroke", "skyblue")
            .style("fill", "white")
            .classed("anchor", true);
        classificationLegendItem
            .append("path")
            .attr("d", (d) => symbolGenerator())
            .style("stroke", "black")
            .style("fill", (d) => { return d.fill })
            .style("opacity", 1)
            .attr("text-anchor", "middle")
            .attr("transform", (d, i) => "translate(" + 0 + "," + (35 * i) + ")");
        classificationLegendItem
            .append("rect")
            .attr("x", 20)
            .attr("y", (d, i) => 35 * i - 15)
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("width", 200)
            .attr("height", 30)
            .style("stroke", "skyblue")    // set the line color
            .style("fill", "white")
            .classed("anchor", true);
        classificationLegendItem
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => 35 * i + 5)
            .style("fill", "black")
            .attr("text-anchor", "start")
            .text((d, i) => d.classi);
        chartClassificationLegend
            .attr("transform", "translate(" + (margins.left + margins.right * 6 + chartWidth) + "," + (margins.top * 2) + ")");

        // Create anchor points
        let anchorGroup = chartBorder.selectAll("g.anchor-group")
            .data(anchors)
            .enter()
            .append("g")
            .attr("class", (d, i) => `anchor-group anchor-group-${i}`)
            .on("mouseover", onMouseOverAnchor)
            .on("mouseleave", onMouseLeaveAnchor);
        anchorGroup
            .append("circle")
            .attr("cx", (d, i) => d[1].x)
            .attr("cy", (d, i) => d[1].y)
            .attr("r", 15)
            .style("stroke", "skyblue")    // set the line color
            .style("stroke-width", 2)
            .style("fill", "white")
            .classed("anchor", true);
        anchorGroup
            .append("text")
            .attr("x", (d, i) => d[1].x)
            .attr("y", (d, i) => d[1].y + 5)
            .classed("anchor-label", true)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .text((d, i) => i + 1);
        let anchorDragHandler = d3.drag()
            .on("drag", function (d, i) {
                d3.select(this)
                    .selectAll(".anchor-label")
                    .attr("x", d3.event.x)
                    .attr("y", d3.event.y + 5);
                d3.select(this)
                    .selectAll(".anchor")
                    .attr("cx", d3.event.x)
                    .attr("cy", d3.event.y);
                chartVectorLines.select(`line.chartVectorLine-${i}`)
                    .attr("x2", (d) => d3.event.x)
                    .attr("y2", (d) => d3.event.y);
            })
            .on("end", onMouseDragEnd);
        anchorDragHandler(chartBorder.selectAll("g.anchor-group"));

        // Create Datapoints
        springConstants = categories.map(() => d3.scaleLinear().range([0, 1]));
        springConstants.forEach((element, index) => {
            element.domain(d3.extent(dataset, function (d) { return +d[categories[index]]; }));
        });

        let datapoints = chart.selectAll(".datapoint")
            .data(dataset);
        datapoints.exit()
            .remove();

        datapoints
            .enter()
            .append("g")
            .attr("class", (d) => `datapoint datapoint-${d[lastColumn]}`)
            .append("path")
            .attr("d", (d) => {
                if (d3.select("#encodeShape").property("checked")) {
                    return getSymbol(d[lastColumn]);
                }
                return symbolGenerator()
            })
            .on("mouseover", onMouseOverDatapoint)
            .on("mousemove", onMouseMoveDatapoint)
            .on("mouseout", onMouseOutDatapoint);

        chart.selectAll(".datapoint path").transition("position_datapoints")
            .ease(d3.easeLinear)
            .duration(300)
            .attr("transform", (d) => "translate(" + getDataCoord(d).x + "," + getDataCoord(d).y + ")")
            .style("stroke", "black")
            .style("fill", (d) => getFill(d[lastColumn]))
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);
    }

    function updateDataPoints() {

        chart.selectAll(".datapoint path")
            .attr("d", (d) => {
                if (d3.select("#encodeShape").property("checked")) {
                    return getSymbol(d[lastColumn]);
                }
                return symbolGenerator()
            });

        chart.selectAll(".datapoint path").transition()
            .ease(d3.easeLinear)
            .duration(500)
            .attr("transform", (d) => "translate(" + getDataCoord(d).x + "," + getDataCoord(d).y + ")")
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);

        chartClassificationLegend.selectAll('.classificationLegendItem path')
            .attr("d", (d) => {
                if (d3.select("#encodeShape").property("checked")) {
                    return getSymbol(d.classi);
                }
                return symbolGenerator()
            });
    }

    function onMouseOverLegend(d, i) {
        svg.select(`.anchor-group-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("stroke", "gold")
            .style("stroke-width", 3);
    }

    function onMouseOutLegend(d, i) {
        svg.select(`.anchor-group-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("stroke", "skyblue")
            .style("stroke-width", 1);
    }

    function onMouseOverClassLegend(d, i) {
        svg.selectAll(`.datapoint path`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("opacity", 0);


        svg.selectAll(`.datapoint-${d.classi} path`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("opacity", 1);

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("stroke", "gold")
            .style("stroke-width", 3);
    }

    function onMouseOutClassLegend(d, i) {

        svg.selectAll(`.datapoint path`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);

        svg.selectAll(`.datapoint-${d.classi} path`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("opacity", d3.select("#adjustOpacity").property("value") / 100);

        d3.select(this).select("circle").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        d3.select(this).select("rect").transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("stroke", "skyblue")
            .style("stroke-width", 1);
    }

    function onMouseOverAnchor(d, i) {
        d3.select(this).select("circle").transition("onMouseOverAnchor")
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        svg.select(`.columnLegendItem-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("fill", "gold");

        svg.select(`.columnLegendItem-${i} rect`).transition()
            .ease(d3.easeLinear)
            .duration(50)
            .style("stroke", "gold")
            .style("stroke-width", 3);
    }

    function onMouseLeaveAnchor(d, i) {
        d3.select(this).select("circle").transition("onMouseLeaveAnchor")
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        svg.select(`.columnLegendItem-${i} circle`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("fill", "white");

        svg.select(`.columnLegendItem-${i} rect`).transition()
            .ease(d3.easeLinear)
            .duration(400)
            .style("stroke", "skyblue")
            .style("stroke-width", 1);
    }

    function onMouseOverDatapoint(d) {
        tooltip.style("visibility", "visible");
        anchors.forEach((anchor, i) => {
            tooltip.select(`.data-${i} .value`)
                .text(d[anchor[0]]);
        });
    }

    function onMouseMoveDatapoint(d) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px")
    }

    function onMouseOutDatapoint(d) {
        tooltip.style("visibility", "hidden");
    }

    function calculateNewAnchorCoord(d) {
        d[1].x = d3.event.x;
        d[1].y = d3.event.y;
    }

    function onMouseDragEnd(d, i) {
        calculateNewAnchorCoord(d);
        updateDataPoints();
        d3.select(this).transition("onMouseDragEndText")
            .ease(d3.easeLinear)
            .duration(100)
            .select("text.anchor-label")
            .attr("x", (d, i) => d[1].x)
            .attr("y", (d, i) => d[1].y + 5);

        d3.select(this).transition("onMouseDragEndCircle")
            .ease(d3.easeLinear)
            .duration(100)
            .selectAll("circle.anchor")
            .attr("cx", (d, i) => d[1].x)
            .attr("cy", (d, i) => d[1].y);
    }

    function setAnchors() {
        let anchorCount = Object.keys(dataset[0]).length - 1; // except last column

        Object.keys(dataset[0]).forEach((key, i) => {
            let angle = (Math.PI * 2 / anchorCount) * i;
            if (i != anchorCount) {
                // except last column
                anchors.push([key, angleToPoint(angle)]);
            }
        });
    }

    function setTooltip() {
        anchors.forEach((anchor, i) => {
            let toolTipItem = tooltip.append("div")
                .classed(`data-${i}`, true);
            toolTipItem
                .append("span")
                .text(`${anchor[0]}: `)
            toolTipItem
                .append("span")
                .classed(`value`, true)
                .text(`Placeholder`)
        });
    }

    function setClassifications() {
        dataset.forEach((element) => {
            if (!classifications.includes(element[lastColumn])) {
                classifications.push(element[lastColumn])
            }
        });

        classifications = classifications.map((element, i) => {
            let obj = {
                classi: element,
                symbol: symbolGenerator.type(symbolTypes[i % (symbolsCount - 1)])(),
                fill: colorScale(i)
            }
            return obj;
        })
    }

    function angleToPoint(angle) {
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        };
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function setCategories() {
        categories = [];
        for (property in dataset[0]) {
            if (isNumeric(dataset[0][property]) && property !== Object.keys(dataset[0])[Object.keys(dataset[0]).length - 1]) {
                categories.push(property);
            }
        }
    }

    function getDataCoord(d) {
        var list = springConstants.map(function (element, index) {
            return element(d[categories[index]]);
        }
        );

        var sum = list.reduce(function (prev, cur) { return prev + cur; });
        var pt = { x: center.x, y: center.y };
        for (var i = 0; i < anchors.length; i++) {
            pt.x += (list[i]) * (anchors[i][1].x - center.x)
            pt.y += (list[i]) * (anchors[i][1].y - center.y)
        }
        return pt;
    }

    render();
    return updateDataPoints;
}

