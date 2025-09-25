import { DimensionConfiguration } from './models/Config';
import { PanData } from './models/PanData';
import { ZoomData } from './models/ZoomData';

export function window_interval(canvas: any, zoom: ZoomData, pan: PanData): [number, number] {
	const W = canvas.width * DimensionConfiguration.WIDTH_FACTOR;
	return [
		-(pan.x * DimensionConfiguration.WIDTH_FACTOR) / zoom.scale_x,
		(W - pan.x * DimensionConfiguration.WIDTH_FACTOR) / zoom.scale_x
	];
}

export function intersect(p: number, q: number, s: number, t: number): boolean {
	return (p <= s && s <= q) || (p <= t && t <= q) || t <= p || q <= s;
}
