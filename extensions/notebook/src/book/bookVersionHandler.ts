/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { JupyterBookSection, IJupyterBookSectionV1, IJupyterBookSectionV2 } from '../contracts/content';
import { BookVersion } from './bookModel';

export class BookVersionHandler {

	constructor() { }

	/**
	 * Parses a section to JupyterSection, which is the union of  Jupyter Book v1 and v2 interfaces.
	 * There are conflicting properties between v1 and v2 Jupyter Book toc properties,
	 * this method converts v1 to v2 while keeping the v1 properties that do not exist in v2.
	 * @param version Version of the section that will be converted
	 * @param section The section that'll be converted.
	*/
	public convertFrom(version: string, section: JupyterBookSection): JupyterBookSection {
		if (version === BookVersion.v1) {
			return {
				title: section.title,
				file: (section as IJupyterBookSectionV1).external ? undefined : section.url,
				url: (section as IJupyterBookSectionV1).external ? section.url : undefined,
				sections: section.sections,
				expand_sections: section.expand_sections,
				search: (section as IJupyterBookSectionV1).search,
				divider: (section as IJupyterBookSectionV1).divider,
				header: (section as IJupyterBookSectionV1).header,
				external: (section as IJupyterBookSectionV1).external
			};
		} else {
			return {
				title: section.title,
				file: (section as IJupyterBookSectionV2).file,
				url: section.url,
				sections: section.sections,
				expand_sections: section.expand_sections
			};
		}
	}

	/**
	 * Converts the JupyterSection to either Jupyter Book v1 or v2.
	 * @param version Version of the section that will be converted
	 * @param section The section that'll be converted.
	*/
	public convertTo(version: string, section: JupyterBookSection): JupyterBookSection {
		if (version === BookVersion.v1) {
			if (section.sections && section.sections.length > 0) {
				let temp: JupyterBookSection = {};
				temp.title = section.title;
				temp.url = section.url ? section.url : section.file;
				temp.sections = [];
				for (let s of section.sections) {
					const child = this.convertTo(version, s);
					temp.sections.push(child);
				}
				return temp;
			} else {
				let newSection: JupyterBookSection = {};
				newSection.title = section.title;
				newSection.url = section.url ? section.url : section.file;
				newSection.sections = section.sections;
				newSection.expand_sections = section.expand_sections;
				newSection.search = section.search;
				newSection.divider = section.divider;
				newSection.header = section.header;
				newSection.external = section.external;
				return newSection;
			}
		}
		else if (version === BookVersion.v2) {
			if (section.sections && section.sections.length > 0) {
				let temp: JupyterBookSection = {};
				temp.title = section.title;
				temp.file = section.url ? section.url : section.file;
				temp.sections = [];
				for (let s of section.sections) {
					const child = this.convertTo(version, s);
					temp.sections.push(child);
				}
				return temp;
			} else {
				let newSection: JupyterBookSection = {};
				newSection.title = section.title;
				newSection.file = section.url ? section.url : section.file;
				newSection.sections = section.sections;
				newSection.expand_sections = section.expand_sections;
				newSection.header = section.header;
				newSection.url = section.external ? section.url : undefined;
				return newSection;
			}
		}
		return {};
	}
}
