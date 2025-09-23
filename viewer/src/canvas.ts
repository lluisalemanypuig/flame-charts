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
import { intersect } from './utils';

const RULER_HEIGHT = DimensionConfiguration.RULER_HEIGHT;
const RECT_HEIGHT = DimensionConfiguration.RECT_HEIGHT;

function draw_ruler(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	ruler_tick_positions: number[],
	ruler_tick_labels: string[]
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

	for (let i = 0; i < ruler_tick_positions.length; ++i) {
		// Map time to pixel position
		const x = ruler_tick_positions[i] * (1 + zoom.scale_x) + pan.x;

		// Tick label
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText(ruler_tick_labels[i], x + 2, RULER_HEIGHT - 16);

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

function draw_rectangles(
	canvas: any,
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	rectangles: Rectangle[]
) {
	const W = canvas.width;
	const H = canvas.height;

	ctx.font = '16px sans-serif';
	ctx.strokeStyle = '#333';

	let selected_rect: Rectangle | undefined;
	rectangles.forEach((rect: Rectangle) => {
		const x = rect.x * (1 + zoom.scale_x) + pan.x;
		const y = rect.y + pan.y;

		const w = rect.width * (1 + zoom.scale_x);
		const h = rect.height;

		if (intersect(0, W, x, x + w) && intersect(0, H, y, y + h)) {
			ctx.fillStyle = rect.color;
			ctx.fillRect(x, y, w, h);
			ctx.strokeRect(x, y, w, h);

			if (rect.info.fitted_text.length > 0) {
				ctx.fillStyle = '#222';
				ctx.fillText(rect.info.fitted_text, x + 5, y + RECT_HEIGHT * (3 / 4));
			}

			if (rect.selected) {
				selected_rect = rect;
			}
		}
	});

	// Draw tooltip if a rectangle is selected
	if (selected_rect) {
		draw_tooltip(ctx, zoom, pan, selected_rect);
	}
}

function draw_borders(
	canvas: any,
	ctx: CanvasRenderingContext2D,
	zoom: ZoomData,
	pan: PanData,
	rectangle_borders: RectangleBorder[]
) {
	const W = canvas.width;
	const H = canvas.height;

	rectangle_borders.forEach((rect_border: RectangleBorder) => {
		const x = rect_border.x * (1 + zoom.scale_x) + pan.x;
		const y = rect_border.y + pan.y;

		const w = rect_border.width * (1 + zoom.scale_x);
		const h = rect_border.height;

		if (intersect(0, W, x, x + w) && intersect(0, H, y, y + h)) {
			ctx.strokeStyle = rect_border.color;
			ctx.strokeRect(x, y, w, h);
		}
	});
}

export function update_canvas(canvas: any, zoom: ZoomData, pan: PanData, draw_data: DrawData) {
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();

	ctx.scale(zoom.value, zoom.value);

	draw_borders(canvas, ctx, zoom, pan, draw_data.rectangle_borders);
	draw_rectangles(canvas, ctx, zoom, pan, draw_data.rectangles);
	draw_ruler(canvas, ctx, zoom, pan, draw_data.ruler_tick_positions, draw_data.ruler_tick_labels);

	ctx.restore();
}

export function resize_canvas(canvas: any, zoom: ZoomData, pan: PanData, draw_data: DrawData) {
	const container = document.getElementById('display-container')!;
	canvas.width = container.clientWidth;
	canvas.height = container.clientHeight;
	update_canvas(canvas, zoom, pan, draw_data);
}
