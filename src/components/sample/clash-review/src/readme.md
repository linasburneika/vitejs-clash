# Clash Review Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates using the [Clash Detection client library](https://www.npmjs.com/package/@itwin/clash-detection-client) to retrieve clash data and present it for review in a viewer app.

## Purpose

- Provide [code examples](./ClashReviewApi.ts) for calling the clash detection client library.
- Plot clash locations using marker pins.
- Populate tables of clash detection tests, runs, results and suppression rules.
- Visualize clashing element pair using red, blue and gray-out.
- Zoom to clash on marker click or table selection.

## Description

Clash Detection is a feature in iTwin Platform that analyzes and reports element pairs that are colliding or within a minimum tolerance. An API now provides direct access to this functionality to enable 3rd-party app integration.

The goal of this sample is to provide code examples for all of the available clash detection client [functions](./ClashDetectionClient.ts). There are five components of clash detection: suppression rule templates, suppression rules, tests, runs and results.

- [Suppression Rule Templates](https://github.com/iTwin/clash-detection-client/blob/main/src/base/interfaces/apiEntities/TemplateInterfaces.ts#L7) define parameters to create suppression rules.
- [Suppression Rules](https://github.com/iTwin/clash-detection-client/blob/main/src/base/interfaces/apiEntities/SuppressionRuleInterfaces.ts#L35) contain [parameters](https://github.com/iTwin/clash-detection-client/blob/d9066a990662bb15bdf14b058028ed9f698c3dd4/src/base/interfaces/CommonInterfaces.ts#L77) and the ID of a template.
- [Tests](https://github.com/iTwin/clash-detection-client/blob/main/src/base/interfaces/apiEntities/TestInterfaces.ts#L42) contain clash set criteria and the IDs of suppression rules.
- [Runs](https://github.com/iTwin/clash-detection-client/blob/main/src/base/interfaces/apiEntities/RunInterfaces.ts#L25) contain metadata and the ID of the result.
- [Results](https://github.com/iTwin/clash-detection-client/blob/main/src/base/interfaces/apiEntities/ResultInterfaces.ts#L6) contain the IDs and labels of clashing elements.

The following [iTwin.js library](https://www.itwinjs.org/reference/) components are demonstrated:

- [Decorator](https://www.itwinjs.org/reference/core-frontend/views/decorator/): show the clash marker pins in a viewport.
- [MarkerSet](https://www.itwinjs.org/reference/core-frontend/views/markerset/): manage a collection of clash marker pins.
- [Marker](https://www.itwinjs.org/reference/core-frontend/views/marker/): draw clash marker pins at the location of clashing elements.
- [Cluster](https://www.itwinjs.org/reference/core-frontend/views/cluster/): draw cluster pins where a group of clashes are located.
- [Table](https://www.itwinjs.org/reference/components-react/table/): display a table of clash results.
