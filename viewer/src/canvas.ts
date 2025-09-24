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

import { Rectangle, RectangleBorder } from './models/Rectangle';
import { ZoomData } from './models/ZoomData';
import { PanData } from './models/PanData';
import { DrawData } from './models/DrawData';
import { DimensionConfiguration } from './models/Config';
import { intersect, window_interval } from './utils';

const RULER_HEIGHT = DimensionConfiguration.RULER_HEIGHT;
const RECT_HEIGHT = DimensionConfiguration.RECT_HEIGHT;

function draw_ruler(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	draw: DrawData
) {
	// Ruler background
	//ctx.save();
	//ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform so ruler is not zoomed/panned
	ctx.fillStyle = '#f0f0f0';
	ctx.fillRect(0, 0, canvas.width, RULER_HEIGHT);

	// Ruler border
	ctx.strokeStyle = '#888';
	ctx.beginPath();
	ctx.moveTo(0, RULER_HEIGHT - 0.5);
	ctx.lineTo(canvas.width, RULER_HEIGHT - 0.5);
	ctx.stroke();

	// Draw ticks and labels
	ctx.font = '12px sans-serif';
	ctx.fillStyle = '#000000';

	for (let i = 0; i < draw.ruler_tick_positions.length; ++i) {
		// Map time to pixel position
		const x = draw.ruler_tick_positions[i] * (1 + zoom.scale_x) + pan.x;

		// Tick label
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText(draw.ruler_tick_labels[i], x + 2, RULER_HEIGHT - 16);

		// Tick line
		ctx.strokeStyle = '#000000ff';
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, RULER_HEIGHT);
		ctx.stroke();

		// Guide line
		ctx.strokeStyle = '#00000077';
		ctx.beginPath();
		ctx.moveTo(x, RULER_HEIGHT);
		ctx.lineTo(x, canvas.height);
		ctx.stroke();
	}
	ctx.restore();
}

function draw_tooltip(ctx: CanvasRenderingContext2D, zoom: ZoomData, pan: PanData, rect: Rectangle) {
	const lines = [`Name: ${rect.info.name}\n`, `Type: ${rect.info.type}\n`, `Line: ${rect.info.line}\n`];
	let tooltip_width = 0;
	for (let line of lines) {
		const metrics = ctx.measureText(line);
		tooltip_width = Math.max(tooltip_width, metrics.width);
	}

	const tooltip_height = 5 + lines.length * (14 + 5) + 5;
	const tooltip_x = Math.max(0, rect.x * (1 + zoom.scale_x) + pan.x);
	const tooltip_y = rect.y + pan.y;

	// Draw tooltip background
	ctx.fillStyle = 'rgba(255,255,210,0.95)';
	ctx.fillRect(tooltip_x, tooltip_y, tooltip_width, tooltip_height);

	// Draw tooltip border
	ctx.strokeStyle = '#333';
	ctx.strokeRect(tooltip_x, tooltip_y, tooltip_width, tooltip_height);

	// Draw tooltip text
	ctx.fillStyle = '#222';
	ctx.font = '14px sans-serif';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'bottom';

	const x = tooltip_x + 5;
	let y = tooltip_y + 14 + 5;
	for (let i = 0; i < lines.length; ++i) {
		ctx.fillText(lines[i], x, y + i * (14 + 5));
	}
}

function draw_function_times(
	interval: [number, number],
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	draw: DrawData
): Rectangle | undefined {
	let selected_rect: Rectangle | undefined;
	ctx.font = '16px sans-serif';

	const rects = draw.tree_function_time.search(interval);
	rects.forEach((rect: Rectangle) => {
		const x = rect.x * (1 + zoom.scale_x) + pan.x;
		const y = rect.y + pan.y;

		const w = rect.width * (1 + zoom.scale_x);
		const h = rect.height;

		ctx.fillStyle = rect.color;
		ctx.fillRect(x, y, w, h);
		ctx.strokeStyle = '#333';
		ctx.strokeRect(x, y, w, h);

		if (rect.info.fitted_text.length > 0) {
			ctx.fillStyle = '#222';
			ctx.fillText(rect.info.fitted_text, x + 5, y + RECT_HEIGHT * (3 / 4));
		}

		if (rect.selected) {
			selected_rect = rect;
		}
	});

	return selected_rect;
}

function draw_overhead_times(
	interval: [number, number],
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	draw: DrawData
): Rectangle | undefined {
	let selected_rect: Rectangle | undefined;
	ctx.font = '16px sans-serif';

	const rects = draw.tree_overhead_time.search(interval);
	rects.forEach((rect: Rectangle) => {
		const x = rect.x * (1 + zoom.scale_x) + pan.x;
		const y = rect.y + pan.y;

		const w = rect.width * (1 + zoom.scale_x);
		const h = rect.height;

		ctx.fillStyle = rect.color;
		ctx.fillRect(x, y, w, h);
		ctx.strokeStyle = '#333';
		ctx.strokeRect(x, y, w, h);

		if (rect.selected) {
			selected_rect = rect;
		}
	});

	return selected_rect;
}

function draw_parallel_regions(
	interval: [number, number],
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	draw: DrawData
) {
	const rects = draw.tree_function_time.search(interval);
	rects.forEach((par_region: RectangleBorder) => {
		const x = par_region.x * (1 + zoom.scale_x) + pan.x;
		const y = par_region.y + pan.y;

		const w = par_region.width * (1 + zoom.scale_x);
		const h = par_region.height;

		if (intersect(interval[0], interval[1], x, x + w)) {
			ctx.strokeStyle = par_region.color;
			ctx.strokeRect(x, y, w, h);
		}
	});
}

function draw_times(canvas: any, ctx: CanvasRenderingContext2D, zoom: ZoomData, pan: PanData, draw: DrawData) {
	const interval = window_interval(canvas, zoom, pan);
	draw_parallel_regions(interval, ctx, zoom, pan, draw);
	const sel_overhead = draw_overhead_times(interval, ctx, zoom, pan, draw);
	if (sel_overhead) {
		draw_tooltip(ctx, zoom, pan, sel_overhead);
	}
	const sel_func_time = draw_function_times(interval, ctx, zoom, pan, draw);
	if (sel_func_time) {
		draw_tooltip(ctx, zoom, pan, sel_func_time);
	}
}

export function update_canvas(canvas: any, zoom: ZoomData, pan: PanData, draw: DrawData) {
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();

	ctx.scale(zoom.value, zoom.value);

	draw_times(canvas, ctx, zoom, pan, draw);
	draw_ruler(canvas, ctx, zoom, pan, draw);

	ctx.restore();
}

export function resize_canvas(canvas: any, zoom: ZoomData, pan: PanData, draw: DrawData) {
	const container = document.getElementById('display-container')!;
	canvas.width = container.clientWidth;
	canvas.height = container.clientHeight;
	update_canvas(canvas, zoom, pan, draw);
}
