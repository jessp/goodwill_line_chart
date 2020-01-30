import {select, append} from "d3-selection";
import checkmark from './../assets/checkmark.svg';
import radio from './../assets/radio.svg';
import {colors} from "./../colors.js";



export class selector {

	constructor(holder, visibility, visualizingBrand, 
		setVisualizing, setVisibility, priceScale, setScale) {
		this.holder = holder;
		this.visibility = visibility;
		this.visualizingBrand = visualizingBrand;
		this.setVisibility = setVisibility;
		this.priceScale = priceScale;
		this.setScale = setScale;

		this.holder.append("div").html(checkmark);
		this.holder.append("div").html(radio);

		this.brand = holder.append("div").attr("class", "brand")
			.on("click", function(d){
				select(this).classed("inactive", false);
				select(".state").classed("inactive", true);
				setVisualizing(true);
			});
		this.state = holder.append("div").attr("class", "state inactive")
			.on("click", function(d){
				select(this).classed("inactive", false);
				select(".brand").classed("inactive", true);
				setVisualizing(false);
			});
		this.general = holder.append("div").attr("class", "general").append("div").attr("class", "general-inner");

		this.brand.append("h3").html("Brand");
		this.state.append("h3").html("State");
		this.general.append("h3").html("Scale");

		this.brandForm = this.brand.append("form");
		this.stateForm = this.state.append("form");
		this.generalForm = this.general.append("form").attr("class", "generalForm");

		this.arrow = this.general.append("div");
		this.arrow
		.style("display", "inline-block")
		.style("margin-left", "10px")
		.attr("class", "arrowDiv")
		.append("svg")
		.attr("viewBox", "0 0 100 15")
		.attr("width", "100px")
		.attr("height", "15px")
		.append("defs")
		.append("marker")
		.attr("id", "arrow")
		.attr("viewBox", "0 0 10 10")
		.attr("refX", "5")
		.attr("refY", "5")
		.append("path")
		.attr("fill", "#444")
		.attr("d", "M 0 0 L 10 5 L 0 10 z");

		this.arrow.select("svg")
			.append("path")
			.attr("d", "M 0 10 L 95 10")
			.attr("stroke", "#444")
			.attr("stroke-width", 2)
			.attr("stroke-dasharray", "8 4")
			.attr("marker-end", "url(#arrow)");

		this.averageForm = this.general.append("form").attr("class", "averageForm");

		this.update(this.visibility, this.priceScale);
	}

	update(visibility, priceScale, visualizingBrand){
		this.visibility = visibility;
		this.priceScale = priceScale;
		this.visualizingBrand = visualizingBrand;
		this.constructCheckbox(this.brandForm, this.visibility, "brand");
		this.constructCheckbox(this.stateForm, this.visibility, "state");
		this.constructRadio(this.generalForm, this.priceScale);
		this.constructCheckbox(this.averageForm, this.visibility, "brand", true);
		this.arrow.style("visibility", this.priceScale ? "visible" : "hidden");
		this.averageForm.style("visibility", this.priceScale ? "visible" : "hidden");
	}

	constructRadio(formItem, priceScale){
		let formStuff = formItem.selectAll(".promoted-checkbox.radio")
			.data(["Count", "Price"], d => d);

		let setScale = this.setScale;
		formStuff.enter()
			.append("div")
			.attr("class", "promoted-checkbox radio")
				.each(function(d){
					let theThis = select(this);
					theThis.append("input").attr("type", "radio")
						.attr("class", "promoted-input-checkbox")
						.attr("id", d)
						.attr("name", "scale").attr("value", d)
						.property("checked", function(e){
							return (d === "Price" && priceScale === true) ||
							(d === "Count" && priceScale === false)
						})
						.on("click", function(e){
							if (e === "Price"){
								setScale(true);
							} else {
								setScale(false);
							}
						});
					let label = theThis.append("label")
						.attr("for", d);
					let labelSvg = label.append("svg");
					labelSvg.append("use")
							.attr("xlink:href","#radio")

						
					label.append("span").html(d);
				});
	}

	constructCheckbox(formItem, array, arrayItem, justAverage){
		let formArray = Object.keys(array[arrayItem]).filter(e => e !== "Average");
		if (justAverage){
			formArray = Object.keys(array[arrayItem]).filter(e => e === "Average")
		}
		let setVisibility = this.setVisibility;
		let formStuff = formItem.selectAll("div")
			.data(formArray, function(d){ return d});

		formItem.selectAll("div").each(function(d){
					let theThis = select(this);
					theThis.select("checkbox")
						.property("checked", array[arrayItem][d]);
				})

		formStuff.enter()
			.append("div")
			.attr("class", "promoted-checkbox")
				.each(function(d){
					let theThis = select(this);
					theThis.append("input").attr("type", "checkbox")
						.attr("class", "promoted-input-checkbox")
						.attr("id", d)
						.attr("name", d).attr("value", d)
						.property("checked", array[arrayItem][d])
						.on("click", function(d){
							if (d === "Average"){
								setVisibility("brand", d);
								setVisibility("state", d);
							} else {
								setVisibility(arrayItem, d);
							}
						});
					let label = theThis.append("label")
						.attr("for", d);
					let labelSvg = label.append("svg")
						.attr("fill", colors[d]);
					labelSvg.append("use")
							.attr("xlink:href","#checkmark")
						
					label.append("span").html(d === "Average" ? "Show Average" : d);
				});
	}
}