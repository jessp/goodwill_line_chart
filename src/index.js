import "./main.css";
import {select, append} from "d3-selection";
import {json as d3json} from "d3-fetch";

import {chart} from "./components/chart.js";
import {selector} from "./components/selector.js";

  function component() {
    const element = document.createElement('div');
    let selectedElement = select("body");
    let wrapper = selectedElement.append("div").attr("class", "wrapper");
    let header = wrapper.append("div").attr("class", "header");
    header.append("h1").text("Goodwill Prices");
    header.append("p").text("Maecenas in feugiat risus, vel eleifend nisi. Curabitur in nibh nec tellus convallis hendrerit eu egestas purus. Morbi tincidunt nisl ac est efficitur, ut iaculis erat convallis. Aliquam at imperdiet enim. Curabitur tempor lectus sit amet erat tempor dapibus. Aliquam in facilisis ligula. Cras at felis nec lorem ullamcorper mollis. Fusce sit amet mi eu libero mattis fermentum sit amet non nisi. Sed sit amet accumsan elit, id pulvinar tellus. Vivamus quis cursus massa. Quisque consectetur quam non fringilla fermentum. Sed accumsan nisi augue, mattis imperdiet tortor vehicula non. Maecenas vel convallis risus. Etiam at quam sit amet ante venenatis mattis. Etiam lorem ligula, consequat congue sagittis in, viverra eu mauris.");
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
    		myChart.draw(data[visualizingBrand ? "brand": "state"], visibility[visualizingBrand ? "brand": "state"], priceScale);
    	}

    	function setVisibility(type, val){
    		visibility[type][val] = !visibility[type][val];
    		mySelector.update(visibility, priceScale);
    		myChart.draw(data[visualizingBrand ? "brand": "state"], visibility[visualizingBrand ? "brand": "state"], priceScale);
    	}

    	function setScale(e){
    		priceScale = e;
    		mySelector.update(visibility, priceScale);
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