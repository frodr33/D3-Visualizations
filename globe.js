const WIDTH = 950;
const HEIGHT = 700;
var ROTATION = [40, 0];
var VELOCITY = [.005, .000];
var time = Date.now();
var proj = d3.geoOrthographic().translate([WIDTH / 3, HEIGHT / 2]);
var path = d3.geoPath().projection(proj);
var graticule = d3.geoGraticule();
var wasDragged = false;
var timer;
var countryMap = new Map();
var colors = { clickable: 'green', hover: 'grey', clicked: "red", clickhover: "darkred" };


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
  world = await d3.json("world-110m.v1.json");
  names = await d3.tsv("world-country-names.tsv")
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

  // There is an undefined here, must filter stuff first
  countries.forEach((country) => {
    //   console.log(country);
      id = parseInt(country.id);

      svg.insert("path", ".graticule")
        .datum(country)
        .attr("fill", colors.clickable)
        .attr("d", path)
        .attr("class", "clickable")
        .attr("country-id", id)
        .on("click", function() {
            d3.selectAll(".clicked")
                .classed("clicked", false)
                .attr("fill", colors.clickable)
            d3.select(this)
                .classed("clicked", true)
                .attr("fill", colors.clicked)
        })
        .on("mousemove", function(country) {
            var c = d3.select(this);
            id = parseInt(country.id);
            var hoveredCountry = countryMap.get(id);
            document.getElementById("country-name").innerText = hoveredCountry;
            if (c.classed("clicked")) {
              c.attr("fill", colors.clickhover);
            } else {
              c.attr("fill", colors.hover);
            }
        })
        .on("mouseout", function(country) {
            var c = d3.select(this);
            if (c.classed("clicked")) {
              c.attr("fill", colors.clicked);
              selectedCountry = countryMap.get(country.id);
            } else {
              d3.select(this).attr("fill", colors.clickable);
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
    .min(1980)
    .max(2019)
    .step(1)
    .width(sliderWidth)
    .displayValue(true)
    .on('onchange', val => {
        console.log("value changed")
});

var start = WIDTH/3 - sliderWidth/2;
svg.append("g")
    .attr('transform', 'translate('+ start +',650)')
    .call(slider);
