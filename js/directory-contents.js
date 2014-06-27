/*global $, ajaxError, console, doT, util, window */
(function () {
	var qs = util.queryObj(),
		parent = window.walkPath.setParentFolderLink({"querystring": qs});
	function loadImages(response) {
		var arg = {},
			itemThird,
			out1 = [],
			out2 = [],
			out3 = [],
			sortArgs = { "connectWith": '.ui-sortable', "items": "> li[data-type=image]" };
		function generateThumbs(folder) {
			$.ajax({
				"url": '/admin/preview-generator',
				"method": 'post',
				"data": {
					"folder": folder
				},
				"success": function (response) {
					$(".directory-thumb-wait").each(function (i) {
						this.src = "../../" + decodeURIComponent(qs.folder) + "/" + response.thumbnails[i];
						this.className = "directory-thumb";
					});
				},
				"error": ajaxError
			});
		}
		arg.qs = qs;

		itemThird = response.items.length / 3;
		$.each(response.items, function (i, item) {
			if (i < itemThird) {
				out1.push(doT["directory-list-item"](item, arg));
			} else if (i >= itemThird && i < (itemThird * 2)) {
				out2.push(doT["directory-list-item"](item, arg));
			} else {
				out3.push(doT["directory-list-item"](item, arg));
			}
		});
		$('#directory-list-1').html(out1.join('')).sortable(sortArgs);
		$('#directory-list-2').html(out2.join('')).sortable(sortArgs);
		$('#directory-list-3').html(out3.join('')).sortable(sortArgs);

		if (qs.preview === "true") {
			generateThumbs(qs.folder);
		}
	}
	function bindEvents() {
		$("#btnRename, #btnResize").click(function ($event) {
			var $datepicker,
				isMoveToResize = this.id === "btnResize";
			$event.preventDefault();
			function getSelectedDate (formattedDate) {
				var $uiCol1 = $('#directory-list-1'),
					$uiCol2 = $('#directory-list-2'),
					$uiCol3 = $('#directory-list-3'),
					photoSelector = 'li[data-type=image]',
					photoCount1 = $uiCol1.children(photoSelector).length,
					photoCount2 = $uiCol2.children(photoSelector).length,
					photoCount3 = $uiCol3.children(photoSelector).length,
					newFiles = window.walkPath.getRenamedFiles({
						"filePrefix": formattedDate,
						"photosInDay": (photoCount1 + photoCount2 + photoCount3),
						"xmlStartPhotoId": (isMoveToResize === true) ? window.prompt("Starting XML photo ID?", 1) : 1
					}),
					currentFiles = [],
					sortArgs = {"attribute": 'data-filename'},
					currentFiles1 = $uiCol1.sortable( "toArray", sortArgs),
					currentFiles2 = $uiCol2.sortable( "toArray", sortArgs),
					currentFiles3 = $uiCol3.sortable( "toArray", sortArgs),
					year = formattedDate.substring(0, 4);
				currentFiles = currentFiles1.concat(currentFiles2).concat(currentFiles3);
				currentFiles1 = undefined;
				currentFiles2 = undefined;
				currentFiles3 = undefined;

				$datepicker.datepicker( "destroy" );

				$.ajax({
					"url": '/admin/rename-photos',
					"method": 'post',
					"data": {
						"targetFolderName": year,
						"currentFiles": currentFiles,
						"moveToResize": isMoveToResize,
						"newFiles": newFiles.filenames,
						"sourceFolderPath": qs.folder
					},
					"success": function (response) {
						var output = "";
						function resizeImage(postData) {
							$.ajax({
								"url": '/admin/resize-photo',
								"method": 'post',
								"data": postData,
								"error": ajaxError
							});
						}

						if (isMoveToResize === true) {
							$.each(response.files, function (x, file) {
								resizeImage(file.destination);
							});
							output = newFiles.xml;
						} else {
							output = "Rename successfull";
						}
						
						$("<textarea/>")
							.val(output)
							.prependTo($uiCol1);
					},
					"error": ajaxError
				});
			}
			$datepicker = $('<div id="vacationDate"></div>')
				.insertAfter(this)
				.datepicker({
					"dateFormat": 'yy-mm-dd',
					"onSelect": getSelectedDate,
					"changeMonth": true,
					"changeYear": true
				});
		});
	}
	function loadNav() {
		if (parent.text === "") {
			$("#btnParentFolder").addClass("hide");
		} else {
			$("#btnParentFolder")
				.removeClass("hide")
				.attr("href", parent.href)
				.find("#parentFolderName")
				.text(parent.text);
		}
	}
	$.ajax({
		"url": '/api/walk-path' + window.location.search,
		"success": loadImages,
		"error": ajaxError
	});
	loadNav();
	bindEvents();
})();