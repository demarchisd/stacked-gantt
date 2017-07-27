# Stacked Gantt

JQuery Gantt-like chart with stacked activities/tasks, providing more concise information.

## Getting Started
Download the [js][JS] and the [css][CSS] files.

[JS]: https://raw.githubusercontent.com/demarchisd/stacked-gantt/master/dist/jquery.stacked-gantt.min.js
[CSS]: https://raw.githubusercontent.com/demarchisd/stacked-gantt/master/dist/jquery.stacked-gantt.css

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.stacked-gantt.min.js"></script>
<link rel="stylesheet" type="text/css" href="dist/jquery.stacked-gantt.css">
<link href="http://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css" /> <!--Optional, but recommended-->
<script>
$(document).ready(function() {
  $("#gantt").stackedGantt(options); // more information about options can be found on documentation
});
</script>

<div id="gantt"></div>
```

## Documentation
### Options
The options are separated in four main properties:

 - [`data`](#data): is an array that contains the data for each row of the chart;
 - [`generalMarkers`](#generalmarkers): is also an array, but contains data for the markers that crosses all rows in the chart;
 - [`style`](#style): is an object that defines some custom style properties;
 - [`events`](#events): is an object that contains callbacks for some events.

#### `data`
Each object of the `data` array represents a row in the chart and may have the following properties:

| name | type | description |
| :- | :- | :- |
| `description` | `string` | defines the description of the row (e.g.: the name of the person, the name of the team, etc..) |
| `activities` | [`[Activity]`](#activity) | each object in this list will be represented by a horizontal bar at the given period
| `markers` | [`[Marker]`](#marker) | each object in this list will be represented by a vertical line at the given time and will be placed over the activities of the row
| `thresholds` | [`[Threshold]`](#threshold) | each object in this list will be represented by a thin horizontal line at the given period and will be placed on top of all the other informations of the row

#### `generalMarkers`
Each object of the `generalMarkers` array must follow the [`Marker`](#marker) documentation and represents a vertical line at the given time that will be placed across **all the rows of the chart**.

#### `style`

The `style` object may have the following properties for custom display settings:

| name | type | description | default |
| :- | :- | :- | :- |
| `activityStyle`| [`ActivityStyle`](#activitystyle) | customizes the acvitities' bars styles for a specific [`Activity`](#activity) `code` value | for every [`Activity`](#activity) `code`, the default style is `{ color: "#7fad7f", height: "20px" }` |
| `noDataText` | `string` | text to show when there's no data to display | `'No data to display.'` |
| `descriptionContainerWidth` | `string` | defines the width of the description container | `'250px'` |
| `hourWidth` | `integer` | defines the width of one hour in the chart in px | `80` |
| `months` | `[string]` | array that defines the format of the months' names | `['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']` |
| `formatHour` | `function` | function that customizes the hour format used in the chart. Receives a `Date` param and must return a `string` | returns the hour in the format `hh24:mi` |
| `formatDate` | `function` | function that customizes the date format used in the chart. Receives a `Date` param and must return a `string` | returns the date in the format `dd/MMM`, where `MMM` is defined by the `style.months` property |
| `showDateOnHeader` | `boolean` | defines if the date should be displayed on the header | `false` |
| `dateHeaderFormat` | `function` | function that customizes the date format only for the header. Receives a `Date` param and must return a `string` | uses the `style.formatDate` function |

#### `events`
_(Coming soon)_

### Types
#### `Activity`
_(Coming soon)_
#### `Threshold`
_(Coming soon)_
#### `Marker`
_(Coming soon)_
#### `ActivityStyle`
_(Coming soon)_

### Functions
_(Coming soon)_

## Examples
_(Coming soon)_
