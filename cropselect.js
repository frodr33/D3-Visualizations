var cropType= null;

function selectCropType(id) {
	if (cropType !== null) {
		document.getElementById(cropType).style.border= "solid transparent 5px";
	}
	cropType=id.id;
	console.log("item: "+cropType);
	document.getElementById(cropType).style.border= "solid var(--cs-url) 5px";
}
