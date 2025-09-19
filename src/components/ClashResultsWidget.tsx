/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { actions, ActionType, MetaBase, Row, TableState } from "react-table";
import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget, WidgetState } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";

interface TableRow extends Record<string, string> {
	elementALabel: string;
	elementBLabel: string;
	elementACategoryIndex: string;
	elementBCategoryIndex: string;
	clashType: string;
}

export interface ElementPair {
	elementAId: string | undefined;
	elementBId: string | undefined;
}

const ClashResultsWidget = () => {
	const [isAutoSelect, setIsAutoSelect] = useState<boolean>();
	const [isMarkerClicked, setIsMarkerClicked] = useState<boolean>();
	const [clashResults, setClashResults] = useState<any>();

	useEffect(() => {
		const removeListener = ClashReviewApi.onRunIdChanged.addListener((resultId: string) => {
			if (!resultId) {
				setClashResults([]);
				setIsAutoSelect(false);
			} else {
				setClashResults(undefined);
				ClashReviewApi.setClashResults(resultId).catch((error) => {
					console.error(error);
				});
			}
		});

		return () => {
			removeListener();
		};
	}, []);

	useEffect(() => {
		/** Create a listener that responds to clashResults retrieval */
		const removeListener = ClashReviewApi.onResultsDataChanged.addListener((value: any) => {
			setClashResults(value);
			setIsAutoSelect(true);
			if (value.result.length === 0) {
				ClashReviewApi.resetDisplay();
			}
		});

		const removeElementListener = ClashReviewApi.onMarkerClicked.addListener(() => {
			setIsAutoSelect(false);
			setIsMarkerClicked(true);
		});

		return () => {
			removeListener();
			removeElementListener();
		};
	}, []);

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						Header: "Element A Label",
						accessor: "elementALabel",
					},
					{
						Header: "Element B Label",
						accessor: "elementBLabel",
					},
					{
						Header: "Element A Category",
						accessor: "elementACategoryIndex",
					},
					{
						Header: "Element B Category",
						accessor: "elementBCategoryIndex",
					},
					{
						Header: "Clash Type",
						accessor: "clashType",
					},
					{
						Header: "Status",
						accessor: "status",
					},
				],
			},
		],
		[]
	);

	const data = useMemo(() => {
		const rows: any[] = [];

		if (!clashResults || !clashResults.result) return rows;

		clashResults.result.forEach((rowData: any) => {
			const elementACategoryIndex = clashResults.categoryList[rowData.elementACategoryIndex]
				? clashResults.categoryList[rowData.elementACategoryIndex].displayName.toString()
				: "";
			const elementBCategoryIndex = clashResults.categoryList[rowData.elementBCategoryIndex]
				? clashResults.categoryList[rowData.elementBCategoryIndex].displayName.toString()
				: "";
			const row: TableRow = {
				elementAId: rowData.elementAId,
				elementBId: rowData.elementBId,
				elementALabel: rowData.elementALabel,
				elementBLabel: rowData.elementBLabel,
				elementACategoryIndex,
				elementBCategoryIndex,
				clashType: rowData.clashType,
				status: rowData.status,
			};
			rows.push(row);
		});

		return rows;
	}, [clashResults]);

	const controlledState = useCallback(
		(state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
			// Clear table selection when marker is clicked
			if (isMarkerClicked) {
				state.selectedRowIds = {};
			} else if (isAutoSelect) {
				state.selectedRowIds = {};
				if (meta.instance.rows && meta.instance.rows.length) {
					const row = meta.instance.rows[0];
					state.selectedRowIds[row.id] = true;
					ClashReviewApi.visualizeClash(row.original.elementAId, row.original.elementBId, false);
				}
			}
			return { ...state };
		},
		[isAutoSelect, isMarkerClicked]
	);

	const onRowClick = useCallback((_event: React.MouseEvent, row: Row<TableRow>) => {
		setIsAutoSelect(false);
		setIsMarkerClicked(false);
		ClashReviewApi.visualizeClash(row.original.elementAId, row.original.elementBId, false);
		row.toggleRowSelected(true);
	}, []);

	const tableStateReducer = (
		newState: TableState<TableRow>,
		action: ActionType,
		_previousState: TableState<TableRow>
	): TableState<TableRow> => {
		switch (action.type) {
			case actions.toggleRowSelected: {
				newState.selectedRowIds = {};
				if (action.value) {
					newState.selectedRowIds[action.id] = true;
				}
				break;
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
			isSortable
			useControlledState={controlledState}
			stateReducer={tableStateReducer}
			emptyTableContent={"No results"}
			density="extra-condensed"
			style={{ height: "100%" }}
		/>
	);
};

export class ClashResultsWidgetProvider implements UiItemsProvider {
	public readonly id: string = "ClashResultsWidgetProvider";

	public provideWidgets(
		_stageId: string,
		_stageUsage: string,
		location: StagePanelLocation,
		_section?: StagePanelSection
	): ReadonlyArray<Widget> {
		const widgets: Widget[] = [];
		if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
			widgets.push({
				id: "ClashResultsWidget",
				label: "Clash Results",
				defaultState: WidgetState.Open,
				content: <ClashResultsWidget />,
			});
		}
		return widgets;
	}
}
