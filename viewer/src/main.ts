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

import { file_input_changed } from './reading';
import { resize_canvas, update_canvas } from './canvas';
import { ZoomData } from './models/ZoomData';
import { PanData } from './models/PanData';
import { Rectangle } from './models/Rectangle';
import { DrawData } from './models/DrawData';
import { make_draw_data } from './parse_json';
import { render_fitted_text } from './rendering';
import { DimensionConfiguration } from './models/Config';

let canvas: any = undefined;

// zoom state
let zoom: number;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 10;
let scale_x: number = 0;
const SCALE_X_STEP = 0.1;
const SCALE_X_MIN = 0;
const SCALE_X_MAX = 100;

// Pan state
let pan_x: number;
let pan_y: number;
let is_panning: boolean;
let start_pan_x: number;
let start_pan_y: number;
let start_mouse_x: number;
let start_mouse_y: number;

// Data to display
let last_selected_rect: Rectangle | undefined;
let draw_data: DrawData = new DrawData([], [], [], []);

function reset_zoom_and_pan_data() {
	zoom = 1;
	scale_x = 0;
	pan_x = 0;
	pan_y = 0;
	is_panning = false;
	start_pan_x = 0;
	start_pan_y = 0;
	start_mouse_x = 0;
	start_mouse_y = 0;
}
function make_zoom_data(): ZoomData {
	return new ZoomData(zoom, scale_x);
}
function make_pan_data(): PanData {
	return new PanData(pan_x, pan_y);
}

window.onload = function () {
	canvas = document.getElementById('display') as HTMLCanvasElement;
	let ctx = canvas.getContext('2d');

	reset_zoom_and_pan_data();

	window.addEventListener('resize', () => {
		resize_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);
	});
	resize_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);

	// Ctrl + Wheel // Wheel
	canvas.addEventListener('wheel', (e: WheelEvent) => {
		e.preventDefault();
		if (e.ctrlKey) {
			// Ctrl + wheel width scaling
			const delta = e.deltaY < 0 ? SCALE_X_STEP : -SCALE_X_STEP;
			scale_x = Math.max(SCALE_X_MIN, Math.min(SCALE_X_MAX, scale_x + delta));

			render_fitted_text(ctx, make_zoom_data(), draw_data);

			let scale_x_label = document.getElementById('width_scale') as HTMLSpanElement;
			scale_x_label.textContent = `Width scaling: ${(1 + scale_x).toFixed(1)}`;
		} else {
			// Regular wheel zoom
			const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
			zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta));

			let zoom_label = document.getElementById('zoom_level') as HTMLSpanElement;
			zoom_label.textContent = `Zoom: ${Math.round(zoom * 100)}%`;
		}
		update_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);
	});

	// click
	canvas.addEventListener('click', (e: MouseEvent) => {
		let mx = e.clientX;
		let my = e.clientY;

		// Adjust mouse coordinates for pan and zoom
		const mouse_x = mx - pan_x;
		const mouse_y = my - DimensionConfiguration.RULER_HEIGHT - pan_y;

		let selected_rect = draw_data.rectangles.find((r: Rectangle) => {
			const xx = r.x * (1 + scale_x);
			const yy = r.y;
			const ww = r.width * (1 + scale_x);
			const hh = r.height;
			return xx <= mouse_x && mouse_x <= xx + ww && yy <= mouse_y && mouse_y <= yy + hh;
		});

		if (last_selected_rect) {
			last_selected_rect.selected = false;
		}
		if (selected_rect) {
			selected_rect.selected = true;
		}
		last_selected_rect = selected_rect;

		update_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);
	});

	// Mouse pan
	canvas.addEventListener('mousedown', (e: MouseEvent) => {
		if (e.button === 0) {
			// left button
			is_panning = true;
			start_mouse_x = e.clientX;
			start_mouse_y = e.clientY;
			start_pan_x = pan_x;
			start_pan_y = pan_y;
			canvas.style.cursor = 'grabbing';
		}
	});
	window.addEventListener('mousemove', (e: MouseEvent) => {
		if (is_panning) {
			pan_x = start_pan_x + (e.clientX - start_mouse_x) / zoom;
			pan_y = start_pan_y + (e.clientY - start_mouse_y) / zoom;
			update_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);
		}
	});
	window.addEventListener('mouseup', () => {
		if (is_panning) {
			is_panning = false;
			canvas.style.cursor = 'grab';
		}
	});

	// Add event listener for import_file button
	let file_input = document.getElementById('file_input') as HTMLInputElement;
	file_input.addEventListener('change', (event: any) => {
		reset_zoom_and_pan_data();
		file_input_changed(event).then((data: any) => {
			const session_id = document.getElementById('session_id') as HTMLLabelElement;
			session_id.textContent = data.session_id;

			const zoom = make_zoom_data();
			draw_data = make_draw_data(canvas, data, zoom);

			update_canvas(canvas, zoom, make_pan_data(), draw_data);
		});
	});

	let reset_view = document.getElementById('reset_view') as HTMLButtonElement;
	reset_view.onclick = () => {
		reset_zoom_and_pan_data();

		let zoom_level = document.getElementById('width_scale') as HTMLSpanElement;
		zoom_level.textContent = `Width scaling: ${(1 + scale_x).toFixed(1)}`;

		let zoom_label = document.getElementById('zoom_level') as HTMLSpanElement;
		zoom_label.textContent = `Zoom: ${Math.round(zoom * 100)}%`;

		render_fitted_text(ctx, make_zoom_data(), draw_data);
		update_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);
	};

	// Initial draw
	update_canvas(canvas, make_zoom_data(), make_pan_data(), draw_data);
};
