# Qinghai-Gansu Grand Ring Road Tourism Service System

---

# Project Preview:

You can preview the system by visiting:

[Qinghai-Gansu Grand Ring Road Intelligent Tourism Service System](https://qg.zenithangle.top:8848/)

---

## Project Introduction

This is a WebGIS project based on ArcGIS Map SDK for JavaScript. The goal is to create a
tourism planning application for the Qinghai-Gansu Grand Ring Road area.

The project tech stack
includes: `ArcGIS Map SDK for JavaScript` + `VUE` + `TypeScript` + `Element Plus` + `Axios` + `Echarts`.

The Qinghai-Gansu Grand Ring Road, with its unique natural scenery, rich cultural
heritage, and diverse geographical environments, has become a popular choice for
self-driving travel enthusiasts. However, due to its special geographical location and
unpredictable weather, this route poses significant challenges to travelers' itinerary
arrangements and safety. From route planning to accommodation selection, to coping with
sudden situations like high-altitude sickness, travelers face many uncertainties. These
challenges can not only affect the travel experience but also pose safety risks to
travelers. Considering the above background, we recognize the necessity of providing
travelers with an integrated, intelligent tourism service system. This system can help
travelers better plan their journeys, cope with unexpected situations, and enhance their
travel experience. Moreover, with the widespread use of smartphones and mobile internet,
it has become more feasible and effective to solve travel problems using technology.

---

## Project Service Functions

### Search Function

> The current search function is implemented based
on [Amap's Administrative Division Search API](https://lbs.amap.com/api/webservice/guide/api/district).

Users can search using keywords up to the county-level administrative division. The system
will move the map center to the specified location and add a marker at the returned
location. Clicking the marker allows viewing the name and coordinates of the place. For
example, input:

> Gansu/Lanzhou/Chengguan District

In addition, users can input latitude and longitude data in the format "latitude,
longitude". The system will move the map center to the specified location. For example,
input:

> 104.154319,35.943354

### Weather Query Function

> This function is implemented based
on [QWeather API](https://dev.qweather.com/docs/api/weather/weather-now/).

Users can query the weather information of the current map center administrative district
by clicking a button on the map.

Clicking the button will display or hide a weather card on the map:

Click the weather query button below to get the latest weather conditions in the area
where the current map center is located (up to the county level). The content data
includes:

> Location, weather condition, temperature, perceived temperature, humidity,
precipitation, observation time

### Location Query and Selection Function

Users can query the latitude and longitude information of the current map center by
clicking the `Get Current Location` button on the map.

This function is currently implemented based on the HTML5 Geolocation API, so in complex
network environments such as proxies or multi-layer NAT, it may not be possible to obtain
user location information or the information obtained may be inaccurate.

To solve this problem, if you know your current location, you can use
the `Manual Location Selection` button to select a location manually. The system will move
the map center to the specified location. Clicking again will exit this mode.

### Route Planning Function

> This function is implemented based
on [Amap's Driving Route Planning API](https://lbs.amap.com/api/webservice/guide/api/direction).

After clicking the `Route` button, a pop-up card will appear. Users can enter the names of
the starting and ending points and click the `Confirm` button to display a driving route
from the starting point to the endpoint on the map.

Clicking the `Route` button repeatedly will toggle the input box display.

During this request process, a road blockage model is used to pass possible high-blockage
areas within 16 ranges as *avoidpolygons* parameters to the Amap API.

For details on this road blockage model, refer to the documentation:

### Nearby Query Function

> This function is implemented based
on [Amap's Nearby Search API](https://lbs.amap.com/api/webservice/guide/api/search).

> It is strongly recommended to get the user's current location or manually select a
location before using this function for better nearby information queries.

After clicking the `Nearby` button, four options will
appear: `Dining`, `Accommodation`, `Attractions`, `Gas Stations`. Users can select one
option to click, and the system will display the corresponding type of locations near the
current map center on the map.

Users can click the added points on the map. After clicking, a bubble pop-up will show the
name, address, distance, and other information of the location.

> Note: Due to Amap API limitations, the nearby query range is a circular area centered on
the current map center with a maximum radius of 5000 meters. Therefore, it may not be
possible to query nearby information in some cases.

---

## Project Map Functions

### Layer Switching

Click the layer switching button on the right to switch the map basemap.

Currently, three types of basemaps are provided from
TianDiTu: `Vector Basemap`, `Satellite Imagery`, `Terrain Rendering Map`. These data come
from
the [TianDiTu Development Resource Map API](http://lbs.tianditu.gov.cn/server/MapService.html).

Additionally, an OSM basemap is provided, with data
from [OpenStreetMap](https://www.openstreetmap.org/).

Beyond the crowdsourced network layers, this project also created heat maps and traffic
layers.

#### Heat Map

This heat map was created using check-in data and content from Weibo within 2023,
supplemented by Baidu Index at various attractions.

In the range, the higher the density of Weibo data and Baidu Index, the higher the area
heat, represented by red on the heat map; conversely, it tends to blue.

The heat map publication address
is [Qinghai-Gansu Grand Ring Road Heat Map](https://data.lzu.edu.cn/server/rest/services/%E6%A2%81%E6%AD%A3%E7%82%9C_%E9%9D%92%E7%94%98%E5%A4%A7%E7%8E%AF%E7%BA%BF/HotPoint/MapServer).

#### Traffic Map

The traffic map is drawn using OpenStreetMap data, rendering different types of traffic
routes based on the `fclass` field. In this project, we plotted traffic routes
of `truck`, `motorway`, `primary`, `secondary`, and `tertiary` types. Clicking
the `Traffic Map` button on the map will enable the traffic layer.