import "./main.css";
import {select, append} from "d3-selection";
import {json as d3json} from "d3-fetch";

import {chart} from "./components/chart.js";
import {selector} from "./components/selector.js";

  function component() {
    const element = document.createElement('div');
    let selectedElement = select("body");
    let header = selectedElement.append("div").attr("class", "header");
    header.append("h1").text("Title title");
    header.append("p").text("Description description");
    let chartControls = selectedElement.append("div").attr("class", "controls");
    let chartHolder = selectedElement.append("svg").attr("class", "chart");
    
    var visualizingBrand = true;
    let visibility = {
    	"brand": {
    		"Gap" : true,
			"Loft" : true,
			"Ralph Lauren" : true,
			"Calvin Klein" : true,
			"Old Navy" : true,
			"Talbots" : true,
			"Michael Kors" : true
    	},
    	"state": {
    		"Used": true, 
    		"NWT": true, 
    		"NWOT": true
    	}
    }

   

    let myChart = new chart(chartHolder);


    d3json("./data/brands_over_time.json", function(d) {
	  return d;
	}).then(function(data) {
		function setVisualizing(e){
    		visualizingBrand = e;
    		myChart.draw(data[visualizingBrand ? "brand": "state"]);
    	}
		let mySelector = new selector(chartControls, visibility, visualizingBrand, setVisualizing);
		myChart.draw(data[visualizingBrand ? "brand": "state"]);
	});

    return element;
  }

  document.body.appendChild(component());