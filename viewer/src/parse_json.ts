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
import { Rectangle, RectangleInfo } from './models/Rectangle';
import { ZoomData } from './models/ZoomData';
import { render_fitted_text, render_ticks } from './rendering';

const RECT_HEIGHT = DimensionConfiguration.RECT_HEIGHT;
const RULER_HEIGHT = DimensionConfiguration.RULER_HEIGHT;

function is_parallel(data: any): boolean {
	return data.t.startsWith('parallel_');
}

export function make_rectangles(
	ctx: CanvasRenderingContext2D,
	data: any,
	start_y: number,
	scale: (t: number) => number
): [Rectangle[], number] {
	const x_bprof = scale(data.pb);
	const w_bprof = scale(data.b) - x_bprof;

	const x = scale(data.b);
	const y = start_y;
	const w = scale(data.e) - x;
	const h = RECT_HEIGHT;

	const x_eprof = x + w;
	const w_eprof = scale(data.pe) - x_eprof;

	const N = data.c.length;

	let rectangles: Rectangle[] = [
		new Rectangle(x_bprof, y + 5, w_bprof, h - 10, new RectangleInfo(data.n, data.t, data.l, ''), '#0000ff'),
		new Rectangle(x_eprof, y + 5, w_eprof, h - 10, new RectangleInfo(data.n, data.t, data.l, ''), '#ff0000'),
		new Rectangle(x, y, w, h, new RectangleInfo(data.n, data.t, data.l, ''))
	];

	let max_y: number = start_y;
	let next_y: number = start_y + RECT_HEIGHT + 5;

	for (let i = 0; i < N; ++i) {
		let rects: Rectangle[];
		let sub_max_y: number;

		[rects, sub_max_y] = make_rectangles(ctx, data.c[i], next_y, scale);
		if (is_parallel(data)) {
			next_y = sub_max_y + RECT_HEIGHT;
		}

		max_y = Math.max(sub_max_y, max_y);

		rectangles = rectangles.concat(rects);
	}

	return [rectangles, max_y];
}

export function make_draw_data(canvas: any, json_data: any, zoom: ZoomData): DrawData {
	let ctx = canvas.getContext('2d')!;

	// Set this to the context so that the width of a text is calculated properly.
	ctx.font = '16px sans-serif';

	let draw_data: DrawData = new DrawData([], [], []);

	const W = canvas.width;

	const N = json_data.functions.length;
	const min_time = json_data.functions[0].b;
	const max_time = json_data.functions[N - 1].e;

	const scale = (t: number) => {
		return ((t - min_time) / (max_time - min_time)) * W;
	};

	draw_data.rectangles = [];
	for (let i = 0; i < N; ++i) {
		const [res, _] = make_rectangles(ctx, json_data.functions[i], RULER_HEIGHT, scale);
		draw_data.rectangles = draw_data.rectangles.concat(res);
	}

	render_ticks(min_time, max_time, scale, zoom, draw_data);
	render_fitted_text(ctx, zoom, draw_data);

	return draw_data;
}
