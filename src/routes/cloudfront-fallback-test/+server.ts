import { error } from '@sveltejs/kit';

export function GET() {
    error(500, 'CloudFront fallback test');
}