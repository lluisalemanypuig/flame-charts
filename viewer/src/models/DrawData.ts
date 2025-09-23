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

import { Rectangle, RectangleBorder } from './Rectangle';

export class DrawData {
	public rectangles: Rectangle[];
	public rectangle_borders: RectangleBorder[];

	public ruler_tick_positions: number[];
	public ruler_tick_labels: string[];

	constructor(rects: Rectangle[], rect_borders: RectangleBorder[], rtp: number[], rtl: string[]) {
		this.rectangles = rects;
		this.rectangle_borders = rect_borders;
		this.ruler_tick_positions = rtp;
		this.ruler_tick_labels = rtl;
	}
}
