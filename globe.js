const WIDTH = 1300;
const HEIGHT = 700;
const VELOCITY = .25;
let time = Date.now();
let proj = d3.geoOrthographic().translate([WIDTH / 3, HEIGHT / 2]);
let path = d3.geoPath().projection(proj);
let graticule = d3.geoGraticule();
let wasDragged = false;
let timer;
let countryMap = new Map();
let colors = { clickable: 'green', hover: 'grey', clicked: "blue", clickhover: "darkblue" };
let currentYear = 1970;
let landUse = {}
let colorScale;
var country= null;
let direction = 1;
let theta = 0;

var svg = d3.select("#svg1")
.attr("width", WIDTH)
.attr("height", HEIGHT)
.attr("class", "svg");
svg.append("path")
.datum(graticule)
.attr("class", "graticule")
.attr("d", path);

const ready = async () => {
  let world = await d3.json("datasets/world-110m.v1.json");
  let names = await d3.tsv("datasets/world-country-names.tsv")
  let land = await d3.csv("datasets/landForAgri.csv")
  let sugar_waste= await d3.csv("datasets/Loss_sugarcrops.csv")
  let cereal_waste= await d3.csv("datasets/Loss_cerealcrops.csv")
  let starch_waste= await d3.csv("datasets/Loss_starchcrops.csv")
  let cereal_production= await d3.csv("datasets/Production_cerealcrops.csv")
  let sugar_production= await d3.csv("datasets/Production_sugarcrops.csv")
  let starch_production= await d3.csv("datasets/Production_starchcrops.csv")
  let landUseExtent = [100, 0] 

  /* Deserializing csv into landUse object */
  let lastArea = "Afghanistan";
  let landUseInCountry = {}
  land.forEach((d, _) => {
    if (lastArea !== d.Area) {
      if (lastArea == "United States of America") lastArea = "United States"
      else if (lastArea == "Venezuela (Bolivarian Republic of)") lastArea = "Venezuela, Bolivarian Republic of"
      else if (lastArea == "Czechia") lastArea = "Czech Republic"
      else if (lastArea == "Bolivia (Plurinational State of)") lastArea = "Bolivia, Plurinational State of"
      else if (lastArea == "C̫te d'Ivoire") lastArea = "Côte d'Ivoire"
      else if (lastArea == "Iran (Islamic Republic of)") lastArea = "Iran, Islamic Republic of"
      else if (lastArea == "Palestine") lastArea = "Palestinian Territory, Occupied"
      else if (lastArea == "Sudan (former)") lastArea = "Sudan"
      else if (lastArea == "Eswatini") lastArea = "Swaziland"
      else if (lastArea == "Yugoslav SFR") lastArea = "Macedonia, the former Yugoslav Republic of" // There is also a North Macedonia lol
      else if (lastArea == "United Republic of Tanzania") lastArea = "Tanzania, United Republic of"

      landUse[lastArea] = landUseInCountry
      if (lastArea == "Congo") landUse["Congo, the Democratic Republic of the"] = landUseInCountry
      if (lastArea == "Sudan") landUse["South Sudan"] = landUseInCountry
      landUseInCountry = {}
    }
    let val = parseFloat(d.Value)
    landUseExtent[0] = val < landUseExtent[0] ? val : landUseExtent[0]
    landUseExtent[1] = val > landUseExtent[1] ? val : landUseExtent[1]
    landUseInCountry[d.Year] = val
    lastArea = d.Area
  })
  landUse[lastArea] = landUseInCountry


  /* Country color scale*/
  colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain(landUseExtent)

  countries = topojson.feature(world, world.objects.countries).features;
  names.forEach((d) => {
    countryMap.set(parseInt(d["id"]), d["name"]);
  })

  /* Drawing countries */
  svg.insert("path", ".graticule")
  .datum(topojson.feature(world, world.objects.land))
  .attr("class", "land")
  .attr("d", path);
  svg.insert("path", ".graticule")
  .datum(topojson.mesh(world, world.objects.countries))
  .attr("class", "boundary")
  .attr("d", path);

  /* Bar graph Visualization */
  name_array=["India", "China", "Afghanistan", "Canada", "Lebanon"];
  let xscale=d3.scaleLinear()
  .domain([0, 200000])
  .range([600, 1000]);

  let barscale=d3.scaleLinear()
  .domain([0, 200000])
  .range([0, 400]); 

  let yscale=d3.scaleBand()
  .domain(name_array)
  .range([50, 650]);

  var x_axis = d3.axisBottom()
  .scale(xscale)

  var y_axis = d3.axisLeft()
  .scale(yscale);

  svg.append("g")
  .attr("transform","translate("+ 200 +","+ 650+")")
  .call(x_axis);

  svg.append("g")
  .attr("transform","translate("+ 800+","+ 0 +")")
  .call(y_axis);

  const cropFunction = (waste, production) => {
    return () => {
      waste_current=waste.filter(d=> d['Year']==currentYear); 
      console.log(currentYear); 
      production_current=production.filter(d=> d['Year']==currentYear); 
      length=name_array.length;  
      console.log(waste_current); 
      console.log(production_current)
      for (x in name_array) {
          waste_of_countries=waste_current.filter(d=> d['Country']==name_array[x]);
          prod_of_countries=production_current.filter(d=> d['Country']==name_array[x]);
          waste_of_countries=waste_of_countries[0].Value;
          prod_of_countries=prod_of_countries[0].Value;
          waste_of_countries=Number(waste_of_countries); 
          prod_of_countries=Number(prod_of_countries);
          console.log(waste_of_countries) 
          console.log(prod_of_countries)
          let rect1=svg.append("rect") 
            .attr("width", barscale(prod_of_countries))
            .attr("height", 30)
            .attr("x", 800)
            .attr("y", 100+x*(600/length))
            .style("fill", "white"); 
          let rect2=svg.append("rect") 
            .attr("width", barscale(waste_of_countries))
            .attr("height", 30)
            .attr("x", 800)
            .attr("y", 100+x*(600/length))
            .style("fill", "red"); 
      }
    }
  }

  document.getElementById('wheat').onclick = cropFunction(cereal_waste, cereal_production)
  document.getElementById('sugar').onclick = cropFunction(sugar_waste, sugar_production)
  document.getElementById('starch').onclick = cropFunction(starch_waste, starch_production)

  // document.getElementById('wheat').onclick = function() {
  //   waste_current=cereal_waste.filter(d=> d['Year']==currentYear); 
  //   console.log(currentYear); 
  //   production_current=cereal_production.filter(d=> d['Year']==currentYear); 
  //   length=name_array.length;  
  //   console.log(waste_current); 
  //   console.log(production_current)
  //   for (x in name_array) {
  //       waste_of_countries=waste_current.filter(d=> d['Country']==name_array[x]);
  //       prod_of_countries=production_current.filter(d=> d['Country']==name_array[x]);
  //       waste_of_countries=waste_of_countries[0].Value;
  //       prod_of_countries=prod_of_countries[0].Value;
  //       waste_of_countries=Number(waste_of_countries); 
  //       prod_of_countries=Number(prod_of_countries);
  //       console.log(waste_of_countries) 
  //       console.log(prod_of_countries)
  //       let rect1=svg.append("rect") 
  //         .attr("width", barscale(prod_of_countries))
  //         .attr("height", 30)
  //         .attr("x", 800)
  //         .attr("y", 100+x*(600/length))
  //         .style("fill", "white"); 
  //       let rect2=svg.append("rect") 
  //         .attr("width", barscale(waste_of_countries))
  //         .attr("height", 30)
  //         .attr("x", 800)
  //         .attr("y", 100+x*(600/length))
  //         .style("fill", "red"); 
  //   }
  //   }

  //   document.getElementById('sugar').onclick = function() {
  //     waste_current=sugar_waste.filter(d=> d['Year']==currentYear); 
  //     production_current=sugar_production.filter(d=> d['Year']==currentYear); 
  //     length=name_array.length;  
  //     console.log(waste_current); 
  //     for (x in name_array) {
  //       console.log(name_array[x])
  //       console.log(waste_current['Country'])
  //         waste_of_countries=waste_current.filter(d=> d['Country']==name_array[x]);
  //         prod_of_countries=production_current.filter(d=> d['Country']==name_array[x]);
  //         console.log(waste_of_countries); 
  //         waste_of_countries=waste_of_countries[0].Value;
  //         prod_of_countries=prod_of_countries[0].Value;
  //         waste_of_countries=Number(waste_of_countries); 
  //         prod_of_countries=Number(prod_of_countries);
  //         let rect1=svg.append("rect") 
  //           .attr("width", barscale(prod_of_countries))
  //           .attr("height", 30)
  //           .attr("x", 800)
  //           .attr("y", 100+x*(600/length))
  //           .style("fill", "white"); 
  //         let rect2=svg.append("rect") 
  //           .attr("width", barscale(waste_of_countries))
  //           .attr("height", 30)
  //           .attr("x", 800)
  //           .attr("y", 100+x*(600/length))
  //           .style("fill", "red"); 
  //     }
  //     }
  //   document.getElementById('starch').onclick = function() {
  //     starch_current=starch_waste.filter(d=> d['Year']==currentYear); 
  //     console.log(currentYear); 
  //     production_current=starch_production.filter(d=> d['Year']==currentYear); 
  //     length=name_array.length;  
  //     console.log(starch_current); 
  //     console.log(production_current)
  //     for (x in name_array) {
  //         waste_of_countries=starch_current.filter(d=> d['Country']==name_array[x]);
  //         prod_of_countries=production_current.filter(d=> d['Country']==name_array[x]);
  //         waste_of_countries=waste_of_countries[0].Value;
  //         prod_of_countries=prod_of_countries[0].Value;
  //         waste_of_countries=Number(waste_of_countries); 
  //         prod_of_countries=Number(prod_of_countries);
  //         console.log(waste_of_countries) 
  //         console.log(prod_of_countries)
  //         let rect1=svg.append("rect") 
  //           .attr("width", barscale(prod_of_countries))
  //           .attr("height", 30)
  //           .attr("x", 800)
  //           .attr("y", 100+x*(600/length))
  //           .style("fill", "white"); 
  //         let rect2=svg.append("rect") 
  //           .attr("width", barscale(waste_of_countries))
  //           .attr("height", 30)
  //           .attr("x", 800)
  //           .attr("y", 100+x*(600/length))
  //           .style("fill", "red"); 
  //     }
  //     }


  countries.forEach((country) => {
    let id = parseInt(country.id);
    let name = countryMap.get(id);
    svg.insert("path", ".graticule")
    .datum(country)
    .attr("fill", landUse[name] ?  colorScale(landUse[name][currentYear]): "lightgray")
    .attr("d", path)
    .attr("class", "clickable")
    .attr("country-id", id)
    .on("click", function() {
      d3.selectAll(".clicked")
      .classed("clicked", false);
      redraw();
      d3.select(this)
      .classed("clicked", true)
      .attr("fill", colors.clicked);
			country= countryMap.get(id);
      document.getElementById("country-selected").innerText = "Country Selected: "+ countryMap.get(id);
    })
    .on("mousemove", function(country) {
      var c = d3.select(this);
      id = parseInt(country.id);
      var hoveredCountry = countryMap.get(id);
      document.getElementById("country-name").innerText = "Hovered over: "+hoveredCountry;
      if (c.classed("clicked")) {
        c.attr("fill", colors.clickhover);
      } else {
        c.attr("fill", colors.hover);
      }
    })
    .on("mouseout", function(country) {
      var c = d3.select(this);
      var name = countryMap.get(parseInt(country.id))
      if (c.classed("clicked")) {
        c.attr("fill", colors.clicked);
        selectedCountry = countryMap.get(country.id);
      } else {
        d3.select(this).attr("fill", landUse[name] ?  colorScale(landUse[name][currentYear]): "lightgray");
      }
    });
  })
  initSpin();
  refresh();
};
ready();

/* Synchronize all globe elements with its rotation */
function refresh() {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".boundary").attr("d", path);
  svg.selectAll(".clickable").attr("d", path);
  svg.selectAll(".countries path").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
}

/* Recolor the countries according to name and year */
function redraw() {
  svg.selectAll(".clickable")
    .each(function(d, _) {
      id = parseInt(d3.select(this).attr("country-id"))
      name = countryMap.get(id)
      d3.select(this).attr("fill", landUse[name] ?  colorScale(landUse[name][currentYear]): "lightgray")
    })
}

const initSpin = () => {timer = d3.timer(rotate);}
const stopSpinning = () => {timer.stop();}
const startSpinning = () => {timer.restart(rotate);}
var rotate = () => {
  if (direction < 0) theta = theta - VELOCITY;
  else theta = theta + VELOCITY;
  proj.rotate([theta,0]);
  refresh();
};

var dataTime = []
for (var i = 1972; i <= 2016; i+=4) {
  dataTime.push(i);
}

/* Slider */
const sliderWidth = 550;
var slider = d3.sliderHorizontal()
.min(d3.min(dataTime))
.max(d3.max(dataTime))
.step(1)
.tickFormat(d3.format("d"))
.tickValues(dataTime)
.width(sliderWidth)
.displayValue(true)
.on('onchange', val => {
  currentYear = val.toString();
  redraw();
});

var start = WIDTH/3 - sliderWidth/2;
svg.append("g")
.attr('transform', 'translate('+ start +',650)')
.call(slider);

/* Buttons */
svg.select("#pauseButton")
  .on("click", () => {stopSpinning();})

svg.select("#playButton")
  .on("click", () => {startSpinning();})
  
svg.select("#lButton")
  .on("mousedown", () => {
    stopSpinning();
    direction = -1;
    startSpinning();
  })
  .on("mouseup", () => {
    stopSpinning();
    direction = 1;
  })

svg.select("#rButton")
  .on("mousedown", () => {
    stopSpinning();
    startSpinning();
  })
  .on("mouseup", () => {
    stopSpinning();
  })
