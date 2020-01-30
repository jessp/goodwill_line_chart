import "./main.css";
import {select, append} from "d3-selection";
import {json as d3json} from "d3-fetch";

import {chart} from "./components/chart.js";
import {selector} from "./components/selector.js";

  function component() {
    const element = document.createElement('div');
    let selectedElement = select("body");
    let portraitPlease = selectedElement.append("div")
        .attr("class", "portraitPlease")
        .append("div")
        .attr("class", "outerWrap")
        .append("div")
        .attr("class", "innerWrap")
        .append("h1").html("Please Rotate Your Phone into Landscape");
    let wrapper = selectedElement.append("div").attr("class", "wrapper");
    let header = wrapper.append("div").attr("class", "header");
    header.append("h1").text("Price and Quantity of Women's Shirts at Goodwill Over Time");
    header.append("p").text("Over the summer of 2019, I scraped almost four million item pages from the Goodwill auction website in hopes of learning something interesting about how the price or demand for certain brands of items has changed over time. I focused just on women's shirts to keep the search somewhat limited. I learned nothing valuable. Here is a chart anyways.");
    header.append("p").text("Loft includes items under the Ann Taylor brand as well.")
    header.append("p").text("This project was done in my spare time without the permission of Goodwill. I will happily consider taking it down if it infringes on anything.");
    let chartControls = selectedElement.append("div").attr("class", "controls");
    let chartHolder = selectedElement.append("svg").attr("class", "chart");
    
    var priceScale = true;
    var visualizingBrand = true;
    let visibility = {
    	"brand": {
    		"Gap" : true,
			"Loft" : true,
			"Ralph Lauren" : true,
			"Old Navy" : true,
			"Talbots" : true,
			"Michael Kors" : true,
            "Average": true
    	},
    	"state": {
    		"Used": true, 
    		"NWT": true, 
    		"NWOT": true,
            "Average": true
    	}
    }

   

    let myChart = new chart(chartHolder);


    d3json("./data/brands_over_time.json", function(d) {
	  return d;
	}).then(function(data) {
		function setVisualizing(e){
    		visualizingBrand = e;
    		myChart.draw(data[visualizingBrand ? "brand": "state"], visibility[visualizingBrand ? "brand": "state"], priceScale);
    	}

    	function setVisibility(type, val){
    		visibility[type][val] = !visibility[type][val];
    		mySelector.update(visibility, priceScale, visualizingBrand);
    		myChart.draw(data[visualizingBrand ? "brand": "state"], visibility[visualizingBrand ? "brand": "state"], priceScale);
    	}

    	function setScale(e){
    		priceScale = e;
    		mySelector.update(visibility, priceScale, visualizingBrand);
    		myChart.draw(data[visualizingBrand ? "brand": "state"], visibility[visualizingBrand ? "brand": "state"], priceScale);
    	}


		let mySelector = new selector(chartControls, 
			visibility, visualizingBrand, setVisualizing, setVisibility, priceScale, setScale);
		myChart.draw(data[visualizingBrand ? "brand": "state"], 
			visibility[visualizingBrand ? "brand": "state"], priceScale);
	});

    return element;
  }

  document.body.appendChild(component());