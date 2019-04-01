/* Constants */
var WIDTH = 950;
const HEIGHT = 700;
var ROTATION = [40, 0];
var VELOCITY = [.005, .000];
var time = Date.now();
var proj = d3.geoOrthographic().translate([WIDTH / 2, HEIGHT / 2]);
var path = d3.geoPath().projection(proj);
var graticule = d3.geoGraticule();
var wasDragged = false;
var timer;

var svg = d3.select("body").append("svg")
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
  svg.insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);
  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries))
      .attr("class", "boundary")
      .attr("d", path);

    initSpin();
  	refresh();
};
ready();

function refresh() {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".boundary").attr("d", path);
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