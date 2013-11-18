

	

$(function(){
	
	
	generator.makeMyDay();

	$('#refresh').on('click', function(e) {
		e.preventDefault();
		generator.makeMyDay();
	});
    $('input[type=text]').on('keyup', function(e) {
        generator.makeMyDay();
    });
    $('input[type=checkbox]').on('change', function(e) {
        generator.makeMyDay();
    });
	
});




var generator = {

    //  We’ll assign the Snap.svg paper to this later
    paper: false,

    //  Contains the path(s) to base he apttern on
    paths: [
        'M410.1,358.4c0,49.6-42,88.5-105.3,88.5c-78.1,0-110.9-38.8-114.9-92.9h51.2c3.6,28.8,15.2,52.8,63.6,52.8 c31.6,0,54-17.6,54-44c0-26.4-13.2-36.4-59.6-44c-68.4-9.2-100.9-30-100.9-83.7c0-46.8,40-82.1,99.7-82.1c61.6,0,98.5,28,104.1,82.9 h-48.8c-5.2-30-22.4-42.8-55.2-42.8c-32.4,0-49.2,15.6-49.2,37.6c0,23.2,9.6,34.8,59.2,42C375.2,282,410.1,301.2,410.1,358.4'
    ],
    // paths: [
    //     'M132.2,311.4h9.2c0.7,7,4.4,11.4,13.9,11.4c8.9,0,12.9-3,12.9-9.4c0-6.2-4.6-8.3-13.8-10c-15.4-2.8-20.6-7.1-20.6-17.4c0-11,10.7-16.6,20-16.6c10.6,0,19.8,4.3,21.4,17.1h-9.1c-1.4-6.5-5-9.3-12.4-9.3c-6.8,0-11.2,3.4-11.2,8.5c0,5.3,2.9,7.5,13.8,9.4c12.2,2.3,20.8,5,20.8,17.5c0,10.7-7.4,18-21.7,18C141.2,330.6,132.8,323.5,132.2,311.4z',
    //     'M184.5,270.4h10.2l13.8,47.6l14.4-47.6h8.1l13.5,47.6l13.9-47.6h9.6l-18.4,59.2h-10.4l-12.3-44.4L213,329.6h-10.3L184.5,270.4z',
    //     'M274.7,313.2c0-13.7,14.5-18.3,29.6-18.3h8.5v-4.3c0-9.4-3.6-13.3-12.7-13.3c-8.1,0-12.7,3.4-13.6,10.6h-9.4c1.2-13.5,12-18.4,23.4-18.4c11.3,0,21.6,4.6,21.6,21.2v39h-9.4v-7.5c-4.4,5.5-9.7,8.5-18.4,8.5C283.4,330.6,274.7,325.3,274.7,313.2z M312.9,308.9v-7.4h-8.1c-11.9,0-20.6,2.9-20.6,11.6c0,6.1,2.9,10,11.2,10C305.3,323.1,312.9,318,312.9,308.9z',
    //     'M340.7,270.4h9.4V281c3.7-6.7,8.8-11.3,19.5-11.7v8.8c-11.9,0.6-19.5,4.3-19.5,18.9v32.5h-9.4V270.4z',
    //     'M383.3,270.4h9.4v9c2.7-5.5,9.2-10.1,17.7-10.1c7.6,0,14.3,3.2,17.3,11.1c4.1-7.7,12.9-11.1,20.3-11.1c10.6,0,19.9,6.3,19.9,23.5v36.7h-9.4v-37.3c0-10.4-4.4-14.7-12.6-14.7c-7.7,0-15.6,5.2-15.6,15.8v36.2h-9.4v-37.3c0-10.4-4.4-14.7-12.5-14.7c-7.7,0-15.6,5.2-15.6,15.8v36.2h-9.4V270.4z'
    // ],

	makeMyDay: function() {
        //  Use jQuery to empty the containing div and set it’s background 
        //  color according the form field
		$('#svg-container').html('').css({backgroundColor: $('#bg-color').val()});

        //  Get the container div
		var container = document.getElementById("svg-container");

        //  Create a new SVG element & append it to the container div
		var mySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		mySvg.setAttribute("version", "1.2");
		mySvg.setAttribute("baseProfile", "tiny");
		container.appendChild(mySvg);

        //  Create a Snap.svg drawing surface using the new SVG element
        generator.paper = Snap(mySvg);
		
        //  Set the color of the dots according to the form field
		var rgb = [$('#color').val()];
		if (!$('#single-color').is(':checked')) {
			rgb.push(tint(rgb[0], 0.4));
			rgb.push(tint(rgb[1], 0.7));
		}

        //  Use Snap to get the length of each path in the `paths` array
        var pathLengths = [],
        //  ...and the total length of all paths
            pathLengthTotal = 0;
        for (var i = 0, len = generator.paths.length; i < len; i ++) {
            pathLengths.push(Snap.path.getTotalLength(generator.paths[i]));
            pathLengthTotal += pathLengths[i];
        }

		var x, // x position of circle
			y, // y position of circle
			r = $('#circle-size').val(), // circle radius
			c, // circle color
            point, // Snap.svg point at the current length along the path(s)
            currentLength = 0, // used for traversing along the path(s)
            objectCount = $('#circle-count').val(), // number of circles to draw
            random = $('#random-spread').val(), // how many pixels away from the path(s) a circle can be
            weight = $('#random-weight').val(), // how probable it is that a circle will fall closer to the path(s)
            segmentLength = pathLengthTotal / objectCount, // average distance between circles along the path(s)
            randomSegmentLengths = ($('#random-segment-lengths').is(':checked')), // boolean flag
            currentPath = 0; // index of the current path in the `paths` array

        //  Iterate for the number of required circles
		for (var i = 0; i < objectCount; i++) {

            //  Increment current position along the path(s) by the average distance between circles
            currentLength += segmentLength;

            //  If the current position along the path is longer than the current path...
            if (currentLength > pathLengths[currentPath]) {
                //  ...move on to the next path in the `paths` array
                if (generator.paths.length > currentPath + 1) {
                    currentPath ++;
                    currentLength = segmentLength;
                }
                //  ...or place this circle at the very end of this path (in case this is the last path in teh array)
                else {
                    currentLength = pathLengths[currentPath];
                }
            }

            //  If we don’t want to distance between circles (along the path) to be uniform, randomise the distance to the next one, with boundaries
            if (randomSegmentLengths) {
			    point = Snap.path.getPointAtLength(generator.paths[currentPath], currentLength - (Math.random() * segmentLength));
            }
            else {
                point =  Snap.path.getPointAtLength(generator.paths[currentPath], currentLength - segmentLength);
            }

            //  Work out how far away from the path this circle will lie
            //  Random number between 0-1, to the power of the `weight` value set in the form
            //  gives us a number between 0-1 with the distribution curve weighted towards
            diff = Math.pow(Math.random(), weight) * random;

            //  Snap.svg gives us the angle of the path at a given point, so
            //  use that to do some triganometry and move the center of the circle
            //  away from the path at 90 degrees
            x = point.x + (Math.cos((point.alpha + 90) * Math.PI/180) * diff);
            y = point.y + (Math.sin((point.alpha + 90) * Math.PI/180) * diff);

            //  Set the color
			c = rgb[Math.floor(Math.random() * rgb.length)];

            // Draw the circle
			generator.addCircle(x, y, r, c);
		}

		$('#code').val($('#svg-container').html());

		var href = 'data:application/octet-stream;charset=utf-8;base64,' + btoa($('#svg-container').html());
		$('#download-btn').attr('href', href);
	},

	addCircle: function(x, y, r, c) {
		var c1 = generator.paper.circle(x, y, r);
		c1.attr({
            fill: c
        });
	},

    addLine: function(x1, y1, x2, y2, c) {
        var p1 = generator.paper.path('M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2);
        p1.attr({
            stroke: c
        });
    }

}



function tint(rgb1, amount) {
	rgb1 = rgb1.replace(/^rgb\(([^\)]+)\)/,'$1')
        .replace(/\s/g, '')
        .split(',');
    var result = [];
    for(var i = 0; i < rgb1.length; i++ ) {
        result.push(Math.floor((rgb1[i] * 1) + ((255 - rgb1[i]) * amount)));
    }
    return 'rgb(' + result.join(',') + ')';
}

