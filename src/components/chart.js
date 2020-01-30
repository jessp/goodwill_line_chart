import {select, append, mouse} from "d3-selection";
import {line} from "d3-shape";
import {extent, max, min, bisector} from "d3-array";
import {scaleUtc, scaleLinear} from "d3-scale";
import {transition} from "d3-transition";
import {axisBottom, axisRight} from "d3-axis";
import {format} from "d3-format";
import {timeFormat} from "d3-time-format";
import {colors} from "./../colors.js";

export class chart {

	constructor(holder, isPriceScale) {
		this.holder = holder;
		this.lineLayer = this.holder.append("g")
		this.isPriceScale = isPriceScale;
		this.margin = {"left": 100, "right": 50, "top": 25, "bottom": 75};
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
		    .y(d => this.priceScale(d.price));

		this.yAxis = this.holder
			.append("g")
			.attr("class", "yAxis");

		this.xAxis = this.holder
			.append("g")
			.attr("class", "xAxis");

		this.drawAxes = this.drawAxes.bind(this);
		this.draw = this.draw.bind(this);
		this.resize = this.resize.bind(this);
		this.bisect = this.bisect.bind(this);
		this.callout = this.callout.bind(this);

		this.tooltipLayer = this.holder.append("g")
			.attr("class", "tooltipLayer");
		this.tooltipLayer.append("line").style("pointer-events", "none");
		this.tooltipLayer.append("text")
			.attr("class", "date")
			.attr("text-anchor", "middle");

		this.dateFormat = timeFormat("%b %d, %Y");
		this.priceFormat = format("$.2f");
		this.countFormat = format(",");

		window.addEventListener("resize", () => this.resize());

		let bisect = this.bisect;
		let callout = this.callout;
		this.holder.on("touchmove mousemove", function() {
			const theX = mouse(this)[0];
			const returnedValue = bisect(theX);
			callout(returnedValue, theX);
		});

		this.holder.on("touchend mouseleave", function(){
			callout(null);
		})

		this.yLabel = this.holder.append("g")
			.attr("transform", "translate(" + (this.margin.left/2 - 5) + "," + ((this.height - this.margin.top - this.margin.bottom)/2) + ")")
		
		this.yLabelText = this.yLabel.append("text")
			.style("font-weight", 700)
			.attr("text-anchor", "middle")
			.attr("transform", "rotate(-90)")
			.text(isPriceScale ? "Average Price per 2 Week Period" : "Total Count per 2 Week Period")
	}

	resize(){
		this.width = this.holder.node().clientWidth;
		this.height = this.holder.node().clientHeight;
		this.x
			.range([this.margin.left, this.width - this.margin.right]);

		this.countScale
		    .range([this.height - this.margin.bottom, this.margin.top]);

		this.priceScale
		    .range([this.height - this.margin.bottom, this.margin.top]);

		this.draw();
	}

	draw(data, visibility, isItPriceScale) {
		if (data){
			this.data = data;
		}
		if (visibility){
			this.visibility = visibility;
		}

		if (isItPriceScale !== undefined){
			this.isPriceScale = isItPriceScale;
		}

		this.yLabel.transition().duration(300)
			.attr("transform", "translate(" + (this.margin.left/2 - 5) + "," + ((this.height - this.margin.top - this.margin.bottom)/2) + ")")
		this.yLabelText
			.text(this.isPriceScale ? "Average Price per 2 Week Period" : "Total Count per 2 Week Period")


		const mappedData = Object.entries(this.data).map(([key, value]) => ({key,value}));
		let maxPrice = max(Object.values(this.data).map(e => max(e, f => f.price)));
		let maxCount = max(Object.values(this.data).map(e => max(e, f => f.count)));

		let minPrice = min(Object.values(this.data).map(e => min(e, f => f.price)));
		let minCount = min(Object.values(this.data).map(e => min(e, f => f.count)));

		this.mappedData = mappedData;


		this.countScale
			.domain([0, maxCount]);

		this.priceScale
			.domain([0, maxPrice]);

		this.x
			.domain(extent(this.data[Object.keys(this.data)[0]].map(e => e.date)));


		this.drawAxes();

		let chart = this.lineLayer;
		let priceLine = this.priceLine;
		let countLine = this.countLine;
		let isPriceScale = this.isPriceScale;
		let thisData = this.data;
		let paths = this.lineLayer
			.selectAll("path.path")
			.data(mappedData, d => d.key);

		let enter = paths.enter()
			.append("path")
			.attr("class", "path")
			

		let theVisibility = this.visibility;

		paths
		.attr("stroke-dasharray", d => d["key"] === "Average" ? "1 3" : 0)
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
				return ((isPriceScale || d["key"] !== "Average") && theVisibility[d["key"]]) ? 1 : 0;
			})

			

		paths.exit()
			.remove();	

		let lineLayer = this.lineLayer;
		let tooltipLayer = this.tooltipLayer;
		enter
			.attr("class", d => "path " + d["key"].split(' ').join(''))
			.attr("stroke", d => colors[d["key"]])
			.attr("stroke-opacity", 0.5)
		      .style("opacity", function(d){
				return ((isPriceScale || d["key"] !== "Average") && theVisibility[d["key"]]) ? 1 : 0;
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
		      	if (d["key"] === "Average") {
		      		return "1 3";
		      	}
		      	let totalLength = select(this).node().getTotalLength();
		      	return totalLength + " " + totalLength;
		      })
		      .attr("stroke-dashoffset",  function(d){
		      	if (d["key"] === "Average") {
		      		return 0;
		      	}
		      	let totalLength = select(this).node().getTotalLength();
		      	return totalLength;
		      })
		      .on("mouseenter", function(d){
					lineLayer.selectAll("path:not(." + d.key.split(' ').join('') + ")").attr("stroke-opacity", 0.15);
					tooltipLayer.selectAll("g:not(." + d.key.split(' ').join('') + ")").style("opacity", 0.15);
				})
		      .on("mouseout", function(d){
					lineLayer.selectAll("path").attr("stroke-opacity", 0.5);
					tooltipLayer.selectAll("g:not(." + d.key.split(' ').join('') + ")").style("opacity", 1);
				})
		      .transition()
				  .duration(750)
				  .attr("stroke-dashoffset", 0);

	}

	bisect(mx){
	  const myBisect = bisector(d => d.date).left;
	  const mDate = this.x.invert(mx);
	  if (this.mappedData && this.mappedData[0]){
		  const index = myBisect(this.mappedData[0]["value"], mDate, 1);
		  const a = this.mappedData[0]["value"][index - 1];
		  const b = this.mappedData[0]["value"][index];
		  let titles;
		  if (b && mDate - a.date > b.date - mDate){
		  	titles = this.mappedData.map(e => ({"name": e["key"], "value": e["value"][index], "prev": e["value"][index - 1]}));
		  } else {
		  	titles = this.mappedData.map(e => ({"name": e["key"], "value": e["value"][index - 1], "prev": e["value"][index]}));
		  }
		  return titles;
		} else {
			return []
		}

	}


	drawAxes(){

		this.xAxis
			.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
			.call(axisBottom(this.x));

		let isPriceScale = this.isPriceScale;
		let commaFormat = format(",");
		this.yAxis
			.attr("transform", `translate(${this.margin.left},0)`)
			.transition().duration(300)
		    .call(axisRight(this.isPriceScale ? this.priceScale : this.countScale)
		    		.tickSize(this.width - this.margin.left - this.margin.right)
		        .tickFormat(s => isPriceScale ? `$${s}` : commaFormat(s)))
		    .call(g => g.select(".domain")
		        .remove())
		    .call(g => g.selectAll(".tick text")
		        .attr("x", -16))
	}

	callout(selectedDatum, theX){
		let priceFormat = this.priceFormat;
		let countFormat = this.priceFormat;

		if (selectedDatum === null || (this.x.invert(theX) < this.x.domain()[0]) || (this.x.invert(theX) > this.x.domain()[1])) {
			this.tooltipLayer.style("display", "none");
		} else {
			var yPos = [];

			for (var i = 0; i < selectedDatum.length; i++){
				yPos.push({ind: i, y: this.isPriceScale ? this.priceScale(selectedDatum[i].value.price) : this.countScale(selectedDatum[i].value.count), off: 0});
			}

			yPos.sort (function(a,b) { return a.y - b.y; });
            yPos.forEach (function(p,i) {
            	if (i > 0) {
              		var last = yPos[i-1].y;
	               	yPos[i].off = Math.max (0, (last + 22) - yPos[i].y);
	                yPos[i].y += yPos[i].off;
              }
            })
            yPos.sort (function(a,b) { return a.ind - b.ind; });


			this.tooltipLayer.style("display", "initial");
			this.tooltipLayer
				.select("line")
				.attr("stroke", "black")
				.attr("x1", theX)
				.attr("x2", theX)
				.attr("y1", this.height - this.margin.bottom)
				.attr("y2", this.margin.top);

			let dateFormat = this.dateFormat;
			this.tooltipLayer
				.select(".date")
				.text(function(d){
					if (!selectedDatum || selectedDatum.length < 1){
						return "";
					}
					let dates = [selectedDatum[0].value.date, selectedDatum[0].prev.date].sort((a, b) => a - b);
					return dateFormat(dates[0]) + " - " + dateFormat(dates[1]);
				})
				.attr("x", theX)
				.attr("y", this.margin.top - 5)
				.attr("text-anchor", function(d){
					if(theX < window.innerWidth/6){
						return "start";
					} else if (theX > (window.innerWidth - window.innerWidth/6)){
						return "end";
					}
					return "middle";
				})

			let tips = this.tooltipLayer
				.selectAll("g")
				.data(selectedDatum, d => d.name);

			let enteredTips = tips.enter()
				.append("g")
				.attr("class", d => d.name.split(' ').join(''));

			tips.exit().remove();

			let thisX = this.x;
			let isPriceScale = this.isPriceScale;
			let priceScale = this.priceScale;
			let countScale = this.countScale;

			tips.select(".tooltip")
				.attr("x", function(d){
					if (theX < window.innerWidth/2){
						return 15;
					}
					let text = "";
					if (isPriceScale){
						text = priceFormat(d.value.price) + " - " + d.name;
					} else {
						text = countFormat(d.value.count) + " - " + d.name;
					}
					return text.length * -8.75 - 5;
				})

			tips.select(".tooltip")
				.select(".val")
				.text(function(d){
					if (isPriceScale){
						if (theX < window.innerWidth/2){
							return priceFormat(d.value.price) + " - " + d.name;
						} else {
							return d.name + " - " + priceFormat(d.value.price);
						}
					} else {
						if (theX < window.innerWidth/2){
							return countFormat(d.value.count) + " - " + d.name;
						} else {
							return d.name + " - " + countFormat(d.value.count);
						}
					}
				})
				.attr("y", function(d, i){
					return yPos[i].off
				})

			tips.select("rect")
				.attr("x", function(d){
					if (theX < window.innerWidth/2){
						return 10;
					}
					let text = "";
					if (isPriceScale){
						text = priceFormat(d.value.price) + " - " + d.name;
					} else {
						text = countFormat(d.value.count) + " - " + d.name;
					}
					return text.length * -8.75 - 10;
				})
				.attr("width", function(d){
					let text = "";
					if (isPriceScale){
						text = priceFormat(d.value.price) + " - " + d.name;
					} else {
						text = countFormat(d.value.count) + " - " + d.name;
					}
					return text.length * 8.75;
				})
				.attr("y", function(d, i){
					return yPos[i].off - 15
				})

			tips.attr("transform", function(d, i){
				return "translate(" + 
					(thisX(d.value.date) + 2) + 
					" , " + 
					(isPriceScale ? priceScale(d.value.price) : countScale(d.value.count)) +
					")";
			})
			.style("visibility", d => ((isPriceScale || d["name"] !== "Average") && this.visibility[d["name"]]) ? "initial" : "hidden");
			
			enteredTips.append("rect")
				.attr("width", function(d){
					let text = "";
					if (isPriceScale){
						text = priceFormat(d.value.price) + " - " + d.name;
					} else {
						text = countFormat(d.value.count) + " - " + d.name;
					}
					return text.length * 8.75;
				})
				.attr("height", 20)
				.attr("stroke", d => colors[d["name"]])
				.attr("stroke-width", 1.5)
				.attr("fill", "#fff")
				.attr("fill-opacity", 0.75)


			let lineLayer = this.lineLayer;
			let tooltipLayer = this.tooltipLayer;
			enteredTips.append("circle")
				.attr("r", 4)
				.attr("cx",-2)
				.attr("fill", "none")
				.attr("stroke", d => colors[d["name"]])
				.attr("stroke-width", 1.5)
				.on("mouseenter", function(d){
					lineLayer.selectAll("path:not(." + d.name.split(' ').join('') + ")").attr("stroke-opacity", 0.15)
					tooltipLayer.selectAll("g:not(." + d.name.split(' ').join('') + ")").style("opacity", 0.15);
				})
		      .on("mouseout", function(d){
					lineLayer.selectAll("path").attr("stroke-opacity", 0.5);
					tooltipLayer.selectAll("g:not(." + d.name.split(' ').join('') + ")").style("opacity", 1);
				})
			

			enteredTips.append("text")
				.attr("class", "tooltip")
				.attr("y", 15)

			enteredTips.select(".tooltip").append("tspan")
				.attr("class", "val")
				.text((isPriceScale ? (d => this.priceFormat(d.value.price)) : (d => this.countFormat(d.value.count))) + " - " + (d => d.name));

		}
	}
}