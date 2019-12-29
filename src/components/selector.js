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
		this.general = holder.append("div").attr("class", "general");

		this.brand.append("h3").html("Brand");
		this.state.append("h3").html("State");
		this.general.append("h3").html("Scale");

		this.brandForm = this.brand.append("form");
		this.stateForm = this.state.append("form");
		this.generalForm = this.general.append("form");
		this.update(this.visibility, this.priceScale);
		
	}

	update(visibility, priceScale){
		this.visibility = visibility;
		this.priceScale = priceScale;
		this.constructCheckbox(this.brandForm, this.visibility, "brand");
		this.constructCheckbox(this.stateForm, this.visibility, "state");
		this.constructRadio(this.generalForm, this.priceScale);
	}

	constructRadio(formItem, priceScale){
		let formStuff = formItem.selectAll("input")
			.data(["Price", "Count"], d => d);

		let setScale = this.setScale;
		formStuff.enter()
			.append("div")
			.attr("class", "promoted-checkbox")
				.each(function(d){
					let theThis = select(this);
					theThis.append("input").attr("type", "radio")
						.attr("class", "promoted-input-checkbox radio")
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

	constructCheckbox(formItem, array, arrayItem){
		let setVisibility = this.setVisibility;
		let formStuff = formItem.selectAll("div")
			.data(Object.keys(array[arrayItem]), function(d){ return d});

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
							setVisibility(arrayItem, d);
						});
					let label = theThis.append("label")
						.attr("for", d);
					let labelSvg = label.append("svg")
						.attr("fill", colors[d]);
					labelSvg.append("use")
							.attr("xlink:href","#checkmark")

						
					label.append("span").html(d);
				});
	}
}