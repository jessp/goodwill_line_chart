import {select, append} from "d3-selection";


export class selector {

	constructor(holder, visibility, visualizingBrand, setVisualizing) {
		this.holder = holder;
		this.visibility = visibility;
		this.visualizingBrand = visualizingBrand;

		this.brand = holder.append("div").attr("class", "brand")
			.on("click", () => setVisualizing(true));
		this.state = holder.append("div").attr("class", "state")
			.on("click", () => setVisualizing(false));
		this.general = holder.append("div").attr("class", "general");

		this.brand.append("h2").html("Brand");
		this.state.append("h2").html("State");

		this.brandForm = this.brand.append("form");
		this.stateForm = this.state.append("form");

		this.constructCheckbox(this.brandForm, this.visibility, "brand");
		this.constructCheckbox(this.stateForm, this.visibility, "state");
	}

	constructCheckbox(formItem, array, arrayItem){
		formItem.selectAll("div")
			.data(Object.keys(array[arrayItem]), function(d){ return d})
			.enter()
			.append("div")
				.each(function(d){
					let theThis = select(this);
					theThis.append("input").attr("type", "checkbox").attr("id", d)
						.attr("name", d).attr("value", d)
						.property("checked", array[arrayItem][d]);
					theThis.append("label")
						.attr("for", d)
						.html(d);
				})
	}
}