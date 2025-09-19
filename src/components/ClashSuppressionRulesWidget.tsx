/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
// import React, { useCallback, useEffect, useMemo } from "react";
import React, { useEffect, useMemo } from "react";
import { Table } from "@itwin/itwinui-react";
import { SuppressionRuleDetails } from "@itwin/clash-detection-client";
import ClashReviewApi from "./ClashReviewApi";
import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  useActiveIModelConnection,
  Widget,
  WidgetState
} from "@itwin/appui-react";

interface TableRow extends Record<string, string> {
  name: string;
  description: string;
}

const ClashSuppressionRulesWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [clashSuppressionRules, setClashSuppressionRules] = React.useState<SuppressionRuleDetails[]>();

  useEffect(() => {
    /** Create a listener that responds to suppression rule retrieval */
    const removeListener = ClashReviewApi.onSuppressionRulesDataChanged.addListener((value: any) => {
      setClashSuppressionRules(value);
    });

    if (iModelConnection) {
      ClashReviewApi.setClashSuppressionRules(iModelConnection.iTwinId!)
        .catch((error) => {
          console.error(error);
        });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Name",
          accessor: "name",
        },
        {
          Header: "Description",
          accessor: "description",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: any[] = [];

    if (!clashSuppressionRules)
      return rows;

    clashSuppressionRules.forEach((rowData: SuppressionRuleDetails) => {
      const row: TableRow = {
        id: rowData.id,
        name: rowData.displayName,
        description: rowData.reason,
      };
      rows.push(row);
    });

    return rows;
  }, [clashSuppressionRules]);

  return (
    <Table<TableRow>
      data={data}
      isSortable
      isLoading={!clashSuppressionRules}
      columns={columnDefinition}
      emptyTableContent={"No suppression rules"}
      density="extra-condensed"
      style={{ height: "100%" }} />
  );
};

export class ClashSuppressionRulesWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashSuppressionRulesWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashSuppressionRulesWidget",
          label: "Suppression Rules",
          defaultState: WidgetState.Open,
          content: <ClashSuppressionRulesWidget />,
        }
      );
    }
    return widgets;
  }
}
