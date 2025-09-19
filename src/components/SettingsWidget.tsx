/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  useActiveIModelConnection,
  Widget,
  WidgetState
} from "@itwin/appui-react";
import { imageElementFromUrl } from "@itwin/core-frontend";
import { Button, ToggleSwitch } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";
import markerPinImage from "./common/marker-pin/marker-pin.svg";
import { MarkerData, MarkerPinDecorator } from "./common/marker-pin/MarkerPinDecorator";
import "./ClashReview.scss";

const SettingsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [clashResults, setClashResults] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>();
  const [image, setImage] = React.useState<HTMLImageElement>();
  const [showDecorator, setShowDecorator] = React.useState<boolean>(true);
  const [clashPinDecorator] = React.useState<MarkerPinDecorator>(() => {
    return ClashReviewApi.setupDecorator();
  });

  useEffect(() => {
    imageElementFromUrl(markerPinImage)
      .then((img: any) => setImage(img))
      .catch((error: any) => console.error(error));
  }, []);

  /** Initialize Decorator */
  useEffect(() => {
    ClashReviewApi.enableDecorations(clashPinDecorator);
    return () => {
      ClashReviewApi.disableDecorations(clashPinDecorator);
    };
  }, [clashPinDecorator]);

  useEffect(() => {
    if (showDecorator)
      ClashReviewApi.enableDecorations(clashPinDecorator);
    else
      ClashReviewApi.disableDecorations(clashPinDecorator);
  }, [showDecorator, clashPinDecorator]);

  useEffect(() => {
    const removeListener = ClashReviewApi.onRunIdChanged.addListener((resultId: string) => {
      ClashReviewApi.setClashResults(resultId)
        .catch((error) => {
          console.error(error);
        });
    });
    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    /** Create a listener that responds to clash results data retrieval */
    const removeListener = ClashReviewApi.onResultsDataChanged.addListener((value: any) => {
      setClashResults(value);
    });

    return () => {
      removeListener();
    };
  }, []);

  /** When the clashResults come in, get the marker data */
  useEffect(() => {
    if (iModelConnection && clashResults) {
      ClashReviewApi.getClashMarkersData(iModelConnection, clashResults).then((mData) => {
        setMarkersData(mData);
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [iModelConnection, clashResults]);

  useEffect(() => {
    if (markersData && image) {
      ClashReviewApi.setDecoratorPoints(markersData, clashPinDecorator, image);
    }
    setShowDecorator(true);
  }, [markersData, image, clashPinDecorator]);

  return (
    <>
      <div className="sample-options">
        <div className="iui-alert iui-informational instructions">
          <div className="iui-alert-message">
            <strong>Tests</strong> - Select one of the clash tests to show the related runs.
          </div>
        </div>
        <div className="iui-alert iui-informational instructions">
          <div className="iui-alert-message">
            <strong>Runs</strong> - Select one of the test runs to review the clash results.
          </div>
        </div>
        <div className="iui-alert iui-informational instructions">
          <div className="iui-alert-message">
            <strong>Clash Results</strong> - Click a marker or clash result to review clashes.
          </div>
        </div>
        <ToggleSwitch label="Show Markers" checked={showDecorator} onChange={() => setShowDecorator(!showDecorator)} className="sample-options-block"></ToggleSwitch>
        <Button size="small" styleType="high-visibility" onClick={ClashReviewApi.resetDisplay} className="sample-options-button">Reset Display</Button>
      </div>
    </>
  );
};

export class SettingsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SettingsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Right && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "SettingsWidget",
          label: "Settings",
          defaultState: WidgetState.Open,
          content: <SettingsWidget />,
        }
      );
    }
    return widgets;
  }
}
