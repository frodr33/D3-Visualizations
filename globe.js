const WIDTH = 1300;
const HEIGHT = 700;
let ROTATION = [40, 0];
let VELOCITY = [.005, .000];
let time = Date.now();
let proj = d3.geoOrthographic().translate([WIDTH / 3, HEIGHT / 2]);
let path = d3.geoPath().projection(proj);
let graticule = d3.geoGraticule();
let wasDragged = false;
let timer;
let countryMap = new Map();
let colors = { clickable: 'green', hover: 'grey', clicked: "red", clickhover: "darkred" };
let currentYear = 1970;

var country= null;
var svg = d3.select("#svg1").append("svg")
.attr("width", WIDTH)
.attr("height", HEIGHT)
.attr("class", "svg");

svg.call(d3.drag()
.on("start", dragstarted)
.on("drag", dragged)
.on("end", dragEnded));

svg.append("path")
.datum(graticule)
.attr("class", "graticule")
.attr("d", path);

const ready = async () => {
  let world = await d3.json("world-110m.v1.json");
  let names = await d3.tsv("world-country-names.tsv")
  let land = await d3.csv("landForAgri.csv")
  let sugar_waste= await d3.csv("datasets/Loss_sugarcrops.csv")
  let cereal_waste= await d3.csv("datasets/Loss_cerealcrops.csv")
  let starch_waste= await d3.csv("datasets/Loss_starchcrops.csv")
  let cereal_production= await d3.csv("datasets/Production_cerealcrops.csv")
  let sugar_production= await d3.csv("datasets/Production_sugarcrops.csv")
  let starch_production= await d3.csv("datasets/Production_starchcrops.csv")

  let landUse = {};
 

  let landUseExtent = [100, 0] // min, max

  /* Deserializing csv into landUse object */
  let lastArea = "Afghanistan";
  let landUseInCountry = {}
  land.forEach((d, _) => {
    if (lastArea !== d.Area) {
      // Hard coding differences in
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

      if (lastArea == "Congo") landUse["Congo, the Democratic Republic of the"] = landUseInCountry // Questionable
      if (lastArea == "Sudan") landUse["South Sudan"] = landUseInCountry // Questionable
      landUseInCountry = {}
    }
    let val = parseFloat(d.Value)
    landUseExtent[0] = val < landUseExtent[0] ? val : landUseExtent[0]
    landUseExtent[1] = val > landUseExtent[1] ? val : landUseExtent[1]
    landUseInCountry[d.Year] = val
    lastArea = d.Area
  })
  landUse[lastArea] = landUseInCountry
  console.log(landUse)
  console.log(landUseExtent)

  /* Country color scale*/
  let colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain(landUseExtent)

  countries = topojson.feature(world, world.objects.countries).features;
  names.forEach((d) => {
    countryMap.set(parseInt(d["id"]), d["name"]);
  })

  svg.insert("path", ".graticule")
  .datum(topojson.feature(world, world.objects.land))
  .attr("class", "land")
  .attr("d", path);
  svg.insert("path", ".graticule")
  .datum(topojson.mesh(world, world.objects.countries))
  .attr("class", "boundary")
  .attr("d", path);

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


document.getElementById('wheat').onclick = function() {
  waste_current=cereal_waste.filter(d=> d['Year']==currentYear); 
  console.log(currentYear); 
  production_current=cereal_production.filter(d=> d['Year']==currentYear); 
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

  document.getElementById('sugar').onclick = function() {
    waste_current=sugar_waste.filter(d=> d['Year']==currentYear); 
    production_current=sugar_production.filter(d=> d['Year']==currentYear); 
    length=name_array.length;  
    console.log(waste_current); 
    for (x in name_array) {
      console.log(name_array[x])
      console.log(waste_current['Country'])
        waste_of_countries=waste_current.filter(d=> d['Country']==name_array[x]);
        prod_of_countries=production_current.filter(d=> d['Country']==name_array[x]);
        console.log(waste_of_countries); 
        waste_of_countries=waste_of_countries[0].Value;
        prod_of_countries=prod_of_countries[0].Value;
        waste_of_countries=Number(waste_of_countries); 
        prod_of_countries=Number(prod_of_countries);
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
  document.getElementById('starch').onclick = function() {
    starch_current=starch_waste.filter(d=> d['Year']==currentYear); 
    console.log(currentYear); 
    production_current=starch_production.filter(d=> d['Year']==currentYear); 
    length=name_array.length;  
    console.log(starch_current); 
    console.log(production_current)
    for (x in name_array) {
        waste_of_countries=starch_current.filter(d=> d['Country']==name_array[x]);
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

  // There is an undefined here, must filter stuff first
  countries.forEach((country) => {
    //   console.log(country);
    id = parseInt(country.id);
    name = countryMap.get(id);

    svg.insert("path", ".graticule")
    .datum(country)
    .attr("fill", landUse[name] ?  colorScale(landUse[name][currentYear]): "lightgray")
    .attr("d", path)
    .attr("class", "clickable")
    .attr("country-id", id)

    .on("click", function() {
      console.log(landUse[name][currentYear])
      console.log(colorScale(landUse[name][currentYear]))
      d3.selectAll(".clicked")
      .classed("clicked", false)
      .attr("fill",landUse[name] ?  colorScale(landUse[name][currentYear]): "lightgray")
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

function refresh() {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".boundary").attr("d", path);
  svg.selectAll(".clickable").attr("d", path);
  svg.selectAll(".countries path").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
  if (wasDragged) {
    wasDragged = false;
    setTimeout(() => {
      startSpinning();
    }, 3000)
  }
}


var rotate = () => {
  var dt = Date.now() - time;
  proj.rotate([ROTATION[0] + VELOCITY[0] * dt,0]);
  refresh();
};

const initSpin = () => {timer = d3.timer(rotate)}
const stopSpinning = () => {timer.stop()}
const startSpinning = () => {timer.restart(rotate)}

function dragstarted() {
  wasDragged = false;
  timer.stop();
  v0 = versor.cartesian(proj.invert(d3.mouse(this)));
  r0 = proj.rotate();
  q0 = versor(r0);
  stopSpinning();
}

function dragged() {
  var v1 = versor.cartesian(proj.rotate(r0).invert(d3.mouse(this))),
  q1 = versor.multiply(q0, versor.delta(v0, v1)),
  r1 = versor.rotation(q1);

  ROTATION[0] = r1[0];
  proj.rotate(r1);
}

function dragEnded() {
  wasDragged = true;
  refresh();
}

/* Slider */
const sliderWidth = 550;
var slider =
d3.sliderHorizontal()
.min(1970)
.max(2016)
.step(1)
.width(sliderWidth)
.displayValue(true)
.on('onchange', val => {
  currentYear = val.toString();
});

var start = WIDTH/3 - sliderWidth/2;
svg.append("g")
.attr('transform', 'translate('+ start +',650)')
.call(slider);
