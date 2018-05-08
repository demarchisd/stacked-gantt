/*
 * stacked-gantt
 * https://github.com/demarchisd/stacked-gantt
 *
 * Copyright (c) 2018 Bruno Kewitz Demarchi
 * Licensed under the MIT license.
 */
 (function($)
 {
 	'use strict';

 	var DEFAULT_DESCRIPTION_CONTAINER_WIDTH = '250px';
	var DEFAULT_HOUR_WIDTH = 80;	 
 	var DEFAULT_ACTIVITY_COLOR = "#7fad7f";
 	var DEFAULT_ACTIVITY_HEIGHT = '20px';
 	var DEFAULT_ROW_HEIGHT = '50px';
 	var DEFAULT_MARKER_HEIGHT = '30px';
 	var DEFAULT_MARKER_WIDTH = '3px';
	var DEFAULT_MARKER_COLOR = "#e0a00e";
	var DEFAULT_HIGHLIGHT_COLOR = "#e0a00e";
 	var DEFAULT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
 	var DEFAULT_NO_DATA_TEXT = "No data to display.";
	var DEFAULT_THRESHOLD_HEIGHT = "20px";
	var DEFAULT_THRESHOLD_COLOR = "#000000";
	var DEFAULT_THRESHOLD_ALPHA = 0.3;

 	function defineFontColor(backgroundColor)
 	{
 		if(backgroundColor[0] === "#") backgroundColor = hexToRgb(backgroundColor);

 		var luma = 0.2126 * backgroundColor.r + 0.7152 * backgroundColor.g + 0.0722 * backgroundColor.b;
 		return luma < 170 ? "#fff" : "#585050";
 	}

 	/* CREDITS TO Tim Down: http://stackoverflow.com/a/5624139/2209617 */
 	function hexToRgb(hex)
 	{
 		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
 		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
 		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
 			return r + r + g + g + b + b;
 		});

 		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
 		return result ? {
 			r: parseInt(result[1], 16),
 			g: parseInt(result[2], 16),
 			b: parseInt(result[3], 16)
 		} : null;
 	}

	function getCssRgb(rgb, alpha) {
		return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+alpha+')';
	}

 	function addHorizontalScroll($element)
 	{
 		var scrollHorizontally = function(e)
 		{
 			e = window.event || e;
 			if(!e.wheelDelta && !e.detail) e = e.originalEvent;
 			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
 			$element.scrollLeft($element.scrollLeft() - (delta*40));
 			e.preventDefault();
 		};

 		$element.bind('mousewheel DOMMouseScroll', scrollHorizontally);
 	}

 	$.fn.stackedGantt = function(options)
 	{
 		var $this = $(this);

 		var stackedGantt = new StackedGantt($this); 		
		$this.stackedGantt = stackedGantt;
		
 		stackedGantt.clearOptions();
 		stackedGantt.clearGraphicElements();

 		stackedGantt.config(options);
 		stackedGantt.build();

 		$this.update = function(data, generalMarkers, generalHighlights) { stackedGantt.update(data, generalMarkers, generalHighlights); };
		$this.zoomIn = function() { stackedGantt.zoomIn(); };
		$this.zoomOut = function() { stackedGantt.zoomOut(); };
		$this.destroy = function() { stackedGantt.destroy(); };
		$this.getData = function() { return stackedGantt.getData(); };
		$this.getGeneralMarkers = function() { return stackedGantt.getGeneralMarkers(); };
		$this.getGeneralHighlights = function() { return stackedGantt.getGeneralHighlights(); };
		
 		return $this;
 	};

 	function StackedGantt($this)
 	{
 		var $container;
 		var $valuesContainer;
 		var $descriptionsContainer;
 		var $dateHeaderContainer;
 		var $timeHeaderContainer;
 		var limits;
 		var data;
		var generalMarkers;
		var generalHighlights;
 		var descriptionContainerWidth;
 		var hourWidth;
 		var hoursQuantity;
 		var hours;
 		var style;
 		var activityStyle;
 		var months;
 		var listeningResize;
		var showDateOnHeader;
		var showTimeOnHeader; 
 		var dateHeaderFormat;
 		var noDataText;
 		var $lastVisibleHeader;
		var dateHeaders;		 
		var defaultBeginDate;
		var defaultEndDate;
		var beginDate;
		var endDate;
		var autoAdjustLimits;
		var rowValueContainerWidth;

 		//events
 		var defaultOnActivityClick;
 		var defaultOnMarkerClick;
 		var defaultOnGeneralMarkerClick;

 		this.update = function(pData, pGeneralMarkers, pGeneralHighlights)
 		{
 			data = pData;
			generalMarkers = pGeneralMarkers ? pGeneralMarkers : [];
			generalHighlights = pGeneralHighlights ? pGeneralHighlights : [];
 			this.clearGraphicElements();
 			this.build();
 		};

 		this.clearOptions = function()
 		{
 			limits = null;
 			data = null;
			generalMarkers = null;
			generalHighlights = null;
 			descriptionContainerWidth = null;
 			hourWidth = null;
 			hoursQuantity = null;
 			hours = null;
 			style = null;
 			activityStyle = null;
 			months = null;
 			defaultOnActivityClick = null;
 			defaultOnMarkerClick = null;
 			defaultOnGeneralMarkerClick = null;
			showDateOnHeader = null;
			showTimeOnHeader = true;
 			dateHeaderFormat = null;
 			$lastVisibleHeader = null;
 			dateHeaders = null;
			defaultBeginDate = null;
			defaultEndDate = null;
			beginDate = null;
			endDate = null;
			autoAdjustLimits = null;
			rowValueContainerWidth = null;
 		};

 		this.clearGraphicElements = function() {
 			$this.empty();
 		};

 		this.config = function(options)
 		{
 			data = sanitizeDataDates(options.data);
			generalMarkers = sanitizeGeneralMarkersDates(options.generalMarkers ? options.generalMarkers : []);
			generalHighlights = sanitizeGeneralHighlightsDates(options.generalHighlights ? options.generalHighlights : []);
 			style = options.style;

 			if(style)
 			{
 				descriptionContainerWidth = style.descriptionContainerWidth ? style.descriptionContainerWidth : DEFAULT_DESCRIPTION_CONTAINER_WIDTH;
 				activityStyle = style.activityStyle ? style.activityStyle : {};
 				hourWidth = style.hourWidth ? style.hourWidth : DEFAULT_HOUR_WIDTH;
 				months = style.months ? style.months : DEFAULT_MONTHS;
				showDateOnHeader = style.showDateOnHeader;				
				noDataText = style.noDataText ? style.noDataText: DEFAULT_NO_DATA_TEXT;
				defaultBeginDate = style.defaultBeginDate ? style.defaultBeginDate : new Date(new Date().setHours(1)).setMinutes(0);
				defaultEndDate = style.defaultEndDate ? style.defaultEndDate : new Date(new Date().setHours(23)).setMinutes(0);
				beginDate = style.beginDate;
				endDate = style.endDate; 
				autoAdjustLimits = style.autoAdjustLimits === false ? false : true;
				
				if(style.showTimeOnHeader !== undefined) 
					showTimeOnHeader = style.showTimeOnHeader;
				 
				if(style.formatHour) 
					formatHour = style.formatHour;
				 
				if(style.formatDate) 
					formatDate = style.formatDate;

 				dateHeaderFormat = style.dateHeaderFormat ? style.dateHeaderFormat : formatDate;
 			}
 			else
 			{
 				activityStyle = {};
 				hourWidth = DEFAULT_HOUR_WIDTH;
 				months = DEFAULT_MONTHS;
 				dateHeaderFormat = formatDate;
 				noDataText = DEFAULT_NO_DATA_TEXT;
 			}

 			var events = options.events;

 			if(events)
 			{
 				defaultOnActivityClick = events.onActivityClick;
 				defaultOnMarkerClick = events.onMarkerClick;
 				defaultOnGeneralMarkerClick = events.onGeneralMarkerClick;
 			}
 		};
		
		this.zoomIn = function()
		{
			hourWidth = hourWidth * 1.1;
			this.clearGraphicElements();
			this.build();
		};
		
		this.zoomOut = function()
		{
			hourWidth = hourWidth * 0.9;
			this.clearGraphicElements();
			this.build();
		};

		this.destroy = function()
		{
			this.clearGraphicElements();
			delete $this.update;
			delete $this.zoomIn;
			delete $this.zoomOut;
			delete $this.destroy;
			delete $this.stackedGantt;
		};

		this.getData = function() {
			return data;
		};

		this.getGeneralMarkers = function() {
			return generalMarkers;
		};

		this.getGeneralHighlights = function() {
			return generalHighlights;
		};

 		function sanitizeDataDates(data)
 		{
 			data.forEach(function(row)
 			{
 				if(row.thresholds)
 				{
 					row.thresholds.forEach(function(threshold) {
 						threshold.begin = sanitizeDate(threshold.begin);
 						threshold.end = sanitizeDate(threshold.end);
 					});
 				}

 				if(row.markers)
 				{
 					row.markers.forEach(function(marker) {
 						marker.when = sanitizeDate(marker.when);
 					});
 				}

 				row.activities.forEach(function(activity)
 				{
 					activity.begin = sanitizeDate(activity.begin);
 					activity.end = sanitizeDate(activity.end);
 				});
 			});

 			return data;
 		}

 		function sanitizeGeneralMarkersDates(generalMarkers)
 		{
 			if(!generalMarkers) return;

 			generalMarkers.forEach(function(marker) {
 				marker.when = sanitizeDate(marker.when);
 			});

 			return generalMarkers;
		 }
		 
		function sanitizeGeneralHighlightsDates(generalHighlights)
		{
			if(!generalHighlights) return;

			generalHighlights.forEach(function(highlight) {
				highlight.begin = sanitizeDate(highlight.begin);
				highlight.end = sanitizeDate(highlight.end);
			});

			return generalHighlights;
		}

 		function sanitizeDate(date)
 		{
 			if(Object.prototype.toString.call(date) === "[object Date]") {
 				return date;
 			}

 			if(!isNaN(date)) {
 				return new Date(date);
 			}

 			throw new Error("Invalid Date: "+date);
 		}

 		this.build = function()
 		{
 			if(!data || !data.length) {
 				createNoDataContainer();
 			}
 			else
 			{
 				createContainers();
 				defineLimits();
				createHeader();
				createRows();
				createGeneralMarkers();
				createGeneralHighlights();
 				listenToWindowResize();
 			}
 		};

 		function createNoDataContainer()
 		{
 			var $noDataContainer = $("<div>", {class: "sg_no_data", html: noDataText});
 			$this.append($noDataContainer);
 		}

 		function createContainers()
 		{
 			var $wrapContainer = $("<div>", {class: "sg_container_wrapper"});
 			$this.append($wrapContainer);

 			$container = $("<div>", {class: "sg_container"});
 			$wrapContainer.append($container);

 			$descriptionsContainer = $("<div>", {class: "sg_desc_container "+getHeaderCss(),
 				css: { width: descriptionContainerWidth }});
 			$container.append($descriptionsContainer);

 			$valuesContainer = $("<div>", {class: "sg_val_container"});
 			$container.append($valuesContainer);
 			addHorizontalScroll($valuesContainer);

 			if(showDateOnHeader) {
 				addValuesContainerScrollWatch();
 			}
 		}

 		function addValuesContainerScrollWatch()
 		{
 			$valuesContainer.scroll(function()
 			{
 				if($lastVisibleHeader) {
 					$lastVisibleHeader.remove();
 					$lastVisibleHeader = null;
 				}

 				var scrollLeft = $valuesContainer.scrollLeft();

 				var headerConflict = checkHeaderConflict(scrollLeft);

 				var hourIndex = Math.floor(scrollLeft / hourWidth);
 				var hour = hours[hourIndex];
 				$lastVisibleHeader = createDateHeader(hour, null, scrollLeft, headerConflict);
 			});
 		}

 		function checkHeaderConflict(scrollLeft)
 		{
 			var ret = dateHeaders.reduce(function(ret, $element)
 			{
 				if(ret) return ret;

 				var left = parseInt($element.css('left'));
 				var right = Math.ceil(left + $element.outerWidth());

 				return scrollLeft >= left && scrollLeft <= right;
 			}, false);

 			return ret;
 		}

 		function defineLimits()
 		{
 			var rowsLimits = data.map(function(row)
 			{
 				return {
 					begin: getRowBegin(row),
 					end: getRowEnd(row)
 				};
 			});

 			var begin = new Date(rowsLimits
 				.map(function(rowLimit) {
 					return rowLimit.begin;
 				})
 				.concat(generalMarkers.map(function(marker) {
 					return marker.when;
				 }))
 				.concat(generalHighlights.map(function(highlight) {
					return highlight.begin;
				}))				 
 				.reduce(function(lowestBegin, currentBegin) {
 					return currentBegin < lowestBegin ? currentBegin : lowestBegin;
 				}));
			
			if(autoAdjustLimits && (begin.getMinutes() <= 10 || begin.getMinutes() >= 50)) 
				begin.setHours(begin.getHours()-1);

			begin.setMinutes(0);

 			var end = new Date(rowsLimits
 				.map(function(rowLimit) {
 					return rowLimit.end;
 				})
 				.concat(generalMarkers.map(function(marker) {
 					return marker.when;
				}))
				.concat(generalHighlights.map(function(highlight) {
					return highlight.end;
				}))					 
 				.reduce(function(highestEnd, currentEnd) {
 					return currentEnd > highestEnd ? currentEnd : highestEnd;
 				}));

			if(autoAdjustLimits && (end.getMinutes() <= 10 || end.getMinutes() >= 50)) 
				end.setHours(end.getHours()+1);
				 
			end.setMinutes(0);

 			limits = {
 				begin: begin,
 				end: end
 			};
 		}

 		function getRowBegin(row)
 		{
			var begins = [];
 			
			if(row.activities)
			{			 
				begins = begins.concat(row.activities.map(function(activity) {
					return activity.begin;
				}));				
			}	

 			if(row.markers)
 			{
 				begins = begins.concat(row.markers.map(function(marker) {
 					return marker.when;
 				}));
 			}

 			if(row.thresholds)
 			{
 				begins = begins.concat(row.thresholds.map(function(threshold) {
 					return threshold.begin;
 				}));
 			}
			
			if(!begins.length)
				return defaultBeginDate;
				
			if(beginDate)
				begins.push(beginDate);

			var lowestBegin = begins.reduce(function(lowestBegin, currentBegin) {
				return currentBegin < lowestBegin ? currentBegin : lowestBegin;
			});

 			return lowestBegin;
 		}

 		function getRowEnd(row)
 		{
			var ends = [];

			if(row.activities)
			{			 
				ends = ends.concat(row.activities.map(function(activity) {
					return activity.end;
				}));				
			}
			
 			if(row.markers)
 			{
 				ends = ends.concat(row.markers.map(function(marker) {
 					return marker.when;
 				}));
 			}

 			if(row.thresholds)
 			{
 				ends = ends.concat(row.thresholds.map(function(threshold) {
 					return threshold.end;
 				}));
			 }
			 
			if(!ends.length)
			 	return defaultEndDate;
			
			if(endDate)
				ends.push(endDate);				 

			var highestEnd = ends.reduce(function(highestEnd, currentEnd) {
				return currentEnd > highestEnd ? currentEnd : highestEnd;
			});

 			return highestEnd;
 		}

 		function createHeader()
 		{
 			if(showDateOnHeader)
 			{
 				dateHeaders = [];
 				$dateHeaderContainer = $("<div>", {class: "sg_date_header_container"});
 				$valuesContainer.append($dateHeaderContainer);
 			}
			 
 			$timeHeaderContainer = $("<div>", {class: "sg_time_header_container"});
 			$valuesContainer.append($timeHeaderContainer);

 			hours = getHoursBetweenLimits();
 			hoursQuantity = hours.length;

 			hours.forEach(function(hour, hourIndex)
 			{
				if(showTimeOnHeader)
 					createTimeHeader(hour);

				if(showDateOnHeader && (hourIndex === 0 || hour.getHours() === 0) && !checkHeaderConflict(hourWidth * hourIndex))								
					dateHeaders.push(createDateHeader(hour, hourIndex));
 			});
 		}

 		function createDateHeader(hour, hourIndex, scrollLeft, headerConflict)
 		{
 			var left = hourIndex ? (hourWidth * hourIndex) : scrollLeft;

 			var css = {
 				minWidth: hourWidth + 'px',
 				left: left + 'px'
 			};

 			var scrollClass = scrollLeft ? "scroll " : "";
 			var conflictClass = headerConflict ? "conflict " : "";

 			var $headerItem = $("<div>", {class: "sg_date_header_item " + scrollClass + conflictClass, css : css });
 			$dateHeaderContainer.append($headerItem);
 			$headerItem.html(dateHeaderFormat(hour));

 			return $headerItem;
 		}

 		function createTimeHeader(hour)
 		{
 			var $headerItem = $("<div>", {class: "sg_time_header_item", css : { width: hourWidth + 'px' }});
 			$timeHeaderContainer.append($headerItem);
 			$headerItem.html(formatHour(hour));

 			if(showDateOnHeader) $headerItem.attr("title", dateHeaderFormat(hour));
 		}

 		function getHoursBetweenLimits()
 		{
 			var ret = [];
			
 			for ( var hour = new Date(limits.begin);
 						hour <= limits.end;
 						hour.setHours(hour.getHours() + 1)
 			) {
 				ret.push(new Date(hour));
 			}

 			return ret;
 		}

 		function createRows()
 		{
			var $lastHeader = dateHeaders[dateHeaders.length-1];
			var lastHeaderRightPosition = Math.ceil(parseInt($lastHeader.css('left')) + $lastHeader.outerWidth()) + 12;
			rowValueContainerWidth = Math.max(hoursQuantity * hourWidth, lastHeaderRightPosition);

 			data.forEach(function(row, rowIndex)
 			{
 				var even = rowIndex % 2 === 0;
 				createRowDescription(row, even);
 				createRowTimeline(row, even);
 			});
 		}

 		function createRowDescription(row, even)
 		{
 			var height = getRowHeight();

 			var css = {
 				height: height,
 				lineHeight: height
 			};

 			var evenOdd = even? "even" : "odd";

 			var $rowDescriptionContainer = $("<div>", {class: "sg_row_desc_container "+evenOdd, css: css});
 			$descriptionsContainer.append($rowDescriptionContainer);
 			$rowDescriptionContainer.html(row.description);
 		}

 		function createRowTimeline(row, even)
 		{
 			var height = getRowHeight(); 			

 			var css = {
 				height: height,
 				lineHeight: height,
 				width: rowValueContainerWidth
 			};

 			var evenOdd = even ? "even" : "odd";

 			var $rowValueContainer = $("<div>", {class: "sg_row_val_container "+evenOdd, css: css});
 			$valuesContainer.append($rowValueContainer);

 			row.activities.forEach(function(activity) {
 				createActivity(activity, $rowValueContainer, row);
 			});

 			if(row.thresholds)
 			{
 				row.thresholds.forEach(function(threshold) {
 					createThreshold(threshold, $rowValueContainer);
 				});
 			}

 			if(row.markers)
 			{
 				row.markers.forEach(function(marker) {
 					createMarker(marker, $rowValueContainer, row);
 				});
 			}
 		}

 		function createThreshold(threshold, $rowValueContainer)
 		{
 			if(!threshold || !threshold.begin || !threshold.end) return;

			var alpha = DEFAULT_THRESHOLD_ALPHA;
			var color = getCssRgb(hexToRgb(getThresholdColor(threshold)), alpha);
			var height = getThresholdHeight(threshold);
 			var lineWidth = calculateHoursDifferenceInPx(threshold.begin, threshold.end);
 			var beforeWidth = calculateHoursDifferenceInPx(threshold.begin, limits.begin);

 			var css = {
 				width: lineWidth,
 				left: beforeWidth,
       			height: height
 			};

			var cssColor = {
				backgroundColor: color
			};

 			var $threshold = $("<div>", { class: "sg_threshold", css: css});
 			$rowValueContainer.append($threshold);

			var $thresholdBegin = $("<div>", { class: "sg_threshold_limit begin", css: cssColor });
			$threshold.append($thresholdBegin);

			var $thresholdLine = $("<div>", { class: "sg_threshold_line", css: cssColor });
			$threshold.append($thresholdLine);

			var $thresholdEnd = $("<div>", { class: "sg_threshold_limit end", css: cssColor });
			$threshold.append($thresholdEnd);
 		}

 		function createMarker(marker, $rowValueContainer, row)
 		{
 			var markerWidth = getMarkerWidth(marker);
 			var markerHeight = getMarkerHeight(marker);
 			var markerColor = getMarkerColor(marker);
 			var beforeWidth = calculateHoursDifferenceInPx(marker.when, limits.begin);
 			var markerClick = getMarkerClick(marker);

 			var css = {
 				width: markerWidth,
 				height: markerHeight,
 				left: beforeWidth,
 				backgroundColor: markerColor
 			};

 			var $marker = $("<div>", { class: "sg_marker", css: css});
 			$rowValueContainer.append($marker);

 			if(markerClick)
 			{
 				$marker.click(function() { markerClick(marker, row, data); });
 				$marker.css("cursor", "pointer");
 			}

 			createMarkerTooltip(marker, $marker, row.description);
 		}

 		function createMarkerTooltip(marker, $marker, rowDescription)
 		{
 			var color = getMarkerColor(marker);
 			var title = marker.description;
 			var subtitle = rowDescription;
 			var description = getMarkerTimeDescription(marker);
 			var badge = title[0];
 			var squareBadge = true;

 			createTooltip($marker, color, title, description, badge, subtitle, squareBadge);
 		}

 		function getMarkerTimeDescription(marker) {
 			return getDateDescription(marker.when, true);
 		}

 		function createActivity(activity, $rowValueContainer, row)
 		{
 			var activityWidth = calculateHoursDifferenceInPx(activity.begin, activity.end);
 			var beforeWidth = calculateHoursDifferenceInPx(activity.begin, limits.begin);
 			var color = getActivityColor(activity);
 			var height = getActivityHeight(activity);
 			var activityClick = getActivityClick(activity);

 			var css = {
 				width: activityWidth,
 				left: beforeWidth,
 				backgroundColor: color,
 				height: height
 			};

 			var $activity = $("<div>", { class: "sg_activity", css: css});
 			$rowValueContainer.append($activity);

 			if(activityClick)
 			{
 				$activity.click(function() { activityClick(activity, row, data); });
 				$activity.css("cursor", "pointer");
 			}

 			createActivityTooltip(activity, $activity, row.description);
 		}

 		function createActivityTooltip(activity, $activity, rowDescription)
 		{
 			var color = getActivityColor(activity);
 			var title = activity.description;
 			var subtitle = rowDescription;
 			var description = getActivityTimeDescription(activity);
 			var badge = title[0];

 			createTooltip($activity, color, title, description, badge, subtitle);
 		}

 		function getActivityTimeDescription(activity)
 		{
 			return getDateDescription(activity.begin, true) +
 			' — ' +
 			getDateDescription(activity.end, !isSameDay(activity.begin, activity.end));
 		}

 		function createGeneralMarkers()
 		{
 			if(!generalMarkers.length) return;
 			generalMarkers.forEach(createGeneralMarker);
 		}

 		function createGeneralMarker(marker)
 		{
 			var markerWidth = getMarkerWidth(marker);
 			var markerHeight = ((parseInt(getRowHeight()) * data.length))+'px';

 			var markerColor = getMarkerColor(marker);
 			var beforeWidth = calculateHoursDifferenceInPx(marker.when, limits.begin);
 			var markerClick = getGeneralMarkerClick(marker);

 			var css = {
 				width: markerWidth,
 				height: markerHeight,
 				left: beforeWidth,
 				backgroundColor: markerColor
 			};

 			var $marker = $("<div>", { class: "sg_general_marker "+getHeaderCss(), css: css});
 			$valuesContainer.append($marker);

 			if(markerClick)
 			{
 				$marker.click(function() { markerClick(marker, data); });
 				$marker.css("cursor", "pointer");
 			}

 			createMarkerTooltip(marker, $marker);
		}
		 
		function createGeneralHighlights()
		{
			if(!generalHighlights.length) return;
			generalHighlights.forEach(createGeneralHighlight);
		}

		function createGeneralHighlight(highlight)
		{
			var highlightWidth = calculateHoursDifferenceInPx(highlight.begin, highlight.end);
			var highlightHeight = ((parseInt(getRowHeight()) * data.length))+'px';

			var highlightColor = getHighlightColor(highlight);
			var beforeWidth = calculateHoursDifferenceInPx(highlight.begin, limits.begin);			

			var css = {
				width: highlightWidth,
				height: highlightHeight,
				left: beforeWidth,
				backgroundColor: highlightColor
			};

			var $highlight = $("<div>", { class: "sg_general_highlight "+getHeaderCss(), css: css});
			$valuesContainer.append($highlight);
		}

 		function calculateHoursDifferenceInPx(date1, date2)
 		{
 			var diff = (Math.abs(date1 - date2) / 3600000);
 			var width = diff*hourWidth;

 			return width+'px';
 		}

 		function getRowHeight()
 		{
 			if(style && style.rowHeight) {
 				return style.rowHeight;
 			} else {
 				return DEFAULT_ROW_HEIGHT;
 			}
 		}

 		function getActivityColor(activity)
 		{
 			if(activity.color) return activity.color;

 			var style = activityStyle[activity.code];

 			if(style && style.color) {
 				return style.color;
 			}

 			return DEFAULT_ACTIVITY_COLOR;
 		}

 		function getActivityHeight(activity)
 		{
 			if(activity.height) return activity.height;

 			var style = activityStyle[activity.code];

 			if(style && style.height) {
 				return style.height;
 			}

     		return  DEFAULT_ACTIVITY_HEIGHT;
 		}

 		function getActivityClick(activity)
 		{
 			if(activity.onClick !== undefined) return activity.onClick;
 			return defaultOnActivityClick;
 		}

		function getThresholdColor(threshold)
		{
		if(threshold.color) return threshold.color;

		if(style && style.thresholdColor) {
			return style.thresholdColor;
		}

		return DEFAULT_THRESHOLD_COLOR;
		}

		function getThresholdHeight(threshold)
		{
		if(threshold.height) return threshold.height;

		if(style && style.thresholdHeight) {
			return style.thresholdHeight;
		}

		return  DEFAULT_THRESHOLD_HEIGHT;
		}

 		function getMarkerWidth(marker)
 		{
 			if(marker.width) {
 				return marker.width;
 			} else {
 				return DEFAULT_MARKER_WIDTH;
 			}
 		}

 		function getMarkerHeight(marker)
 		{
 			if(marker.height) {
 				return marker.height;
 			} else {
 				return DEFAULT_MARKER_HEIGHT;
 			}
 		}

 		function getMarkerColor(marker)
 		{
 			if(marker.color) {
 				return marker.color;
 			} else {
 				return DEFAULT_MARKER_COLOR;
 			}
 		}

 		function getMarkerClick(marker)
 		{
 			if(marker.onClick !== undefined) return marker.onClick;
 			return defaultOnMarkerClick;
 		}

 		function getGeneralMarkerClick(marker)
 		{
 			if(marker.onClick !== undefined) return marker.onClick;
 			return defaultOnGeneralMarkerClick;
		}
		
		function getHighlightColor(highlight)
		{
			if(highlight.color) {
				return highlight.color;
			} else {
				return DEFAULT_HIGHLIGHT_COLOR;
			}
		}

 		function createTooltip($element, color, title, description, badge, subtitle, squareBadge)
 		{
 			var handleMouseOver = function(ev)
 			{
 				$element.addClass('hover');

 				var $tooltip = $("<div>", { class: "sg_tooltip" });
 				var fontColor = defineFontColor(color);

 				appendTooltipContent($tooltip, title, description, badge, subtitle, color, fontColor, squareBadge);

 				var css = getTooltipPosition(ev, $tooltip);
 				css.position = "absolute";
 				css.borderColor = color;
 				$tooltip.css(css);

 				$tooltip.mouseover(keepTooltip($tooltip));
 				$tooltip.mouseout(initTooltipRemoval($element, $tooltip, handleMouseOver));

 				$element.unbind('mouseover mouseout');
 				$element.mouseover(keepTooltip($tooltip));
 				$element.mouseout(initTooltipRemoval($element, $tooltip, handleMouseOver));

 				$('body').append($tooltip);
 			};

 			$element.mouseover(handleMouseOver);
 		}

 		function getTooltipPosition(ev, $tooltip)
 		{
 			var $w = $(window);
 			var left = ev.pageX + 5;
 			var top = ev.pageY + 5;

 			var tooltipWidth = getDimensions($tooltip).width;
 			var tooltipRightestPixelPosition = left + tooltipWidth;
 			var windowRightestPixelVisiblePosition = $w.scrollLeft() + $w.width();

 			if(tooltipRightestPixelPosition >= (windowRightestPixelVisiblePosition - 50)) {
 				left -= (tooltipRightestPixelPosition - windowRightestPixelVisiblePosition) + 50;
 			}

 			var tooltipHeight = getDimensions($tooltip).height;
 			var tooltipBottomestPixelPosition = top + tooltipHeight;
 			var windowBottomestPixelVisiblePosition = $w.scrollTop() + $w.height();

 			if(tooltipBottomestPixelPosition >= (windowBottomestPixelVisiblePosition - 75)) {
 				top -= (tooltipBottomestPixelPosition - windowBottomestPixelVisiblePosition) + 75;
 			}

 			return {
 				left: left,
 				top: top
 			};
 		}

    	function appendTooltipContent($tooltip, title, descriptions, badge, subtitle,
			badgeBGColor, badgeFontColor, squareBadge)
		{
			if(badge)
			{
				var $badge = $("<div>", { class: "sg_tooltip_badge", html: badge,
				css : { backgroundColor: badgeBGColor, color: badgeFontColor }});

				if(squareBadge)	$badge.addClass('square');

				$tooltip.append($badge);
			}

			var $title = $("<span>", { class: "sg_tooltip_title", html: title });
			$tooltip.append($title);

			if(subtitle)
			{
				var $subtitle = $("<span>", { class: "sg_tooltip_subtitle", html: subtitle });
				$tooltip.append($subtitle);
			}

			if(descriptions)
			{
				if(descriptions.constructor !== Array)
					descriptions = [descriptions];

				descriptions.forEach(function(descriptionObj)
				{
					var title;
					var description;

					if(typeof descriptionObj === "string") {
						description = descriptionObj;
					}
					else
					{
						title = descriptionObj.title;
						description = descriptionObj.description;
					}

					var $wrapper = $("<div>", { class: "sg_tooltip_description_wrapper" });
					var $description = $("<div>", { class: "sg_tooltip_description" });
					$wrapper.append($description);

					if(title)
					{
						var $title = $("<span>", { class: "sg_tooltip_description_title", html: title });
						$description.append($title);
					}

					$description.append(description);
					$tooltip.append($wrapper);
				});
			}
		}

 		function initTooltipRemoval($element, $tooltip, handleMouseOver)
 		{
 			return function()
 			{
 				$tooltip.shallRemove = true;

 				setTimeout(function()
 				{
 					if($tooltip.shallRemove)
 					{
 						$tooltip.remove();
 						$element.unbind('mouseover mouseout');
 						$element.removeClass('hover');
 						$element.mouseover(handleMouseOver);
 					}
 				}, 50);
 			};
 		}

 		function keepTooltip($tooltip) {
 			return function() { $tooltip.shallRemove = false; };
 		}

 		function listenToWindowResize()
 		{
 			defineContainerDisplayType();

 			if(!listeningResize)
 			{
 				listeningResize = true;
 				$(window).on('resize', defineContainerDisplayType);
 			}
 		}

 		function defineContainerDisplayType()
 		{
 			setContainersDisplay('inline-block', 'inline-block');

 			var contentSpace = $container.outerWidth();
 			var totalSpace = $this.width();

 			if(contentSpace >= totalSpace) {
 				setContainersDisplay('block', 'grid');
 			}
 		}

 		function setContainersDisplay(container, valuesContainer)
 		{
 			$container.css('display', '');
 			$valuesContainer.css('display', '');
 			$container.css('display', container);
 			$valuesContainer.css('display', valuesContainer);
 		}

 		function getDateDescription(date, showDate)
 		{
 			var ret = '';

 			if(showDate) {
 				ret = formatDate(date) + ' ';
 			}

 			ret += formatHour(date);
 			return ret;
 		}

 		var formatDate = function(date)
 		{
 			var day = date.getDate();
 			day = ("0" + day).slice(-2);

 			var month = months[date.getMonth()];
 			return day + "/" + month;
 		};

 		var formatHour = function(date)
 		{
 			var hour = date.getHours();
 			hour = ("0" + hour).slice(-2);

 			var minute = date.getMinutes();
 			minute = ("0" + minute).slice(-2);

 			return hour + ':' + minute;
 		};

 		function isSameDay(date1, date2)
 		{
 			date1 = new Date(date1).setHours(0, 0, 0, 0);
 			date2 = new Date(date2).setHours(0, 0, 0, 0);

 			return date1 === date2;
 		}

 		function getDimensions($element)
 		{
 			var $clone = $element.clone()
 			.show()
 			.css('visibility','hidden');

 			$('body').append($clone);

 			var result = {
 				width: $clone.width(),
 				height: $clone.height()
 			};

 			$clone.remove();
 			return result;
		}
		 
		function getHeaderCss()
		{
			var headerCss = "with_datetime_header";
			
			if(!showDateOnHeader && !showTimeOnHeader) {
				headerCss = "without_header";
			}
			else if(!showDateOnHeader) {
				headerCss = "with_time_header";
			}
			else if(!showTimeOnHeader) {
				headerCss = "with_date_header";
			}

			return headerCss;
		}
 	}
}(jQuery));
