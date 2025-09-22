/*********************************************************************
 *
 * Viewer of Profiling instrumentator and viewer
 *
 * Copyright (C) 2025
 *
 * This file is part of "Profiling instrumentator and viewer". The full code is
 * available at:
 *      https://github.com/lluisalemanypuig/flame-charts.git
 *
 * Profiling instrumentator and viewer is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Profiling instrumentator and viewer is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Linear Arrangement Library.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Contact:
 *
 *     Lluís Alemany Puig (lluis.alemany.puig@gmail.com)
 *	   https://github.com/lluisalemanypuig
 *
 ********************************************************************/

import { Rectangle } from './models/Rectangle';

function loadJSONFile<T = unknown>(file: File): Promise<T> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event: ProgressEvent<FileReader>) => {
			try {
				const result = event.target?.result as string;
				const json: T = JSON.parse(result);
				resolve(json);
			} catch (err) {
				reject(new Error('Invalid JSON: ' + (err as Error).message));
			}
		};

		reader.onerror = () => {
			reject(new Error('Could not read file'));
		};

		reader.readAsText(file);
	});
}

export async function file_input_changed(event: any): Promise<Rectangle[]> {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (file) {
		try {
			const json_data: any = await loadJSONFile(file);
			return json_data;
		} catch (err) {
			alert((err as Error).message);
		}
	}
	return [];
}
