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
import IntervalTree from '@flatten-js/interval-tree';

export class DrawData {
	public function_time: Rectangle[];
	public tree_function_time: IntervalTree;

	public overhead_time: Rectangle[];
	public tree_overhead_time: IntervalTree;

	public parallel_regions: RectangleBorder[];
	public tree_parallel_regions: IntervalTree;

	public ruler_tick_positions: number[];
	public ruler_tick_labels: string[];

	constructor(
		rects: Rectangle[],
		overheads: Rectangle[],
		par_regions: RectangleBorder[],
		rtp: number[],
		rtl: string[]
	) {
		this.function_time = rects;
		this.tree_function_time = new IntervalTree();

		this.overhead_time = overheads;
		this.tree_overhead_time = new IntervalTree();

		this.parallel_regions = par_regions;
		this.tree_parallel_regions = new IntervalTree();

		this.ruler_tick_positions = rtp;
		this.ruler_tick_labels = rtl;
	}

	private init_function_times_tree(): void {
		const N = this.function_time.length;
		for (let i = 0; i < N; ++i) {
			const r = this.function_time[i];
			this.tree_function_time.insert([r.x, r.x + r.width], r);
		}
	}
	private init_overhead_times_tree(): void {
		const N = this.overhead_time.length;
		for (let i = 0; i < N; ++i) {
			const r = this.overhead_time[i];
			this.tree_overhead_time.insert([r.x, r.x + r.width], r);
		}
	}
	private init_parallel_regions_tree(): void {
		const N = this.parallel_regions.length;
		for (let i = 0; i < N; ++i) {
			const r = this.parallel_regions[i];
			this.tree_parallel_regions.insert([r.x, r.x + r.width], r);
		}
	}

	public init_trees(): void {
		this.init_function_times_tree();
		this.init_overhead_times_tree();
		this.init_parallel_regions_tree();
	}
}
