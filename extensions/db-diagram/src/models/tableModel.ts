/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import ITableModel from './ITableModel';

export default class TableModel implements ITableModel {

	name: string;
	summary: string;
	relationships: Map<ITableModel, JSON>;
	columns: Map<string, string>;
	primaryKey: Map<string, string>;
	foreignKey: Map<string, string>[];

	//constructor
	constructor(name: string, summary: string, relationships: Map<ITableModel, JSON>,
		columns: Map<string, string>, primaryKey: Map<string, string>,
		foreignKey: Map<string, string>[],) {
		this.name = name;
		this.summary = summary;
		this.relationships = relationships;
		this.columns = columns;
		this.primaryKey = primaryKey;
		this.foreignKey = foreignKey;
	}

}
