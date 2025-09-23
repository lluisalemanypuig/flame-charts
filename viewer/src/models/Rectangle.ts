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

export class RectangleInfo {
	public name: string;
	public type: string;
	public line: string;
	public fitted_text: string;

	constructor(name: string = '', type: string = '', line: string = '', fitted_text: string = '') {
		this.name = name;
		this.type = type;
		this.line = line;
		this.fitted_text = fitted_text;
	}
}

export class Rectangle {
	public x: number = 0;
	public y: number = 0;
	public width: number = 0;
	public height: number = 0;
	public color: string = '#00ff00';

	public selected: boolean;

	public info: RectangleInfo;

	constructor(x: number, y: number, width: number, height: number, info: RectangleInfo, color: string = '#00ff00') {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.selected = false;
		this.info = info;
	}
}

export class RectangleBorder {
	public x: number = 0;
	public y: number = 0;
	public width: number = 0;
	public height: number = 0;
	public color: string = '#00ff00';

	constructor(x: number, y: number, width: number, height: number, color: string = '#00ff00') {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
	}
}
