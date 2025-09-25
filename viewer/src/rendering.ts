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

import { DimensionConfiguration } from './models/Config';
import { DrawData } from './models/DrawData';
import { PanData } from './models/PanData';
import { Rectangle } from './models/Rectangle';
import { ZoomData } from './models/ZoomData';
import { window_interval } from './utils';

const ETC_TEXT = DimensionConfiguration.ETC_TEXT;

function fit_text_to_width(ctx: CanvasRenderingContext2D, text: string, etc: string, max_width: number): string {
	if (ctx.measureText(text).width <= max_width) {
		return text;
	}

	let len = text.length - 1;
	while (len > 0) {
		// TODO: make this more efficient!
		const test = text.substring(0, len) + etc;
		if (ctx.measureText(test).width <= max_width) {
			return test;
		}
		--len;
	}
	return '';
}

export function render_fitted_text(
	canvas: any,
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	draw: DrawData
) {
	const interval = window_interval(canvas, zoom, pan);

	let rects = draw.tree_function_time.search(interval);
	rects.forEach((r: Rectangle) => {
		if (r.width * zoom.scale_x > 30) {
			r.info.fitted_text = fit_text_to_width(
				ctx,
				`${r.info.name} :: ${r.info.type}`,
				ETC_TEXT,
				r.width * zoom.scale_x - 7
			);
		} else {
			r.info.fitted_text = '';
		}
	});
}

export function render_ticks(
	min_time: number,
	max_time: number,
	scale: (t: number) => number,
	_zoom: ZoomData,
	draw: DrawData
) {
	// make ticks
	const L = (max_time - min_time) / 10;
	for (let i = 0; i < 10; ++i) {
		draw.ruler_tick_positions.push(scale(L * i));
		draw.ruler_tick_labels.push(Math.round(L * i).toString());
	}
	draw.ruler_tick_positions.push(scale(max_time));
	draw.ruler_tick_labels.push(Math.round(max_time).toString());
}
