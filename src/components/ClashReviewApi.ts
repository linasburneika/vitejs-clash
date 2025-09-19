/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, ViewChangeOptions } from "@itwin/core-frontend";
import ClashDetectionClient from "./ClashDetectionClient";
import { MarkerData, MarkerPinDecorator } from "./common/marker-pin/MarkerPinDecorator";

export default class ClashReviewApi {

  public static onTestsDataChanged = new BeEvent<any>();
  public static onRunsDataChanged = new BeEvent<any>();
  public static onResultsDataChanged = new BeEvent<any>();
  public static onSuppressionRulesDataChanged = new BeEvent<any>();
  public static onTestIdChanged = new BeEvent<(projectId: string, testId: string) => void>();
  public static onRunIdChanged = new BeEvent<(resultId: string) => void>();
  public static onMarkerClicked = new BeEvent<() => void>();
  private static _clashTests: { [id: string]: any } = {};
  private static _clashTestRuns: { [id: string]: any } = {};
  private static _clashRuns: { [id: string]: any } = {};
  private static _clashResults: { [id: string]: any } = {};
  private static _clashSuppressionRules: { [id: string]: any } = {};

  // Get/set clash tests
  public static async setClashTests(projectId: string): Promise<void> {
    const clashTests = await ClashReviewApi.getClashTests(projectId);
    ClashReviewApi.onTestsDataChanged.raiseEvent(clashTests);
    if (clashTests && clashTests.length) {
      ClashReviewApi.onTestIdChanged.raiseEvent(projectId, clashTests[0].id);
    }
  }
  public static async getClashTests(projectId: string): Promise<any> {
    if (ClashReviewApi._clashTests[projectId] === undefined) {
      ClashReviewApi._clashTests[projectId] = await ClashDetectionClient.getClashDetectionTests(projectId);
    }
    return ClashReviewApi._clashTests[projectId];
  }

  // Get/set clash suppression rules
  public static async setClashSuppressionRules(projectId: string): Promise<void> {
    const clashSuppressionRules = await ClashReviewApi.getClashSuppressionRules(projectId);
    ClashReviewApi.onSuppressionRulesDataChanged.raiseEvent(clashSuppressionRules);
  }
  public static async getClashSuppressionRules(projectId: string): Promise<any> {
    if (ClashReviewApi._clashSuppressionRules[projectId] === undefined) {
      ClashReviewApi._clashSuppressionRules[projectId] = await ClashDetectionClient.getClashDetectionRulesDetailed(projectId);
    }
    return ClashReviewApi._clashSuppressionRules[projectId];
  }

  // Get/set all clash runs of a specified test
  public static async setClashRuns(projectId: string, testId: string): Promise<void> {
    const clashRuns = await ClashReviewApi.getClashRuns(projectId, testId);
    ClashReviewApi.onRunsDataChanged.raiseEvent(clashRuns);
    if (clashRuns && clashRuns.length) {
      ClashReviewApi.onRunIdChanged.raiseEvent(clashRuns[0].resultId);
    }
  }
  public static async getClashRuns(projectId: string, testId: string): Promise<any> {
    const testRuns: any[] = [];
    if (ClashReviewApi._clashRuns[projectId] === undefined) {
      ClashReviewApi._clashRuns[projectId] = await ClashDetectionClient.getClashDetectionRunsDetailed(projectId);
    }
    if (ClashReviewApi._clashTestRuns[testId] === undefined) {
      const clashRuns = ClashReviewApi._clashRuns[projectId];
      if (clashRuns !== undefined) {
        for (const run of clashRuns) {
          const testLink = run._links.test.href;
          const testLinkId = testLink.split("/").slice(-1)[0];
          if (testId === testLinkId) {
            testRuns.push(run);
          }
        }
        ClashReviewApi._clashTestRuns[testId] = testRuns;
      }
    }
    return ClashReviewApi._clashTestRuns[testId];
  }

  // Get/set clash results by result id
  public static async setClashResults(resultId: string): Promise<void> {
    const clashResults = await ClashReviewApi.getClashResults(resultId);
    ClashReviewApi.onResultsDataChanged.raiseEvent(clashResults);
  }
  public static async getClashResults(resultId: string): Promise<any> {
    if (ClashReviewApi._clashResults[resultId] === undefined) {
      ClashReviewApi._clashResults[resultId] = await ClashDetectionClient.getClashDetectionResult(resultId);
    }
    return ClashReviewApi._clashResults[resultId];
  }

  public static setupDecorator() {
    return new MarkerPinDecorator();
  }

  public static setDecoratorPoints(markersData: MarkerData[], decorator: MarkerPinDecorator, image: HTMLImageElement) {
    decorator.setMarkersData(markersData, image, ClashReviewApi.visualizeClashCallback);
  }

  public static enableDecorations(decorator: MarkerPinDecorator) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }

  public static async getClashMarkersData(iModelConnection: any, resultsData: any): Promise<MarkerData[]> {
    const markersData: MarkerData[] = [];
    if (iModelConnection && resultsData) {
      for (const result of resultsData.result) {
        const title = "Collision(s) found:";
        const description = `Element A: ${result.elementALabel}<br>Element B: ${result.elementBLabel}`;
        const clashMarkerData: MarkerData = { point: result.center, data: result, title, description };
        markersData.push(clashMarkerData);
      }
    }
    return markersData;
  }

  public static visualizeClashCallback = (resultsData: any) => {
    ClashReviewApi.visualizeClash(resultsData.elementAId, resultsData.elementBId, true);
  };

  public static visualizeClash(elementAId: string, elementBId: string, isMarkerClick: boolean) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
    provider.overrideElements(elementAId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    provider.overrideElements(elementBId, vp, ColorDef.blue, FeatureOverrideType.ColorOnly, false);
    provider.wantEmphasis = true;
    provider.emphasizeElements([elementAId, elementBId], vp, undefined, false);

    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    vp.zoomToElements([elementAId, elementBId], { ...viewChangeOpts })
      .catch((error) => {
        console.error(error);
      });
    if (isMarkerClick) {
      ClashReviewApi.onMarkerClicked.raiseEvent();
    }
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
  }
}
