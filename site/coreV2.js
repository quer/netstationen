jQuery(function($) {
	var socket = io.connect();
		c = document.getElementById("game");
		ctx = c.getContext("2d");
		lineHeight = 12;
		haveRightClicked = false;
		lastLoadet = {data:null, image: null};
		lastText = "";
		myUserName = "";
	socket.on('updateRoom', function (data, image) {
		//console.log(data, image);
		console.log(data);
		lastLoadet.data = data;
		lastLoadet.image = image;
		renderSlots();
	});
	socket.on('updateRoomList', function (data) {
		$("#ajaxRoom").html("");
		for (var i = 0; i < data.length; i++) {
			$("#ajaxRoom").append("<div class='menuItem'>" + data[i].name + "</div><div class='menuItemCount'>" + data[i].count + "</div>");
		};
	});
	$("#log").append("<h3><b>Log</b></h3>");
	
	var room2 = document.getElementById("room2");
	var room3 = document.getElementById("room3");
	var root = document.getElementById("root");
	$("#nickForm").submit(function(e){
		e.preventDefault();
		socket.emit('new user', $("#nickname").val(), function(data){
			$("#log").append(data);
		});
	});
	$("#postText").submit(function(e){
		e.preventDefault();
		if ($("#submitText").val() != "") {
			socket.emit('new text', $("#submitText").val(), function(data){
				$("#log").append(data + "<br / >");
				lastText = "";
			});
			$("#submitText").val("");
			
		}else{
			$("#log").append("text box emty<br / >");
		}
	});
	$("#ajaxRoom").on("click", "div.menuItem", function() {
		//console.log("div click : " + $(this).text());
		socket.emit('moveRoom', $(this).text(),  function(data){
			//console.log(data + "<br>");
		});
	});

	c.onclick = function(e){
	   //console.log("test");
	    if (haveRightClicked) {
	    	haveRightClicked = false;
	 		$("#contextmenu").css( "display", "none" );
	    };
	    socket.emit('move user', e.x, e.y, function(data){

			console.log("move: " + data);
	    });
	};
	function renderSlots () {
		var data = lastLoadet.data;
		var image = lastLoadet.image;
		var roomImage = document.getElementById(image);
		ctx.drawImage(roomImage, 0, 0);
		//roomData = room[1].map;
		for (var i = 0; i < data.length; i++) {
			var possRoot = getPoss(data[i]);
			//console.log("itemid : " + possRoot.item)
			///var theItem = items[possRoot.item];
			//console.log("item: " + theItem.id);
			///var itemImage = document.getElementById(theItem.image);
			ctx.drawImage(root, possRoot.x, possRoot.y);
			///ctx.drawImage(itemImage, (possRoot.x+theItem.offset.x), (possRoot.y+theItem.offset.y));
			ctx.font="15px Georgia";
			ctx.textAlign="center";
			ctx.fillStyle = '#000';
			ctx.fillText(possRoot.player.nickname,possRoot.x+(52/2),possRoot.y+80);
			if (myUserName == possRoot.player && lastText != "") {
				ctx.fillStyle = '#B5C1CC';
				doText(lastText, ctx, (possRoot.x+52), possRoot.y, '#B5C1CC');
			}else if (possRoot.text) {
				doText(possRoot.text, ctx, (possRoot.x+52), possRoot.y, 'blue');
				/*ctx.textBaseline="bottom";
				ctx.fillText(possRoot.text, possRoot.x+52, possRoot.y);*/
			}
		};
	}

	function getPoss (place) {
		var xPoss = place.x;
		var yPoss = place.y;
		var player = place.user;
		var item = place.user.item;
		console.log("getPoss"+item);
		var text = false;
		if (place.user.text != null) {
			text = place.user.text;
		};
		/* pre set setting*/
		var offsetX = 40;
		var offsetY = 11;
		var space = 17;
		var newLineY = 39; // 71 // 39
		var offsetXod = 5;
		var offsetYod = 50;
		
		if (yPoss % 2) {
			offsetX = offsetXod;
		}
		yPoss = pingPong(yPoss);
		/*
		if (yPoss % 2) {
			yPoss = yPoss-1;//Math.floor(yPoss/2);
			return {x: (offsetXod + (xPoss*52) + (space * xPoss)), y: (offsetYod+(yPoss*newLineY))};
		}else{
			return {x: (offsetX + (xPoss*52) + (space * xPoss)), y: (offsetY+(yPoss*newLineY))};
		}*/
		return {x: (offsetX + (xPoss*52) + (space * xPoss)), y: (offsetY+yPoss), player: player, text: text, item: item};
	}
	//renderSlots();

	function pingPong (yPoss) {
		var returnVar = 0;
		for (var i = 0; i < yPoss; i++) {
			if (i % 2) {
				returnVar += 32;
			}else{
				returnVar += 39;
			}
		}
		return returnVar;
	}
	/* text */
	function doText(text, ctx, x, y, fillStyleColor) {
		//wrapText(ctx, text, x, y, 150, 25);
		stringConverter2(ctx, text, x, y, fillStyleColor);
	}
	function stringConverter2 (ctx, text, x, y, fillStyleColor) {
		var data = getTextData(ctx, text, x, y);
		//console.log("text:: x: "+data.x+" y: "+data.y+" width: "+data.width+" height: "+data.height + " text: "+ data.text)
		var lines = data.text.length;
		var offsetline = 3;
		ctx.fillStyle="#FFF";
		ctx.beginPath();
		ctx.moveTo(data.x-offsetline, data.y-offsetline);
		ctx.lineTo(data.x-offsetline, data.y+data.height+(offsetline*2));
		/* chat spike start */
		if (data.width < 20) {
			data.width = 20;
		};
		if (data.way == "right") {
			ctx.lineTo(data.x+10-offsetline, data.y+data.height+(offsetline*2));
			ctx.lineTo(data.x, data.y+data.height+15+offsetline);//pint til person
			ctx.lineTo(data.x+20-offsetline, data.y+data.height+(offsetline*2));
		}else{
			ctx.lineTo(data.x-20+data.width+(offsetline*2), data.y+data.height+(offsetline*2));
			ctx.lineTo(data.x+data.width, data.y+data.height+15+offsetline);//pint til person
			ctx.lineTo(data.x-10+data.width+(offsetline*2), data.y+data.height+(offsetline*2));
		}
		/* chat spike start*/
		ctx.lineTo(data.x+data.width+(offsetline*2), data.y+data.height+(offsetline*2));
		ctx.lineTo(data.x+data.width+(offsetline*2), data.y-offsetline);
		ctx.closePath();
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.fill();
		//ctx.fillRect(data.x,data.y,data.width+5,data.height+5);
		ctx.textAlign="left";
		ctx.fillStyle = fillStyleColor;
		for (var i = 0; i < data.text.length; i++) {
			//console.log("post text nr: "+ i + " " + data.text[i]);
			ctx.fillText(data.text[i], data.x, data.y+(i*lineHeight)+lineHeight);
		}
	}
	function getTextData (ctx, text, x, y) {
	 	var stringArray = text.split("");
		var returnStringArray = new Array();
		var outputString = '';
	 	var loopTrue = 0;
		var index = 0;
		var textWidth = 0;
	 	for(var i=0;i<stringArray.length;i++)
	 	{
	 		if(index == 18 || stringArray[i] == "\n")
	 		{
	 			returnStringArray.push(outputString);
	 			loopTrue++;
	 			index = 0;
	 			//console.log("textWidth" + textWidth + " 2: "+ ctx.measureText(outputString).width);
	 			if (ctx.measureText(outputString).width >= textWidth) {
	 				//console.log("do new width:" + ctx.measureText(outputString).width);
	 				textWidth = ctx.measureText(outputString).width;
	 			};
	 			outputString = '';
	 		}
	 		if(stringArray[i] != "\n"){
	 			outputString = outputString + stringArray[i];
	 		}
	 		index++;
	 	}
	 	returnStringArray.push(outputString);
	 	if (ctx.measureText(outputString).width >= textWidth) {
	 		textWidth = ctx.measureText(outputString).width;
	 	};
	 	way = "right";
	 	if (textWidth+x >= 408) {
			//console.log("to big..");
			x = (x-37)-textWidth;
			way = "left";
		}else{
			x = x-15;
		}
		y = y -(loopTrue * lineHeight);
		var textHeight = lineHeight + (loopTrue * lineHeight);
		//console.log("returnStringArray" + returnStringArray);
	 	return {x: x, y: y, width: textWidth, height: textHeight, text: returnStringArray, way: way};
	 }
	$(document).bind("contextmenu", function (event) {
	    
	    // Avoid the real one
	    event.preventDefault();
	    showContextMenu(event.pageX, event.pageY);
	});
	function showContextMenu (x, y) {
	 	if (x > 0 && y > 0 && x < 408 && y < 374) {
	 		if (haveRightClicked) {
	 			haveRightClicked = false;
	 			$("#contextmenu").css( "display", "none" );
	 		}else{
	 			haveRightClicked = true;
		 		socket.emit('get user', x, y, function(data){
		 			updateContextMenu(data);
		 		});	
	 		}

	 	};
	}
	function updateContextMenu(data) {
		//console.log("data"+ data);
		if (data !== false) {
			var possRoot = getPoss(data);
			var div = $("#contextmenu");
			div.css( "display", "block" );
			div.css( "top", possRoot.y );
			div.css( "left", possRoot.x );
			htmlOut = "";
			htmlOut += "<table>";
			htmlOut += "<tr>";
			htmlOut += "<td class='link'>";
			htmlOut += possRoot.player;
			htmlOut += "</td>";
			htmlOut += "</tr>";
			htmlOut += "<tr>";
			htmlOut += "<td>";
			htmlOut += "<hr>";
			htmlOut += "</td>";
			htmlOut += "</tr>";
			htmlOut += "<tr>";
			htmlOut += "<td>";
			htmlOut += "noget text";
			htmlOut += "</td>";
			htmlOut += "</tr>";
			htmlOut += "</table>";
			div.html(htmlOut);
		};
	}
	$("#game").click(function() {
		$( "#submitText" ).focus();
	});
	$('#submitText').keyup(function () {
		var theText = $(this).val();
		lastText = theText;
		renderSlots();
	});
});