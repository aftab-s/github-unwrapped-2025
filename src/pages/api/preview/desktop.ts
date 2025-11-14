import type { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fetchGitHubStats } from '@/lib/github';
import { CardRenderer } from '@/components/CardRenderer';
import { themeNames, type ThemeName } from '@/types';

// Simple HTML escaping for interpolated text
function escapeHtml(str: string) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET');
		return res.status(405).send('Method Not Allowed');
	}

	const { username, themes } = req.query;

	if (!username || typeof username !== 'string') {
		return res.status(400).send('Missing username query parameter');
	}

	// Parse theme list (?themes=space,retro,minimal)
	let selectedThemes: ThemeName[] = themeNames.slice();
	if (themes && typeof themes === 'string') {
		const requested = themes.split(',').map(t => t.trim()).filter(Boolean);
		const valid = requested.filter((t): t is ThemeName => (themeNames as readonly string[]).includes(t));
		if (valid.length > 0) {
			selectedThemes = valid;
		}
	}

	let stats;
	try {
		stats = await fetchGitHubStats(username);
	} catch (err: any) {
		if (err.message?.includes('not found')) {
			return res.status(404).send('User not found');
		}
		if (err.message?.includes('rate limit')) {
			return res.status(429).send('Rate limited. Please retry later.');
		}
		console.error('Unexpected error generating preview:', err);
		return res.status(500).send('Internal server error');
	}

	// Generate SVG blocks for each theme using the existing CardRenderer component
		const cardsHtml = selectedThemes.map(theme => {
			const svgMarkup = renderToStaticMarkup(React.createElement(CardRenderer, { stats: stats, theme }));
		return `<div class="card-wrapper" data-theme="${theme}">
			<h2 class="theme-title">${escapeHtml(theme)}</h2>
			${svgMarkup}
			<div class="actions"><button class="download-btn" data-theme="${theme}">Download PNG</button></div>
		</div>`;
	}).join('\n');

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>Desktop Preview – ${escapeHtml(username)} – GitHub Unwrapped 2025</title>
	<style>
		body { margin:0; padding:32px; font-family: system-ui, sans-serif; background:#0f172a; color:#f1f5f9; }
		h1 { margin:0 0 24px; font-size:28px; font-weight:700; }
		.grid { display:flex; flex-wrap:wrap; gap:48px; align-items:flex-start; }
		.card-wrapper { flex:0 0 1080px; position:relative; background:#020617; padding:16px 16px 32px; border:1px solid #1e293b; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.4); }
		.theme-title { margin:0 0 12px; font-size:20px; letter-spacing:.5px; text-transform:uppercase; font-weight:600; }
		svg { display:block; max-width:100%; height:auto; border-radius:12px; }
		.actions { margin-top:16px; display:flex; gap:12px; }
		.download-btn { cursor:pointer; background:#2563eb; color:#fff; border:none; padding:12px 20px; font-size:14px; border-radius:8px; font-weight:600; letter-spacing:.5px; box-shadow:0 2px 8px rgba(0,0,0,.4); }
		.download-btn:hover { background:#1d4ed8; }
		.subtitle { font-size:14px; opacity:.8; margin-bottom:32px; }
		@media (max-width: 1400px) { /* Explicitly NOT responsive: show warning */ body::before { content:'Desktop-only preview. Use a wider screen for full cards.'; display:block; background:#dc2626; color:#fff; padding:8px 12px; margin: -32px -32px 16px; font-size:13px; } }
	</style>
	<script>
		// Convert theme SVGs to PNG on button click (client-side) without external libs
		async function svgToPng(svgEl) {
			const clone = svgEl.cloneNode(true);
			// Ensure explicit width/height
			const width = parseInt(clone.getAttribute('width') || 1080, 10);
			const height = parseInt(clone.getAttribute('height') || 1350, 10);
			// Serialize SVG
			const serializer = new XMLSerializer();
			const svgString = serializer.serializeToString(clone);
			const blob = new Blob([svgString], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			await new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = url;
			}).then(img => {
				const canvas = document.createElement('canvas');
				canvas.width = width; canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height);
				const pngData = canvas.toDataURL('image/png');
				const a = document.createElement('a');
				a.href = pngData;
				a.download = (document.body.getAttribute('data-username') || 'card') + '-' + svgEl.parentElement.getAttribute('data-theme') + '.png';
				document.body.appendChild(a); a.click(); a.remove();
				URL.revokeObjectURL(url);
			});
		}
		window.addEventListener('DOMContentLoaded', () => {
			document.querySelectorAll('.download-btn').forEach(btn => {
				btn.addEventListener('click', async () => {
					const wrapper = btn.closest('.card-wrapper');
					const svg = wrapper.querySelector('svg');
					btn.disabled = true;
					btn.textContent = 'Rendering…';
					try { await svgToPng(svg); } catch (e) { alert('Failed to export PNG'); console.error(e); }
					btn.disabled = false; btn.textContent = 'Download PNG';
				});
			});
		});
	</script>
</head>
<body data-username="${escapeHtml(username)}">
	<h1>Desktop Theme Preview – ${escapeHtml(username)}</h1>
	<p class="subtitle">Static desktop layout showing ${selectedThemes.length} theme${selectedThemes.length === 1 ? '' : 's'}. Use the buttons below each card to export PNG client side.</p>
	<div class="grid">${cardsHtml}</div>
</body>
</html>`;

	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	// Basic caching headers (short-lived) - can be tuned later
	res.setHeader('Cache-Control', 'public, max-age=300');
	return res.status(200).send(html);
}

