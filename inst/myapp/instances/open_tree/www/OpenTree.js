var errormsg = "";

var width = 700,
	height = 500;

var depth;
var numTerminal;

var multiplier = 1.5; // for spacing between tree's branches

var numnodes = 0;

var opac = 0.7; // default opacity of tooltips

var ttw = 150; // default width of tooltips

var root; // store data in a variable accessible by all functions

var tree = d3.layout.tree()
	.size([height, width - 160]);

var cluster = d3.layout.cluster()
	.size([height, width - 160]);

var diagonal = d3.svg.diagonal()
    .projection(function (d) {
    return [d.y, d.x];
});

var nodeToCopy;

var blank = 1; //load the blank tree first

function getShape(type) {
      if(type=="chance"){
            return "circle";
      } else if (type == "markov") {
            return "diamond";
      } else if (type == "decision") {
            return "square";
       } else if (type=="terminal"){
             return "triangle-up";
      }
}

function getColor(type) {
	if(type == "chance") {
		return "green";
	} else if (type == "decision") {
		return "blue";
	} else if (type=="terminal"){
		return "red";
	} else if (type=="markov") {
		return "#620062";
	} else {
		return "white";
	}
}

function getBlankTree() {
	return {
		"name":"",
		"type":"root",
		"probability":"",
		"variables":"",
		"payoff":"",
		"children":[{
			"id":"node1",
			"name":"root",
			"type":"decision",
			"probability":"",
			"variables":"",
			"payoff":""
		}]
	};
}

function addShortProps(match, proptext, probability, delimit) {
	var shortprop = probability;

	if(probability.length > 15)
		shortprop = probability.substring(0,15) + "...\"";

	var fulltext = "\n\"probability_short\": "+shortprop+",\n"+proptext+probability + delimit;
	return fulltext;
}

function getUserJSON() {
	var json = document.getElementById('userJSONtext').value;

	var newjson = json.replace(/("probability":)(.+?)([,\n])/g, addShortProps);

	var outerjson = "{\"name\":\"\",\n\"type\":\"root\",\n\"probability\":\"\",\n\"variables\":\"\",\n\"payoff\":\"\",\n\"children\":[" + newjson + "]}";

	try {
		var jsonobj = JSON.parse(outerjson);
		return jsonobj;
	} catch (e) {
		errormsg = e;
		console.log(e);
		return false;
	}
	console.log("GETUSERJSON", json)
}

function validateJSON() {
	var json = document.getElementById('userJSONtext').value;
	var outerjson = "{\"name\":\"\",\n\"type\":\"root\",\n\"probability\":\"\",\n\"variables\":\"\",\n\"payoff\":\"\",\n\"children\":[" + json + "]}";
	try {
		var jsonobj = JSON.parse(outerjson);

		return true;
	} catch (e) {
		errormsg = e;
		return false;
	}
}

function getData(blank) {
	if (blank == 1) {
		return getBlankTree();
	} else  {
		return getUserJSON();
	}
}

function copyBranch() {
	var selection = d3.select(".node.selected")[0][0];

	if(selection) {
	  nodeToCopy = selection.__data__;
	} else {
		nodeToCopy = null;
	}
}

var copyChildren = function(d,nodeid) {

	var selection = d3.select("#" + nodeid);
	var data = selection[0][0].__data__;
	var dir = 'right';
	var name = d.name;
	var props = d.probability;
	var pay = d.payoff;
	var nodeType = d.type;
	var short_props = d.probability_short;
	var vars = d.variables;
	var oldid = d.id;
	var nodeid = "";
	numnodes++;

	var previd;

	if (data.children || data._children) {
		if (data.children.length > 0) {

			previd = data.children[data.children.length-1].id;

			var prev = previd.split("_");
			var i = 0;
			for (i; i < prev.length-1; i++) {
				nodeid += prev[i] + "_";
			}
			var newnum = parseInt(prev[i]) + 1;
			nodeid += newnum;
		}
	} else {
		nodeid = data.id + "_1";
	}

	if (d.id == d.name) {
		name = nodeid;
	}

	var cl = data[dir] || data.children || data._children;

	if(!cl) {
		cl = data.children = [];
	}

	cl.push({name: name, probability_short: short_props, probability: props, variables: vars, payoff: pay, position: dir, type: nodeType, id:nodeid});

	update(1);

	if (d.children || d._children) {

		d.children.forEach(function (d) {
			copyChildren(d,nodeid);
		});
	}
}


function pasteBranch() {

	var selection = d3.select(".node.selected")[0][0];
	var selectedid = d3.select(".node.selected")[0][0].__data__.id; // id of node we will paste to

	if (selection) {

		var data = selection.__data__;

		if (nodeToCopy.children) {
			var pasteid = data.id;

			if (pasteid.match("^" + nodeToCopy.id)) {
				alert("Recursive copy is not permitted.");
				return;
			} else {
				nodeToCopy.children.forEach(function (d) {

					copyChildren(d,selectedid);
				});
			}
		}
		update(1);
	}
	nodeToCopy = null;
}

/*
 * Get depth of tree (or branch)
 */
var getDepth = function (obj) {
	var tdepth = 0;
	if (obj.children) {
		obj.children.forEach(function (d) {
			var tmpDepth = getDepth(d);
			if (tmpDepth > tdepth) {
				tdepth = tmpDepth;
			}
		})
	}
	return 1 + tdepth;
}

/*
 * Count total nodes in tree
 */
var treeCount = function (branch) {
	if (!branch.children) {
		return 1;
	}
	return branch.children.reduce(function (c, b) {
		return c + treeCount(b);
	}, 0)
}



var svg = d3.select("body #treeDiv").append("svg")
	.attr({
		'xmlns': 'http://www.w3.org/2000/svg',
		'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink',
		version: '1.1'
	})
	.attr("id","canvas")
	.attr("width", width)
	.attr("height", height*multiplier)
	.append("g")
	.attr("transform", "translate(40,0)");

var root = getData(blank);
depth = getDepth(root);
numTerminal = treeCount(root);
width = 150 + (120 * depth );
height = 20 + (30 * numTerminal);
tree = d3.layout.tree()
	.size([height, width - 160]);

cluster = d3.layout.cluster()
	.size([height, width - 160]);

nodes = cluster.nodes(root),
links = cluster.links(nodes);

var link = svg.selectAll(".link")
	.data(links)
	.enter()
	.append("path")
	.attr("class", "link")
	.style("stroke", "#8da0cb")
	.attr("d", elbow);

var node = svg.selectAll(".node")
	.data(nodes)
	.enter()
	.append("g")
	.attr("class", function(d){ return d.selected?"node selected":"node"; })
	.attr("transform", function (d) {
		return "translate(" + d.y + "," + d.x*multiplier + ")";
	})
	.attr("id",function(d) { numnodes++; return d.id; })
	.on("click", function (d) { select(this); })
	.on("dblclick", function (d) {
		div.transition()
			.duration(100)
			.style("opacity", 0);
		insertNode();
	 })
	.on("mouseover", function(d) {
		if (d.type != "root") {
			div.transition()
				.duration(100)
				.style("opacity", opac);

			div.html(
				"<strong>Probability:</strong> " + d.probability.replace(/\n/gi, "<br/>") + "<br/>" +
				// "<strong>Variables:</strong> " + d.variables.replace(/\n/gi, "<br/>") + "<br/>" +
				(d.children && d.payoff=="" ? "" :"<strong>Payoff:</strong> " + d.payoff.replace(/\n/gi, "<br/>"))
			)
			.style("left", (d3.event.pageX - ttw-15) + "px")
			.style("width",(ttw) + "px")
			.style("top", (d3.event.pageY + 10) + "px");
			hovershow(d);
		}
	})
	.on("mouseout", function(d) {
		div.transition()
			.duration(100)
			.style("opacity", 0);
		hoverhide();
	});

node.append("path")
	.attr("d", d3.svg.symbol()
		.size(150)
		.type(function(d) {return getShape(d.type);})
	)
	.attr("transform", "rotate(270)")
	.style("stroke", function(d){ return getColor(d.type);})
	.style("stroke-width","2.5");

node.append("text")
	.attr("dx", -10)
	.attr("dy", -5)
	.style("text-anchor","end")
	.text(function (d) { return d.name; })
	.on("mouseover", function (d) { return hovershow(d);

	})
	.on("mouseout", function (d) { return hoverhide();

	});

node.append("text")
	.attr("dx", -13)
	.attr("dy", 10)
	.style("text-anchor","end")
	.text(function (d) { return d.probability_short; })
	.on("mouseover", function (d) { return hovershow(d);})
	.on("mouseout", function (d) { return hoverhide();});

node.append("text")
	.attr("dx", 15)
	.attr("dy", 2)
	.style("text-anchor","start")
	.text(function (d) { return d.children ? "" : d.payoff; })
	.on("mouseover", function (d) { return hovershow(d);})
	.on("mouseout", function (d) { return hoverhide();});

// add the tool tip
var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var tmprt = d3.select("#node1").classed("selected",true);
txtNodeName.value = tmprt[0][0].__data__.name;
nodeProbability.value = tmprt[0][0].__data__.probability;
nodePayoff.value = tmprt[0][0].__data__.payoff;
nodeVariables.value = tmprt[0][0].__data__.variables;
var nodebuttons = document.getElementsByName('radNodeType');

for (i = 0; i < nodebuttons.length; i++) {
	if (nodebuttons[i].value == tmprt[0][0].__data__.type) {
		nodebuttons[i].checked = true;
	} else {
		nodebuttons[i].checked = false;
	}
}

var select = function(node){

	// Find previously selected, unselect
	d3.select(".selected>circle").style("fill", "white");
	d3.select(".selected").classed("selected", false);

	// Select current item
	d3.select(node).classed("selected", true);

	var selection = d3.select(".node.selected")[0][0];

	d3.select(".node.selected>circle").style("fill","orange");

	if (selection) {
		var data = selection.__data__;
		txtNodeName.value = data.name;
		nodeProbability.value = data.probability;
		nodePayoff.value = data.payoff;
		nodeVariables.value = data.variables;

		var nodebuttons = document.getElementsByName('radNodeType');

		for (i = 0; i < nodebuttons.length; i++) {

			if (nodebuttons[i].value == data.type) {
				nodebuttons[i].checked = true;
			} else {
				nodebuttons[i].checked = false;
			}
		}
	}
};

/*
 * Insert new node
 */
function insertNode (){

	var selection = d3.select(".node.selected")[0][0];

	if (selection) {
		var data = selection.__data__;
		var dir = 'right';
		var name = "";

		var props = "";
		var pay = "";
		var vars = "";
		var nodeType = "chance";
		var addlevel = 2; // add height

		var cl = data[dir] || data.children || data._children;
		var nodeid = "";
		if(!cl){
			cl = data.children = [];
			addlevel = 1; // add width
			nodeid=data.id + "_1";
		} else {
			var previd = data.children[data.children.length-1].id;
			var prev = previd.split("_");

			for (i=0; i<prev.length-1; i++)
				nodeid += prev[i] + "_";
			var newnum = parseInt(prev[i]) + 1;

			nodeid += newnum
		}
		var short_props = props.replace(/\n/gi,";");
		if (props.length > 15) {
			short_props = props.substring(0,16).replace(/\n/gi,";") + "..." ;
		}

		numnodes++;
		name = nodeid;
		cl.push({id: nodeid, name: name, probability_short: short_props, probability: props, variables: vars, payoff: pay, position: dir, type: nodeType, id:nodeid});

		update(addlevel);
	}
	console.log("Me estoy ejecutando Insertando");
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando Insertando json");
	Shiny.setInputValue("jsonData", download());
	//console.log(elemnt);


}

/*
 * Bind insert and ctrl-n keys to Insert new node
 */
Mousetrap.bind(['ins','ctrl+n'], function() {
	insertNode();
});

/*
 * Delete branch
 */
function deleteBranch() {
	var selection = d3.select(".node.selected")[0][0];
	if(selection){
		var data = selection.__data__;
		var dir = 'right';
		if(data.type === 'root'){
			alert('Can\'t delete root');
			return;
		}
		var cl = data.parent[dir] || data.parent.children;
		if(!cl){
			alert('Could not locate children');
			return;
		}
		var i = 0, l = cl.length;
		var childrentext = "";

		if(data.children) {
			numnodes = numnodes - data.children - 1;
			childrentext = " and all of its children";
		}
		for(; i<l; i++){
			if(cl[i].name === data.name){
				if(confirm('Sure you want to delete '+data.name+childrentext+'?') === true) {
					cl.splice(i, 1);
				}
				break;
			}
		}
		update(root);
	}
	//Flag
	console.log("Me estoy ejecutando eliminando");
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando eliminando json");
	Shiny.setInputValue("jsonData", download());


}

/*
 * Bind delete key to deleteBranch()
 */
Mousetrap.bind('del', function(){
	deleteBranch();
});

/*
 * update the tree and redraw
 */
function update(addlevel) {
	 var n = 0;

	// remember which node was selected, so we can reselect it after we redraw the updated tree
	var selectedid = d3.select(".node.selected")[0][0].__data__.id;

	depth = getDepth(root);
	width = 150 + (120 * depth );
	numTerminal = treeCount(root);
	height = 20 + (30 * numTerminal);

	d3.select("svg").remove();

	tree = d3.layout.tree()
		.size([height, width - 160]);

	cluster = d3.layout.cluster()
		.size([height, width - 160]);

	svg = d3.select("body #treeDiv").append("svg")
		.attr("id","canvas")
		.attr("width", width)
		.attr("height", height*multiplier)
		.append("g")
		.attr("transform", "translate(40,0)");

	nodes = cluster.nodes(root),
		links = cluster.links(nodes);

	link = svg.selectAll(".link")
		.data(links)
		.enter()
		.append("path")
		.attr("class", "link")
		.style("stroke", "#8da0cb")
		.attr("d", elbow);

	node = svg.selectAll(".node")
		.data(nodes)
		.enter()
		.append("g")
		.attr("class", function(d){ return d.selected?"node selected":"node"; })
		.attr("transform", function (d) {
			return "translate(" + d.y + "," + d.x*multiplier + ")";
		})
		.attr("id",function (d) { return d.id;} )
		.on("click", function (d) {
			select(this);
			console.log(this.x);

			//Flag
			console.log("Me estoy ejecutando div");
			Shiny.setInputValue("jsValue", printCSV());
			console.log("Me estoy ejecutando div json");
	    Shiny.setInputValue("jsonData", download());


		})
		.on("dblclick", function (d) {
			div.transition()
				.duration(100)
				.style("opacity", 0);
				insertNode();
				//Flag
				//Shiny.setInputValue("jsValue", test);

		})
		.on("mouseover", function(d) {
			if (d.type != "root") {
				div.transition()
					.duration(100)
					.style("opacity", opac);

				div.html(
					"<strong>Probability:</strong> " + d.probability.replace(/\n/gi, "<br/>") + "<br/>" +
					// "<strong>Variables:</strong> " + d.variables.replace(/\n/gi, "<br/>") + "<br/>" +
					(d.children && d.payoff=="" ? "" :"<strong>Payoff:</strong> " + d.payoff.replace(/\n/gi, "<br/>"))
				)
				.style("left", (d3.event.pageX - ttw-15) + "px")
				.style("width",(ttw) + "px")
				.style("top", (d3.event.pageY + 10) + "px");
				hovershow(d);
			}
		})
		.on("mouseout", function(d) {
			div.transition()
				.duration(100)
				.style("opacity", 0);
			hoverhide();
		});

	node.append("path")
		.attr("d", d3.svg.symbol()
			.size(150)
			.type(function(d) {return getShape(d.type);})
		)
		.attr("transform", "rotate(270)")
		.style("stroke", function(d){ return getColor(d.type);})
		.style("stroke-width","2.5");

	node.append("text")
		.attr("dx", -10)
		.attr("dy", -5)
		.style("text-anchor","end")
		.text(function (d) { return d.name; })
		.on("mouseover", function (d) { return hovershow(d);})
		.on("mouseout", function (d) { return hoverhide();});

	node.append("text")
		.attr("dx", -13)
		.attr("dy", 10)
		.style("text-anchor","end")
		.text(function (d) { return d.probability_short; })
		.on("mouseover", function (d) { return hovershow(d);})
		.on("mouseout", function (d) { return hoverhide();});


	node.append("text")
		.attr("dx", 15)
		.attr("dy", 2)
		.style("text-anchor","start")
		.text(function (d) { return d.children ? "" : d.payoff; })
		.on("mouseover", function (d) { return hovershow(d);})
		.on("mouseout", function (d) { return hoverhide();});

	// add the tooltip
	var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	// reselect the selected node
	// Select current item
	var selection = d3.select("#" + selectedid);
	selection.classed("selected", true);

	d3.select(".node.selected>circle").style("fill","orange");

	if(selection[0][0]) {
		var data = selection[0][0].__data__;
		txtNodeName.value = data.name;
		nodeProbability.value = data.probability;
		nodePayoff.value = data.payoff;
		nodeVariables.value = data.variables;

		var nodebuttons = document.getElementsByName('radNodeType');

		for (i = 0; i < nodebuttons.length; i++) {

			if (nodebuttons[i].value == data.type) {
				nodebuttons[i].checked = true;
			} else {
				nodebuttons[i].checked = false;
			}
		}
	}
	//FLAG

}

/*
 * Load the tree - either load an new (empty) tree or load from a file
 * blank == 0 means not blank, blank == 1 means blank
 */
function load(blank) {
  console.log(blank)
  switch (blank) {
      case 1:
      console.log("BLANK1")
      if (!areYouSure() ) {
			return;
		   }
      break;
      case 2:
      console.log("BLANK2")
      if(validateJSON() == false) {
			document.getElementById('errormessages').innerHTML = errormsg;
			return;
		  }
      break;
    default:
      console.log("blank3", blank)
      document.getElementById('userJSONtext').innerHTML = blank;
	  	if(validateJSON() == false) {
			document.getElementById('errormessages').innerHTML = errormsg;

			return;

  }
  }
	document.getElementById('errormessages').innerHTML = "";

	document.getElementById('userJSONdiv').style.display='none'; // this hidden div is used to load the user's JSON file

	numnodes = 0;

	tmprt = getData(blank);
	depth = getDepth(tmprt);
	width = 150 + (120 * depth);
	numTerminal = treeCount(tmprt);
	height = 20 + (30 * numTerminal);

	tree = d3.layout.tree()
	 	.size([height, width - 160]);

	cluster = d3.layout.cluster()
		.size([height, width - 160]);

	root = getData(blank),
		nodes = cluster.nodes(root),
		links = cluster.links(nodes);

	d3.select("svg").remove();

	svg = d3.select("body #treeDiv").append("svg")
		.attr("id","canvas")
		.attr("width", width)
		.attr("height", height*multiplier)
		.append("g")
		.attr("transform", "translate(40,0)");

	link = svg.selectAll(".link")
		.data(links)
		.enter()
		.append("path")
		.attr("class", "link")
		.style("stroke", "#8da0cb")
		.attr("d", elbow);

	node = svg.selectAll(".node")
		.data(nodes)
		.enter()
		.append("g")
		.attr("class", function(d){ return d.selected?"node selected":"node"; })
		.attr("transform", function (d) {
			return "translate(" + d.y + "," + d.x*multiplier + ")";
		})
		.attr("id",function(d) { numnodes++; return d.id; })
		.on("click", function (d) {
			select(this);
			console.log(this.x) })
		.on("dblclick", function (d) {
		 	div.transition()
				.duration(100)
				.style("opacity", 0);
			insertNode();
		})
		.on("mouseover", function(d) {
			if(d.type != "root") {
				div.transition()
					.duration(100)
					.style("opacity", opac);

				div.html(
					"<strong>Probability:</strong> " + d.probability.replace(/\n/gi, "<br/>") + "<br/>" +
					// "<strong>Variables:</strong> " + d.variables.replace(/\n/gi, "<br/>") + "<br/>" +
					(d.children && d.payoff=="" ? "" :"<strong>Payoff:</strong> " + d.payoff.replace(/\n/gi, "<br/>"))
				)
				.style("left", (d3.event.pageX - ttw-15) + "px")
				.style("width",(ttw) + "px")
				.style("top", (d3.event.pageY + 10) + "px");
				hovershow(d);
			}
		})
		.on("mouseout", function(d) {
			div.transition()
				.duration(100)
				.style("opacity", 0);
			hoverhide();
		});

	node.append("path")
		.attr("d", d3.svg.symbol()
			.size(150)
			.type(function(d) {return getShape(d.type);})
		)
		.attr("transform", "rotate(270)")
		.style("stroke", function(d){ return getColor(d.type);})
		.style("stroke-width","2.5");

	node.append("text")
		.attr("dx", -10)
		.attr("dy", -5)
		.style("text-anchor","end")
		.text(function (d) { return d.name; })
		.on("mouseover", function (d) { return hovershow(d);})
		.on("mouseout", function (d) { return hoverhide();});

	node.append("text")
		.attr("dx", -13)
		.attr("dy", 10)
		.style("text-anchor","end")
		.text(function (d) { return d.probability_short; })
		.on("mouseover", function (d) { return hovershow(d);})
		.on("mouseout", function (d) { return hoverhide();});

	node.append("text")
		.attr("dx", 15)
		.attr("dy", 2)
		.style("text-anchor","start")
		.text(function (d) { return d.children ? "" : d.payoff; })
		.on("mouseover", function (d) { return hovershow(d);})
		.on("mouseout", function (d) { return hoverhide();});

	// add the tooltip
	var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	// select the root node
	var tmprt = d3.select("#node1").classed("selected",true);

	txtNodeName.value = tmprt[0][0].__data__.name;
	nodeProbability.value = tmprt[0][0].__data__.probability;
	nodePayoff.value = tmprt[0][0].__data__.payoff;
	nodeVariables.value = tmprt[0][0].__data__.variables;
	var nodebuttons = document.getElementsByName('radNodeType');
	for (i = 0; i < nodebuttons.length; i++) {
		if (nodebuttons[i].value == tmprt[0][0].__data__.type) {
			nodebuttons[i].checked = true;
		} else {
			nodebuttons[i].checked = false;
		}
	}
	// Flag
  //var modroot = cloneForJSON(root.children[0]); // clone the elements of root & its children that we need for json string
	//var jsonstring = JSON.stringify(modroot);
//
	//console.log(jsonstring);
//
	//return(jsonstring);
	console.log("AQUI TAMBIEN ME LANZO PARA OPEN")
	Shiny.setInputValue("jsonData", download());
}

var handleClick = function(d, index){
	select(this);
	update(d);
	console.log(this.x);
	//Flag
	//console.log("Me estoy ejecutando handle click");
};

/*
 * Show tooltip on hover
 */
var hovershow = function(d) {

	txtNodeName.value = d.name;
	nodeProbability.value = d.probability;
	nodePayoff.value = d.payoff;
	nodeVariables.value = d.variables;
	var nodebuttons = document.getElementsByName('radNodeType');
	for (i = 0; i < nodebuttons.length; i++) {
		if (nodebuttons[i].value == d.type) {
			nodebuttons[i].checked = true;
		} else {
			nodebuttons[i].checked = false;
		}
	}
}

/*
 * Hide tooltip when not hovering
 */
var hoverhide = function() {
	// get selected node
	var snode = d3.select(".node.selected")[0][0].__data__
	txtNodeName.value = snode.name;
	nodeProbability.value = snode.probability;
	nodePayoff.value = snode.payoff;
	nodeVariables.value = snode.variables;
	var nodebuttons = document.getElementsByName('radNodeType');
	for (i = 0; i < nodebuttons.length; i++) {
		if (nodebuttons[i].value == snode.type) {
			nodebuttons[i].checked = true;
		} else {
			nodebuttons[i].checked = false;
		}
	}
}


function elbow(d, i) {
	return "M" + d.source.y + "," + d.source.x*multiplier
		+ "V" + d.target.x*multiplier + "H" + d.target.y;
}

/*
 * Increase opacity of tooltip
 */
function increaseOpacity() {
	if ( Math.round(opac*10) < 10 ) {
		opac += 0.1;
		document.getElementById("ttopac").innerHTML = Math.round(opac*100) + "%";
	}
}

/*
 * Decrease opacity of tooltip
 */
function decreaseOpacity() {
	if (Math.round(opac*10) > 0 ) {
		opac -= 0.1;
		document.getElementById("ttopac").innerHTML = Math.round(opac*100) + "%";
	}
}

/*
 * Increase width of tooltip
 */
function increaseTTW() {
	if (ttw < 230) {
		ttw += 5;
		document.getElementById("ttwid").innerHTML = ttw;
	}
}

/*
 * Decrease width of tooltip
 */
function decreaseTTW() {
	if (ttw > 130) {
		ttw -= 5;
		document.getElementById("ttwid").innerHTML = ttw;
	}
}

/*
 * Clone the bits of the d3 object we need to create the json string and leave off the stuff that makes it cyclic (i.e., parent)
 * First copy the root, then recursively copy all children
 */
function cloneForJSON(r) {
	var copyobj = {id: r["id"], name: r["name"], type: r["type"], probability: r["probability"], variables: r["variables"], payoff: r["payoff"]};

	if(r.children || r._children) {
		copyobj.children = [];
		var counter = 0;
		r.children.forEach(function (child) {
			cloneChildrenForJSON(copyobj.children,child, counter++);
		});
	}
	return copyobj;
}

/*
 * recursive function to clone the children, just the stuff we need for json string
 */
function cloneChildrenForJSON(copyobj, r, counter) {

	copyobj.push({id: r.id, name: r.name, type: r.type, probability: r.probability, variables: r.variables, payoff: r.payoff});
	if(r.children || r._children) {
		copyobj[counter].children = [];
		var childcounter = 0
		r.children.forEach(function (child) {
			cloneChildrenForJSON(copyobj[counter].children,child, childcounter++);
		});
	}
}


/*
 * Download the tree as a JSON file with name tree.json
 * To do: make filename editable
 */
function download() {

	var modroot = cloneForJSON(root.children[0]); // clone the elements of root & its children that we need for json string
	var jsonstring = JSON.stringify(modroot);

	var element = document.createElement('a');
	element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonstring));
	element.setAttribute('download', "tree.json");
	element.style.display = 'none';
	document.body.appendChild(element);

	//element.click();
	document.body.removeChild(element);
	//Flag
	console.log(jsonstring);

	return(jsonstring);
}

/*
 * Download the tree as a JSON file with name tree.json
 * To do: make filename editable
 */
function download_save() {

	var modroot = cloneForJSON(root.children[0]); // clone the elements of root & its children that we need for json string
	var jsonstring = JSON.stringify(modroot);

	var element = document.createElement('a');
	element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonstring));
	element.setAttribute('download', "tree.json");
	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();
	document.body.removeChild(element);

}

/*
 * Update the node's name
 */
function nodeNameChange() {
	var selection = d3.select(".node.selected")[0][0];
	if(selection){
		var data = selection.__data__;
		data.name = newname = document.getElementById("txtNodeName").value;
		update(0); // 0 because we're not adding any new levels, just updating.
	}
	console.log("Me estoy ejecutando cambiando nombre")
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando cambiando json");
	Shiny.setInputValue("jsonData", download());

}

/*
 * Update the node's probability
 */
function probabilityChange() {
	var selection = d3.select(".node.selected")[0][0];
	if(selection){
		var data = selection.__data__;
		var prob = document.getElementById("nodeProbability").value;
		if (prob.length > 15) {
			data.probability_short = prob.substring(0,16).replace(/\n/gi,";") + "...";
		} else {
			data.probability_short = prob.replace(/\n/gi,";");
		}
		data.probability = prob;
		update(0); // 0 because we're not adding any new levels, just updating.
	}
	console.log("Me estoy ejecutando cambiando la probabilidad")
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando cambiando probabilidad json");
	Shiny.setInputValue("jsonData", download());
}

/*
 * Update the node's variables
 */
function variablesChange() {
	var selection = d3.select(".node.selected")[0][0];
	if(selection){
		var data = selection.__data__;
		data.variables = document.getElementById("nodeVariables").value;
		update(0); // 0 because we're not adding any new levels, just updating.
	}
	console.log("Me estoy ejecutando cambiando la variable")
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando cambiando variable json");
	Shiny.setInputValue("jsonData", download());
}

/*
 * Update the node's payoff
 */
function payoffChange() {
	var selection = d3.select(".node.selected")[0][0];
	if(selection){
		var data = selection.__data__;
		data.payoff = document.getElementById("nodePayoff").value;
		update(0); // 0 because we're not adding any new levels, just updating.
	}
	console.log("Me estoy ejecutando cambiando payOff")
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando payoff json");
	Shiny.setInputValue("jsonData", download());
}

/*
 * Update the node's type
 */
function nodeTypeChange() {
	var selection = d3.select(".node.selected")[0][0];
	if(selection){
		var data = selection.__data__;
		var form = document.getElementById("rbtnNodeType");
		data.type = form.elements["radNodeType"].value;
		update(0); // 0 because we're not adding any new levels, just updating.
	}
	console.log("Me estoy ejecutando cambiando tipo Nodo")
	Shiny.setInputValue("jsValue", printCSV());
	console.log("Me estoy ejecutando nodo json");
	Shiny.setInputValue("jsonData", download());
}

/*
 * Read the user's chosen file - can read either text or json
 */
function readFile(e) {

	var fileInput = document.getElementById('fileInput');

	var fileDisplayArea = document.getElementById('userJSONdiv');
	var file = fileInput.files[0];
	var textType = /text.*/;
	var jsonType = 'application/json';
	var fileType = file.type;

	//In case of weird Windows problem where Chrome & FF can't tell a JSON file is a JSON file
	if(fileType == "") {
		var items = file.name.split(".");
		if(items[items.length-1] == "json") {
			fileType = "application/json";
		}
	}

	if (fileType.match(textType)) {

		var reader = new FileReader();

		reader.onload = function(e) {
			document.getElementById("userJSONtext").innerHTML = reader.result;
			load(2);// now load to tree
			document.getElementById('fileUploadChooser').style.display='none';
		}

		reader.readAsText(file);
	} else {

		if (fileType.match(jsonType)) {

			var reader = new FileReader();

			reader.onload = function(e) {
				document.getElementById("userJSONtext").innerHTML = reader.result;
				load(2);// now load to tree
				document.getElementById('fileUploadChooser').style.display='none';
			}

			reader.readAsText(file);
		} else {
			fileDisplayArea.innerText = "File not supported!";
			document.getElementById('jsontext').value = "File not supported!";
		}
	}
}


/*
 * If tree has more than just a root node, trigger a pop-up to notify the user that if they continue
 * (to open an existing tree from file, or start a new blank tree), all current unsaved work will be lost.
 */
function areYouSure() {
	// see if the tree is blank
	if (numnodes > 2) {
		return confirm("Doing this will cause any unsaved work to be lost. Are you sure you want to continue?");
	} else {
		return true;
	}
}

/*
 * Add event listener to fileInput element
 */
window.onload = function() {

	var fileInput = document.getElementById('fileInput');
	fileInput.addEventListener('change', function(e) {
		readFile(e);
	});
}

/*
 * Warn user that they will lose unsaved work if they close the window
 */
window.onbeforeunload = function() {
	// see if the tree is blank
	if (numnodes > 2) {
		return confirm("Doing this will cause any unsaved work to be lost. Are you sure you want to continue?");
	}
}



/*
 * Choose which type of R code to generate based on root's type
 * i.e., Decision vs Markov
 */
function createRcode() {
	var rcode = "";
	var htmltext = "<textarea id=\"rcodetext\" rows=6 style=\"width:98%; padding:1%;\">";
	var myroot = root.children[0]; // get the real tree root
	if (myroot.type == "decision") {
		rcode = createDecisionTreeRcode(myroot);
	} else {
		rcode = createMarkovTreeRcode(myroot);
	}
	rcode.forEach(function (rstr) {
			htmltext += rstr + "\n";
	});
	htmltext += "</textarea>";
	document.getElementById("rcodestring").innerHTML = htmltext;
}


function createDecisionTreeRcode(myroot) {
	var rcode = new Array();

	// iterate through the tree to extract all the probabilities
	myroot.children.forEach(function (kid) {
		var probabilities = ""
		var payoffs = "";
		var curstring = "";
		var probs = appendAllChildProbabilities(kid, curstring);

		probs.myprobs.forEach(function (pstr) {
			probabilities += ", " + pstr;
		});
		probabilities = "c(" + probabilities.substring(2) + ")";

		probs.myutils.forEach(function (ustr) {
			payoffs += ", " + ustr;
		});
		payoffs = "c(" + payoffs.substring(2) + ")";

		rcode.push(probabilities + " %*% " + payoffs);
	});

	return rcode;

}


function createMarkovTreeRcode(myroot) {
	var rcode = new Array();

	var initialProbs = new Array();
	var initialStates = new Array();
	var allProbs = new Array();
	var stateIndex = {};
	var transProbs = {};
	var curstring = "";
	var rows = 0;
	var cols = 0;

	var counter = 0;
	// first set all possible states
	myroot.children.forEach(function (kid) {
		initialStates.push(kid.name);
		initialProbs.push(kid.probability);
		transProbs[kid.name] = new Array();
		stateIndex[kid.name] = counter;
		counter++;
	});

	rows = initialStates.length;

	initialStates.forEach(function (state) {
		for (var j = 0; j < rows; j++) {
			transProbs[state][j] = "";
		}
	});

	// iterate through the tree to extract all the probabilities
	myroot.children.forEach(function (kid) {

		var probabilities = new Array()

		var probs = appendAllChildProbabilities(kid, curstring);
		counter = 0;
		probs.myutils.forEach(function (ustr) {
			transProbs[kid.name][stateIndex[ustr]] += " + " + probs.myprobs[counter];
			counter++;
		});

	});
	var initProbs = "";
	initialProbs.forEach (function (prob) {
		initProbs += ", " + prob;
	});
	initProbs = "initialProbs <- \"c(" + initProbs.substring(2) + ")\"\n";

	var tp = "";
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < rows; j++) {
			var thisProb = transProbs[initialStates[j]][i];
			if (thisProb == "") {
				thisProb = "0";
			} else {
				thisProb = thisProb.substring(3);
			}
			tp += ", " + thisProb;
		}
	}
	tp = "transProbs <- \"matrix(c(" + tp.substring(2) + "),nrow=" + rows + ", ncol=" + rows + ")\"\n";

	var markovTraceFunction = "markovTrace <- function(initialProbs, transProbs) {\n"
			+ "	nStates <- " + rows + "\n"
			+ "	markovTrace <- matrix(0, nCycle+1, nStates)\n"
			+ "	markovTrace[1,] <- eval(parse(text = initialProbs))\n"
			+ "	for (cycle in 2:(nCycle+1)){\n"
			+ "		markovTrace[cycle,] <- markovTrace[cycle-1,] %*% eval(parse(text = transProbs))\n"
			+ "	}\n"
			+ "	return(markovTrace)\n"
		+ "}\n";

	rcode.push(markovTraceFunction + initProbs + tp)
	return rcode;

}


/*
 * Used for decision tree R code
 */
var appendAllChildProbabilities = function(node, curstring) {

	var myprobs = new Array();
	var myutils = new Array();

	if(node.children) {
		node.children.forEach(function (kid) {

			var kidstring = curstring + ", " + kid.probability;
			var kidobj = appendAllChildProbabilities(kid,kidstring);

			kidobj.myprobs.forEach(function (kstr) {
				myprobs.push(kstr);
			});
			myutils = myutils.concat(kidobj.myutils);
		});
	} else {
		curstring = "prod(c(" + curstring.substring(2) + "))";
		myprobs.push(curstring);
		myutils.push(node.payoff);
	}

	return {myprobs:myprobs,myutils:myutils};
}


/*
 * Print out CSV of tree: node names
 */
function printCSV() {
	//var treedepth = getDepth(root);

	var csv = "";

	if (root.children) {

		root.children.forEach(function (d) {
			csv = csv + getCSVstring(d, "-", "", 0);
		})
	}
	console.log("SAVE");
	console.log(csv);
	return csv;

	// var htmltext = "<textarea id=\"jsontext\" rows=25 cols=55>"+csv+"</textarea>";

	// document.getElementById("jsonstring").innerHTML = htmltext;
  //Flaf
	//var hiddenElement = document.createElement('a');

	//hiddenElement.href = 'data:attachment/text,' + encodeURI(csv);
	// hiddenElement.target = '_blank';
	//hiddenElement.download = 'TreeOpen.csv';
	//hiddenElement.click();


}

function getCSVstring(data, parent, grandparents, tdepth) {
	var strdelim = "\t"
	tdepth += 1;
	var myattr = data.name + strdelim + data.id + strdelim + data.type + strdelim + data.probability + strdelim + data.variables + strdelim + data.payoff;

	var csv = "";
	if (data.children) {
		if (parent !== "-") {
			grandparents += parent + strdelim;
		}

		parent = myattr;
		var kidcounter = 0;
		data.children.forEach(function (d) {
			if (kidcounter == 0) {
				csv += parent + strdelim + getCSVstring(d, parent, grandparents, tdepth);
			} else {
				csv += grandparents + parent + strdelim + getCSVstring(d, parent, grandparents, tdepth);
			}
			kidcounter++;
		})
	} else {

		csv += myattr;
		var rootdepth = getDepth(root) - 1;
		while (tdepth < rootdepth) {
			csv += strdelim + strdelim + strdelim + strdelim + strdelim + strdelim;
			tdepth++;
		}
		csv += "\n";
	}

	return csv;
}

/*
 * Print first alert message
 */
// the event handler listens to shiny for messages send by handler1
// if it receives a message, call the callback function doAwesomething and pass the message

Shiny.addCustomMessageHandler("handler1", doAwesomeThing );

// this function is called by the handler, which passes the message
function doAwesomeThing(message){

  // show the messsage as an alert
  alert(message);
}

Shiny.addCustomMessageHandler("jsonData",load );




