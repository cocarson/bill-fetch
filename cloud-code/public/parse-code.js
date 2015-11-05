
function shortenResultsByDate(result, dateStr) {
	endIndex = null
	console.log(result.length);
	for (i = 0; i < result.length; i++) {
    for (j = 0; j < result[i].results.length; j++) {
      if (result[i].results[j].introduced_on <= dateStr && endIndex == null) { 
      	endIndex = [i, j];
      } 
    } 
	}
	// Removes all bills after the specified date string
	return _.slice(_.slice(result, 0, endIndex[0] + 1)[endIndex[0]].results, 0, endIndex[1]);
}

$(document).ready(function () {
	Parse.initialize("yDam24Hg32LWVsZKzGxOGyopODUTFjK4HkiXeVrN", "jA4lRmjuIVMvYaRCs3DWdvzpVrpbiYa7AkNFZh72");

	$('body').on('click', '#get-bills', function(e) {
		console.log("let's go!");

		Parse.Cloud.run('getAllBills', {}, {
			success: function(result) {
				console.log(result);
				console.log('success');
			},
			error: function(error) {
				console.log('ERROR');
				console.log(error);
			}
		});
	});

	console.log('loaded!');
});