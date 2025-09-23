export function intersect(p: number, q: number, s: number, t: number): boolean {
	return (p <= s && s <= q) || (p <= t && t <= q) || (s <= p && q <= t);
}
