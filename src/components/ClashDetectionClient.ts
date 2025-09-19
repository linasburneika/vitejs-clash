/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import { ClashDetectionClient as CDWrapper, MinimalRun, MinimalSuppressionRule,
  ParamsToCreateSuppressionRule, ParamsToCreateTest, ParamsToDeleteRun, ParamsToDeleteSuppressionRule,
  ParamsToDeleteTest, ParamsToGetResult, ParamsToGetRun, ParamsToGetRunList, ParamsToGetSuppressionRule,
  ParamsToGetSuppressionRuleList, ParamsToGetTemplateList, ParamsToGetTest, ParamsToGetTestList,
  ParamsToRunTest, ParamsToUpdateSuppressionRule, ParamsToUpdateTest, ResponseFromGetResult, Run,
  RunDetails, SuppressionRuleCreate, SuppressionRuleDetails, SuppressionRuleTemplate, SuppressionRuleUpdate,
  Test, TestDetails, TestItem, toArray } from "@itwin/clash-detection-client";

/* eslint-disable @typescript-eslint/return-await */

// This class provides example calls for all clash-detection-client wrapper functions but
// only a few of them are called in this sample app.
export default class ClashDetectionClient {
  private static tokenCallback = async () => ClashDetectionClient.getAccessToken();
  public static _instance: CDWrapper = new CDWrapper(undefined, ClashDetectionClient.tokenCallback);

  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }

  // Retrieves a detailed list of Clash Detection runs for the specified project id.
  public static async getClashDetectionRunsDetailed(projectId: string): Promise<RunDetails[]> {
    const params: ParamsToGetRunList = {
      urlParams: {
        projectId,
      },
    };
    return await ClashDetectionClient._instance.runs.getRepresentationList(params);
  }

  // Retrieves a list of Clash Detection suppression rule templates for the specified project id.
  public static async getClashDetectionTemplates(projectId: string): Promise<SuppressionRuleTemplate[]> {
    const params: ParamsToGetTemplateList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ClashDetectionClient._instance.templates.getList(params));
  }

  // Creates a Clash Detection suppression rule.
  public static async createClashDetectionRule(params: ParamsToCreateSuppressionRule): Promise<SuppressionRuleCreate> {
    return await ClashDetectionClient._instance.rules.create(params);
  }

  // Updates a Clash Detection suppression rule.
  public static async updateClashDetectionRule(params: ParamsToUpdateSuppressionRule): Promise<SuppressionRuleUpdate> {
    return await ClashDetectionClient._instance.rules.update(params);
  }

  // Retrieves the Clash Detection suppression rule for the specified id.
  public static async getClashDetectionRule(ruleId: string): Promise<SuppressionRuleDetails> {
    const params: ParamsToGetSuppressionRule = {
      ruleId,
    };
    return await ClashDetectionClient._instance.rules.getSingle(params);
  }

  // Retrieves a minimal list of Clash Detection suppression rules for the specified project id.
  public static async getClashDetectionRules(projectId: string): Promise<MinimalSuppressionRule[]> {
    const params: ParamsToGetSuppressionRuleList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ClashDetectionClient._instance.rules.getMinimalList(params));
  }

  // Retrieves a detailed list of Clash Detection suppression rules for the specified project id.
  public static async getClashDetectionRulesDetailed(projectId: string): Promise<SuppressionRuleDetails[]> {
    const params: ParamsToGetSuppressionRuleList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ClashDetectionClient._instance.rules.getRepresentationList(params));
  }

  // Deletes the Clash Detection suppression rule for the specified id.
  public static async deleteClashDetectionRule(ruleId: string): Promise<void> {
    const params: ParamsToDeleteSuppressionRule = {
      ruleId,
    };
    await ClashDetectionClient._instance.rules.delete(params);
  }

  // Creates a Clash Detection test.
  public static async createClashDetectionTest(params: ParamsToCreateTest): Promise<Test> {
    return await ClashDetectionClient._instance.tests.create(params);
  }

  // Updates a Clash Detection test.
  public static async updateClashDetectionTest(params: ParamsToUpdateTest): Promise<Test> {
    return await ClashDetectionClient._instance.tests.update(params);
  }

  // Retrieves the Clash Detection test for the specified id.
  public static async getClashDetectionTest(testId: string): Promise<TestDetails> {
    const params: ParamsToGetTest = {
      testId,
    };
    return await ClashDetectionClient._instance.tests.getSingle(params);
  }

  // Retrieves a list of Clash Detection tests for the specified project id.
  public static async getClashDetectionTests(projectId: string): Promise<TestItem[]> {
    const params: ParamsToGetTestList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ClashDetectionClient._instance.tests.getList(params));
  }

  // Deletes the Clash Detection test for the specified id.
  public static async deleteClashDetectionTest(testId: string): Promise<void> {
    const params: ParamsToDeleteTest = {
      testId,
    };
    await ClashDetectionClient._instance.tests.delete(params);
  }

  // Runs a Clash Detection test.
  public static async runClashDetectionTest(testId: string, iModelId: string, namedVersionId?: string): Promise<Run | undefined> {
    const params: ParamsToRunTest = {
      testId,
      iModelId,
      namedVersionId,
    };
    return await ClashDetectionClient._instance.tests.runTest(params);
  }

  // Retrieves the Clash Detection run for the specified id.
  public static async getClashDetectionRun(runId: string): Promise<RunDetails> {
    const params: ParamsToGetRun = {
      runId,
    };
    return await ClashDetectionClient._instance.runs.getSingle(params);
  }

  // Retrieves a minimal list of Clash Detection runs for the specified project id.
  public static async getClashDetectionRuns(projectId: string): Promise<MinimalRun[]> {
    const params: ParamsToGetRunList = {
      urlParams: {
        projectId,
      },
    };
    return await ClashDetectionClient._instance.runs.getMinimalList(params);
  }

  // Deletes the Clash Detection run (and result) for the specified run id.
  public static async deleteClashDetectionRun(runId: string): Promise<void> {
    const params: ParamsToDeleteRun = {
      runId,
    };
    await ClashDetectionClient._instance.runs.delete(params);
  }

  // Retrieves the Clash Detection result for the specified id.
  public static async getClashDetectionResult(resultId: string): Promise<ResponseFromGetResult> {
    const params: ParamsToGetResult = {
      resultId,
    };
    return await ClashDetectionClient._instance.results.get(params);
  }
}
