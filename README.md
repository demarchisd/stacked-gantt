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
 - [`generalMarkers`](#generalmarkers): is also an array, but contains data for the markers that crosses all rows in the chart (optional);
 - [`style`](#style): is an object that defines some custom style properties (optional);
 - [`events`](#events): is an object that contains callbacks for some events (optional).

#### `data`
Each object of the `data` array represents a row in the chart and may have the following properties:

| name | type | description | optionality |
| :- | :- | :- | :- |
| description | `string` | Defines the description of the row (e.g.: the name of the person, the name of the team, etc..). | mandatory |
| activities | [`[Activity]`](#activity) | Each object in this list will be represented by a horizontal bar at the given period. | mandatory |
| markers | [`[Marker]`](#marker) | Each object in this list will be represented by a vertical line at the given time and will be placed over the activities of the row. | optional. |
| thresholds | [`[Threshold]`](#threshold) | Each object in this list will be represented by a thin horizontal line at the given period and will be placed on top of all the other informations of the row. | optional |

#### `generalMarkers`
Each object of the `generalMarkers` array must follow the [`Marker`](#marker) documentation and represents a vertical line at the given time that will be placed across **all the rows of the chart**.

#### `style`

The `style` object may have the following properties for custom display settings:

| name | type | description | default |
| :- | :- | :- | :- |
| activityStyle| [`ActivityStyle`](#activitystyle) | Customizes the acvitities' bars styles for a specific [`Activity`](#activity) `code` value. | For every [`Activity`](#activity) `code`, the default style is `{ color: "#7fad7f", height: "20px" }`. |
| thresholdColor | `string` | The thresholds' default color in hex. | `'#000000'` |
| thresholdHeight | `string` | The thresholds' default height in px. | `'20px'` |
| noDataText | `string` | Text to show when there's no data to display. | `'No data to display.'` |
| descriptionContainerWidth | `string` | Defines the width of the description container. | `'250px'` |
| hourWidth | `integer` | Defines the width of one hour in the chart in px. | `80` |
| months | `[string]` | Array that defines the format of the months' names. | `['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']` |
| formatHour | `function` | Function that customizes the hour format used in the chart. Receives a `Date` param and must return a `string` | Returns the hour in the format `hh24:mi`. |
| formatDate | `function` | Function that customizes the date format used in the chart. Receives a `Date` param and must return a `string`. | Returns the date in the format `dd/MMM`, where `MMM` is defined by the `style.months` property. |
| showDateOnHeader | `boolean` | Defines if the date should be displayed on the header. | `false` |
| dateHeaderFormat | `function` | Function that customizes the date format only for the header. Receives a `Date` param and must return a `string`. | Uses the `style.formatDate` function. |

#### `events`
_(Coming soon)_

### Types

#### `Activity`
An `Activity` object may have the following properties:

| name | type | description | optionality |
| :- | :- | :- | :- |
| code | `string` | The code that represents the type of the activity. Many activities can have the same code. | mandatory
| description | `string` | The activity's description. It will be displayed on the tooltip when the user gets the mouse over the activity. | mandatory |
| begin | `Date` | The activity's initial date/time. | mandatory |
| end | `Date` | The activity's final date/time. | mandatory |
| color | `string` | The activity's bar custom color in hex (e.g.: `'#e592d7'`). If set, overrides the `style.activityStyle` option. | optional |
| height | `string` | The activity's bar custom height in px (e.g.: `'30px'`). If set, overrides the `style.activityStyle` option. | optional |
| onClick | `function` | Callback for the activity's click. If set, overrides the `events.onActivityClick`. | optional |

#### `Threshold`
A `Threshold` object may have the following properties:

| name | type | description | optionality |
| :- | :- | :- | :- |
| begin | `Date` | The threshold's initial date/time | mandatory |
| end | `Date` | The threshold's final date/time | mandatory |
| color | `string` | The threshold's custom color in hex (e.g.: `'#e592d7'`). If set, overrides the `style.thresholdColor` option. | optional |
| height | `string` | The threshold's custom height in px (e.g.: `'30px'`). If set, overrides the `style.thresholdHeight` option. | optional |

#### `Marker`
A `Marker` object may have the following properties:

| name | type | description | optionality |
| :- | :- | :- | :- |
| description | `string` | The marker's description. It will be displayed on the tooltip when the user gets the mouse over the marker. | mandatory |
| when | `Date` | The marker's date/time. | mandatory |
| width | `string` | The marker's line width in px (e.g.: `'4px'`). | optional |
| height | `string` | The marker's line height in px (e.g.: `'20px'`). | optional |
| color | `string` | The marker's custom color in hex (e.g.: `'#e592d7'`). | optional |
| onClick | `function` | Callback for the marker's click. If set, overrides the `events.onMarkerClick` or `events.onGeneralMarkerClick`. | optional |

#### `ActivityStyle`
An `ActivityStyle` object is composed by the activities `code`s that are wanted to have customized displaying (`color` and `height`) settings. For example, if you have the following activities in your data:

```
activities: [
  { code: 'TYPE_1', description: 'Activity 1 of Type 1', ... },
  { code: 'TYPE_1', description: 'Activity 2 of Type 1', ... },
  { code: 'TYPE_2', description: 'Activity 1 of Type 2', ... },
  { code: 'TYPE_3', description: 'Activity 1 of Type 3', ... }
]
```

And you define the following `activityStyle`:

```
var options = {
  data: ...,
  style: {
    activityStyle: {
      'TYPE_1': { color: "#8e87ea", height: "30px" },
      'TYPE_2': { color: "#b3b94e" }	
    }
  }
}
```

Then the two first activities of your lists will have their bars colored with `"#8e87ea"` and height of `"30px"`; the third activity will have its bar colored with `"#b3b94e"` and the default height; while the fourth activity will have both default color and height.

### Functions
_(Coming soon)_

## Examples
_(Coming soon)_
