import {select, append} from "d3-selection";
import {line} from "d3-shape";
import {extent, max} from "d3-array";
import {scaleUtc, scaleLinear} from "d3-scale";
import {transition} from "d3-transition";
import {colors} from "./../colors.js";

export class chart {

	constructor(holder, isPriceScale) {
		this.holder = holder;
		this.isPriceScale = isPriceScale;
		this.margin = {"left": 100, "right": 50, "top": 50, "bottom": 75};
		this.width = this.holder.node().clientWidth;
		this.height = this.holder.node().clientHeight;
		this.x = scaleUtc()
		    .range([this.margin.left, this.width - this.margin.right]);

		this.countScale = scaleLinear()
		    .range([this.height - this.margin.bottom, this.margin.top]);

		this.priceScale = scaleLinear()
		    .range([this.height - this.margin.bottom, this.margin.top]);

		this.countLine = line()
		    .x(d => this.x(d.date))
		    .y(d => this.countScale(d.count))

		this.priceLine = line()
		    .x(d => this.x(d.date))
		    .y(d => this.priceScale(d.price))
	}

	draw(data, visibility, priceScale) {
		if (data){
			this.data = data;
		}
		if (visibility){
			this.visibility = visibility;
		}

		this.isPriceScale = priceScale;

		const mappedData = Object.entries(this.data).map(([key, value]) => ({key,value}));
		
		let maxPrice = max(Object.values(this.data).map(e => max(e, f => f.price)));
		let maxCount = max(Object.values(this.data).map(e => max(e, f => f.count)));

		this.countScale
			.domain([0, maxCount]);

		this.priceScale
			.domain([0, maxPrice]);

		this.x
			.domain(extent(this.data[Object.keys(this.data)[0]].map(e => e.date)));


		let chart = this.holder;
		let priceLine = this.priceLine;
		let countLine = this.countLine;
		let isPriceScale = this.isPriceScale;

		let thisData = this.data;
		let paths = this.holder
			.selectAll("path")
			.data(mappedData, d => d.key);

		let enter = paths.enter()
			.append("path")
			

		let theVisibility = this.visibility;

		paths
		.attr("stroke-dasharray", 0)
		.attr("stroke-dashoffset", 0)
		.transition().duration(200)
			.attr("d", function(d){
		      	if (isPriceScale){
		      		return priceLine(d["value"]);
		      	} else {
		      		return countLine(d["value"]);
		      	}
		      })
			.style("opacity", function(d){
				return theVisibility[d["key"]] ? 1 : 0;
			})

			

		paths.exit()
			.remove();	

		
		enter
			.attr("stroke", d => colors[d["key"]])
			.attr("stroke-opacity", 0.5)
		      .style("opacity", function(d){
				return theVisibility[d["key"]] ? 1 : 0;
			  })
		      .attr("fill", "none")
		      .attr("stroke-width", 1.5)
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-linecap", "round")
		      .attr("d", function(d){
		      	if (isPriceScale){
		      		return priceLine(d["value"]);
		      	} else {
		      		return countLine(d["value"]);
		      	}
		      })
		      .attr("stroke-dasharray", function(d){
		      	let totalLength = select(this).node().getTotalLength();
		      	return totalLength + " " + totalLength;
		      })
		      .attr("stroke-dashoffset",  function(d){
		      	let totalLength = select(this).node().getTotalLength();
		      	return totalLength;
		      })
		      .transition()
				  .duration(750)
				  .attr("stroke-dashoffset", 0);

	}
}