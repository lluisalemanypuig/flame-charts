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
import { Rectangle, RectangleBorder, RectangleInfo } from './models/Rectangle';
import { ZoomData } from './models/ZoomData';
import { render_fitted_text, render_ticks } from './rendering';

const RECT_HEIGHT = DimensionConfiguration.RECT_HEIGHT;
const RULER_HEIGHT = DimensionConfiguration.RULER_HEIGHT;

function is_parallel(data: any): boolean {
	return data.t.startsWith('parallel_');
}

export function make_rectangles(
	ctx: CanvasRenderingContext2D,
	json_data: any,
	start_y: number,
	scale: (t: number) => number
): [Rectangle[], Rectangle[], RectangleBorder[], number] {
	const x_bprof = scale(json_data.pb);
	const w_bprof = scale(json_data.b) - x_bprof;

	const x = scale(json_data.b);
	const y = start_y;
	const w = scale(json_data.e) - x;
	const h = RECT_HEIGHT;

	const x_eprof = x + w;
	const w_eprof = scale(json_data.pe) - x_eprof;

	const N = json_data.c.length;

	let overhead_times: Rectangle[] = [
		new Rectangle(
			x_bprof,
			y + 5,
			w_bprof,
			h - 10,
			new RectangleInfo(json_data.n, 'Profiler overhead time', json_data.l, ''),
			'#0000ff'
		),
		new Rectangle(
			x_eprof,
			y + 5,
			w_eprof,
			h - 10,
			new RectangleInfo(json_data.n, 'Profiler overhead time', json_data.l, ''),
			'#ff0000'
		)
	];
	let function_times: Rectangle[] = [
		new Rectangle(x, y, w, h, new RectangleInfo(json_data.n, json_data.t, json_data.l, ''))
	];
	let par_regions: RectangleBorder[] = [];

	let max_y: number = start_y;
	let next_y: number = start_y + RECT_HEIGHT + 5;

	for (let i = 0; i < N; ++i) {
		let [times, overheads, rect_borders, sub_max_y] = make_rectangles(ctx, json_data.c[i], next_y, scale);
		if (is_parallel(json_data)) {
			next_y = sub_max_y + RECT_HEIGHT;
		}

		max_y = Math.max(sub_max_y, max_y);

		function_times = function_times.concat(times);
		overhead_times = overhead_times.concat(overheads);
		par_regions = par_regions.concat(rect_borders);
	}

	if (is_parallel(json_data)) {
		par_regions.push(new RectangleBorder(x, y + RECT_HEIGHT + 2.5, w, max_y - start_y, '#ff00d4ff'));
	}

	return [function_times, overhead_times, par_regions, max_y];
}

export function make_draw_data(canvas: any, json_data: any, zoom: ZoomData, pan: PanData): DrawData {
	let ctx = canvas.getContext('2d')!;

	// Set this to the context so that the width of a text is calculated properly.
	ctx.font = '16px sans-serif';

	let draw_data: DrawData = new DrawData([], [], [], [], []);

	const W = canvas.width;

	const N = json_data.functions.length;
	const min_time = json_data.functions[0].b;
	const max_time = json_data.functions[N - 1].e;

	const scale = (t: number) => {
		return ((t - min_time) / (max_time - min_time)) * W;
	};

	draw_data.function_time = [];
	draw_data.overhead_time = [];
	for (let i = 0; i < N; ++i) {
		const [times, overheads, rect_borders, _] = make_rectangles(ctx, json_data.functions[i], RULER_HEIGHT, scale);
		draw_data.function_time = draw_data.function_time.concat(times);
		draw_data.overhead_time = draw_data.overhead_time.concat(overheads);
		draw_data.parallel_regions = draw_data.parallel_regions.concat(rect_borders);
	}

	draw_data.init_trees();

	render_ticks(min_time, max_time, scale, zoom, draw_data);
	render_fitted_text(canvas, ctx, zoom, pan, draw_data);

	return draw_data;
}
