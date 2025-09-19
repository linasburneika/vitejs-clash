/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { actions, MetaBase, TableState } from "react-table";
import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget, WidgetState } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import { RunDetails } from "@itwin/clash-detection-client";
import ClashReviewApi from "./ClashReviewApi";

interface TableRow extends Record<string, string> {
  time: string;
  count: string;
}

const ClashRunsWidget = () => {
  const [isAutoSelect, setIsAutoSelect] = useState<boolean>();
  const [clashRuns, setClashRuns] = React.useState<RunDetails[]>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onTestIdChanged.addListener((projectId: string, testId: string) => {
      ClashReviewApi.setClashRuns(projectId, testId)
        .catch((error) => {
          console.error(error);
        });
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    /** Create a listener that responds to clashData retrieval */
    const removeListener = ClashReviewApi.onRunsDataChanged.addListener((value: any) => {
      setIsAutoSelect(true);
      setClashRuns(value);
    });

    return () => {
      removeListener();
    };
  }, []);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Time",
          accessor: "time",
        },
        {
          Header: "Count",
          accessor: "count",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (!clashRuns)
      return rows;

    clashRuns.forEach((rowData: RunDetails) => {
      const time = new Date(rowData.executedDateTime).toLocaleString();
      const row: TableRow = {
        id: rowData.id,
        resultId: rowData.resultId,
        time,
        count: rowData.count,
      };
      rows.push(row);
    });

    return rows;
  }, [clashRuns]);

  const onRowClick = useCallback((_: any, row: any) => {
    setIsAutoSelect(false);
    ClashReviewApi.onRunIdChanged.raiseEvent(row.original.resultId);
    row.toggleRowSelected(true);
  }, []);

  const controlledState = useCallback(
    (state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
      if (isAutoSelect && meta.instance.rows && meta.instance.rows.length) {
        const row = meta.instance.rows[0];
        state.selectedRowIds = {};
        state.selectedRowIds[row.id] = true;
        ClashReviewApi.onRunIdChanged.raiseEvent(row.original.resultId);
      }
      return { ...state };
    },
    [isAutoSelect]
  );

  const tableStateSingleSelectReducer = (newState: any, action: any): any => {
    switch (action.type) {
      case actions.toggleRowSelected: {
        return { ...newState, selectedRowIds: { [action.id]: action.value } };
      }
      default:
        break;
    }
    return newState;
  };

  return (
    <Table<TableRow>
      data={data}
      columns={columnDefinition}
      onRowClick={onRowClick}
      useControlledState={controlledState}
      stateReducer={tableStateSingleSelectReducer}
      emptyTableContent={"No runs"}
      density="extra-condensed"
      style={{ height: "100%" }} />
  );
};

export class ClashRunsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashRunsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Left && _section === StagePanelSection.End) {
      widgets.push(
        {
          id: "ClashRunsWidget",
          label: "Runs",
          defaultState: WidgetState.Open,
          content: <ClashRunsWidget />,
        }
      );
    }
    return widgets;
  }
}
