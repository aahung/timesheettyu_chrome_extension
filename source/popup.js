chrome.extension.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    start(request.source);
  }
});

function onWindowLoad() {
  var message = document.querySelector('#message');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.extension.lastError) {
      message.innerText = 'There was an error : \n' + chrome.extension.lastError.message;
    }
  });

}
onWindowLoad();


$(function(){
	$('#ideatime').click(function(){
		chrome.tabs.create({url : 'http://ideati.me'});
	});
	showStep(1);
	window.setInterval(function(){
		$('html').css('min-height', $('.container').height());
		$('body').css('min-height', $('.container').height());
	}, 1000);
});



function start(sc){
	DOM = $.parseHTML(sc);
	tables = $(DOM).find("table.datadisplaytable");

	var pid = $(DOM).find(".staticheaders").text();
	var p_EID = pid.split("\n")[1].split(" ")[0];
	var p_name = pid.split("\n")[1].split(" ")[1] + " " + pid.split("\n")[1].split(" ")[2];
	var p_semester = pid.split("\n")[2];

	courseCollection = new CourseCollection(p_EID, p_semester, p_name);
	for (i = 0; i < tables.length/2; i++) {
		try {
			var course = new Course();
			course.name($(tables[i*2]).find("caption").text());
			var timeTableRows = $(tables[i*2 + 1]).find("tr");
			for (var j = 1, len = timeTableRows.length; j < len; j ++) {
				var row = timeTableRows[j];
				time = new Time();
				time.getTime($(row).find("td:nth-child(2)").text());
				time.getDay($(row).find("td:nth-child(3)").text());
				time.getDate($(row).find("td:nth-child(5)").text());
				time.getInstructor($(row).find("td:nth-child(7)").text());
				time.getLocation($(row).find("td:nth-child(4)").text());
				course.timeCollection.add(time);
			}
			courseCollection.add(course);
		}
		catch (e){
			
		}
		
	}
	//sd = JSON.prune(courseCollection);


	$("#course_rows").empty();
	var c = courseCollection.course;
	for (var i = 0; i < c.length; i ++) {
		var row =  c[i].CreateTableRow();
		$("#course_rows").append(row);
		//var name = c[i].name;
		//$("#course_rows").append("<tr><td>" + name + "</td><td><input type='checkbox' checked> <input type='number' value='1'> hr(s)</td><td><a class='btn btn-sm btn-default'>&times;</a></td></tr>");
	}
	$("#course_table").fadeIn();
	$('input[type=number]').css("width", "50px");
	$("#toggleAllCheckbox").change(function(){
		 $('.isReminded').prop('checked', this.checked).trigger("change");
	});
	$('#editedBtn').click(function(){
		showStep(2);
		var toBeSent = JSON.prune(courseCollection);
		$.ajax({
			url: 'http://timesheettyu.ideati.me/submit/1ndex.php',
			type: 'POST',			
			data: {"string": toBeSent}
		})
		.done(function(data) {
				
				var link = data.split("\n\"")[1].split("\"")[0];
				var qrcode = new QRCode("qrcode");
				qrcode.makeCode("http://timesheettyu.ideati.me/d.php?id=" +link);
				var txt = "Scan the code on your phone or click <a href='http://ideati.me/idea/ics/d.php?id=" + link + "'>HERE</a> to download on your computer";
				$("#success_info_h1").html(txt);
				$("#course_table").remove();
				$('#get_it').fadeOut();
				$('#success_info').fadeIn();

		})
		.fail(function() {
			alert( "error" );
		});
	});
}

function showStep(num){
	switch (num){
		case 1:
			$('#stepOne').fadeIn();
			$('#stepTwo').hide();
			$('#stepThree').hide();
			break;
		case 2:
			$('#stepOne').hide();
			$('#stepTwo').fadeIn();
			$('#stepThree').hide();
			break;
	}
}