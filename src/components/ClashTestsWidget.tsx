/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { actions, ActionType, MetaBase, TableState } from "react-table";
import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  useActiveIModelConnection,
  Widget,
  WidgetState
} from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import { TestItem } from "@itwin/clash-detection-client";
import ClashReviewApi from "./ClashReviewApi";

interface TableRow extends Record<string, string> {
  name: string;
}

const ClashTestsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [isAutoSelect, setIsAutoSelect] = React.useState<boolean>();
  const [clashTests, setClashTests] = React.useState<any>();

  useEffect(() => {
    /** Create a listener that responds to tests data retrieval */
    const removeListener = ClashReviewApi.onTestsDataChanged.addListener((value: any) => {
      setClashTests(value);
    });

    if (iModelConnection) {
      setIsAutoSelect(true);
      ClashReviewApi.setClashTests(iModelConnection.iTwinId!).catch((error) => {
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
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (!clashTests)
      return rows;

    clashTests.forEach((rowData: TestItem) => {
      const row: TableRow = {
        id: rowData.id,
        name: rowData.displayName,
      };

      rows.push(row);
    });

    return rows;
  }, [clashTests]);

  const controlledState = useCallback(
    (state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
      if (isAutoSelect && meta.instance.rows && meta.instance.rows.length) {
        const row = meta.instance.rows[0];
        state.selectedRowIds = {};
        state.selectedRowIds[row.id] = true;
      }
      return { ...state };
    },
    [isAutoSelect]);

  const tableStateSingleSelectReducer = (newState: any, action: ActionType): any => {
    switch (action.type) {
      case actions.toggleRowSelected: {
        return { ...newState, selectedRowIds: { [action.id]: action.value } };
      }
      default:
        break;
    }
    return newState;
  };

  const onRowClick = useCallback((_: any, row: any) => {
    if (iModelConnection) {
      setIsAutoSelect(false);
      ClashReviewApi.onTestIdChanged.raiseEvent(iModelConnection.iTwinId!, row.original.id);
      row.toggleRowSelected(true);
    }
  }, [iModelConnection]);

  return (
    <Table<TableRow>
      data={data}
      columns={columnDefinition}
      isLoading={!clashTests}
      isSortable
      onRowClick={onRowClick}
      useControlledState={controlledState}
      stateReducer={tableStateSingleSelectReducer}
      emptyTableContent={"No tests"}
      density="extra-condensed"
      style={{ height: "100%" }} />
  );
};

export class ClashTestsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashTestsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Left && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashTestsWidget",
          label: "Tests",
          defaultState: WidgetState.Open,
          content: <ClashTestsWidget />,
        }
      );
    }
    return widgets;
  }
}

