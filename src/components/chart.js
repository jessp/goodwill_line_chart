import {select, append} from "d3-selection";
import {line} from "d3-shape";
import {extent, max} from "d3-array";
import {scaleUtc, scaleLinear} from "d3-scale";

export class chart {

	constructor(holder) {
		this.holder = holder;
		this.isPriceScale = true;
		this.margin = {"left": 100, "right": 50, "top": 50, "bottom": 75};
		this.width = this.holder.node().clientWidth;
		this.height = this.holder.node().clientHeight;
		this.colors = {
			"Gap" : "yellow",
			"Loft" : "purple",
			"Ralph Lauren" : "blue",
			"Calvin Klein" : "green",
			"Old Navy" : "orange",
			"Talbots" : "red",
			"Michael Kors" : "pink",
			"Used": "black",
			"NWT": "lemon",
			"NWOT": "grey"
		}
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

	draw(data) {
		this.data = data;
		let maxPrice = max(Object.values(this.data).map(e => max(e, f => f.price)));
		let maxCount = max(Object.values(this.data).map(e => max(e, f => f.count)));

		this.countScale
			.domain([0, maxCount]);

		this.priceScale
			.domain([0, maxPrice]);

		this.x
			.domain(extent(data[Object.keys(data)[0]].map(e => e.date)));


		let chart = this.holder;
		let priceLine = this.priceLine;
		let countLine = this.countLine;
		let isPriceScale = this.isPriceScale;
		let paths = this.holder
			.selectAll("path")
			.data(Object.keys(data), d => d)		
			.enter()
			.append("path")
			.attr("stroke", d => this.colors[d])
			.attr("stroke-opacity", 0.7)
		      .datum(function(d){ return data[d];})
		      .attr("fill", "none")
		      .attr("stroke-width", 1.5)
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-linecap", "round")
		      .attr("d", function(d){
		      	if (isPriceScale){
		      		return priceLine(d);
		      	} else {
		      		return countLine(d);
		      	}
		      });

	}
}