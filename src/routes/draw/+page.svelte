<script lang="ts">
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { analyzeImage } from '$lib/gemini';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDrawing = false;
	let lastX = 0;
	let lastY = 0;
	let showPopup = false;
	let processing = false;
	let result: { type: string; content: string } | null = null;
	let showMindMap = false;
	let mindMapNodes: any[] = [];
	let draggedNode: any = null;
	let dragOffset = { x: 0, y: 0 };

	// Pan & Zoom
	let panX = 0;
	let panY = 0;
	let scale = 1;
	let isPanning = false;
	let panStartX = 0;
	let panStartY = 0;

	let mode: 'pen' | 'select' | 'eraser' | 'pan' = 'pen';
	let selection = {
		active: false,
		startX: 0,
		startY: 0,
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};

	onMount(() => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx = canvas.getContext('2d')!;
		ctx.lineWidth = 3;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = '#1e293b';

		drawGrid();

		// Add mouse wheel zoom
		canvas.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			canvas.removeEventListener('wheel', handleWheel);
		};
	});

	function handleWheel(e: WheelEvent) {
		if (!showMindMap) return;

		e.preventDefault();

		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Zoom
		const zoomIntensity = 0.1;
		const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
		const newScale = Math.min(Math.max(0.5, scale + delta), 3);

		// Adjust pan to zoom towards mouse
		const scaleChange = newScale / scale;
		panX = mouseX - (mouseX - panX) * scaleChange;
		panY = mouseY - (mouseY - panY) * scaleChange;

		scale = newScale;
		drawMindMap();
	}

	function drawGrid() {
		const gridSize = 30;
		ctx.strokeStyle = '#f1f5f9';
		ctx.lineWidth = 1;

		for (let x = 0; x < canvas.width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}

		for (let y = 0; y < canvas.height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}

		ctx.strokeStyle = '#1e293b';
		ctx.lineWidth = 3;
	}

	function getPointerPosition(e: PointerEvent | TouchEvent) {
		const rect = canvas.getBoundingClientRect();
		let clientX: number, clientY: number;

		if ('touches' in e && e.touches[0]) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else {
			clientX = (e as PointerEvent).clientX;
			clientY = (e as PointerEvent).clientY;
		}

		return {
			x: clientX - rect.left,
			y: clientY - rect.top
		};
	}

	function screenToWorld(screenX: number, screenY: number) {
		return {
			x: (screenX - panX) / scale,
			y: (screenY - panY) / scale
		};
	}

	function pointerDown(e: PointerEvent | TouchEvent) {
		e.preventDefault();
		const { x, y } = getPointerPosition(e);

		// If mind map is showing and in pan mode OR clicking on node
		if (showMindMap) {
			const worldPos = screenToWorld(x, y);

			// Check for node drag first
			const clickedNode = mindMapNodes.find(
				(node) =>
					worldPos.x >= node.x - node.width / 2 &&
					worldPos.x <= node.x + node.width / 2 &&
					worldPos.y >= node.y - node.height / 2 &&
					worldPos.y <= node.y + node.height / 2
			);

			if (clickedNode) {
				draggedNode = clickedNode;
				dragOffset.x = worldPos.x - clickedNode.x;
				dragOffset.y = worldPos.y - clickedNode.y;
				return;
			}

			// Pan mode or general panning
			if (mode === 'pan') {
				isPanning = true;
				panStartX = x - panX;
				panStartY = y - panY;
				return;
			}
		}

		if (mode === 'pen' || mode === 'eraser') {
			isDrawing = true;
			lastX = x;
			lastY = y;

			if (mode === 'eraser') {
				ctx.globalCompositeOperation = 'destination-out';
				ctx.lineWidth = 20;
			} else {
				ctx.globalCompositeOperation = 'source-over';
				ctx.lineWidth = 3;
			}
		} else if (mode === 'select') {
			selection = {
				active: true,
				startX: x,
				startY: y,
				x,
				y,
				w: 0,
				h: 0
			};
		}
	}

	function pointerMove(e: PointerEvent | TouchEvent) {
		e.preventDefault();
		const { x, y } = getPointerPosition(e);

		// Handle panning
		if (isPanning && showMindMap) {
			panX = x - panStartX;
			panY = y - panStartY;
			drawMindMap();
			return;
		}

		// Handle node dragging
		if (draggedNode && showMindMap) {
			const worldPos = screenToWorld(x, y);
			draggedNode.x = worldPos.x - dragOffset.x;
			draggedNode.y = worldPos.y - dragOffset.y;
			drawMindMap();
			return;
		}

		if ((mode === 'pen' || mode === 'eraser') && isDrawing) {
			ctx.beginPath();
			ctx.moveTo(lastX, lastY);
			ctx.lineTo(x, y);
			ctx.stroke();
			lastX = x;
			lastY = y;
		}

		if (mode === 'select' && selection.active) {
			selection.x = Math.min(x, selection.startX);
			selection.y = Math.min(y, selection.startY);
			selection.w = Math.abs(x - selection.startX);
			selection.h = Math.abs(y - selection.startY);
		}
	}

	function pointerUp(e: PointerEvent | TouchEvent) {
		e.preventDefault();
		isDrawing = false;
		draggedNode = null;
		isPanning = false;

		// Reset eraser settings
		if (mode === 'eraser') {
			ctx.globalCompositeOperation = 'source-over';
			ctx.lineWidth = 3;
		}

		if (mode === 'select' && selection.active && selection.w > 10 && selection.h > 10) {
			selection.active = false;
			showPopup = true;
		}
	}

	function handleModeChange(e: CustomEvent) {
		mode = e.detail.mode;
		showPopup = false;
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid();
		result = null;
		showPopup = false;
		showMindMap = false;
		mindMapNodes = [];
		panX = 0;
		panY = 0;
		scale = 1;
	}

	function extractSelection() {
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = selection.w;
		tempCanvas.height = selection.h;
		const tempCtx = tempCanvas.getContext('2d')!;

		tempCtx.drawImage(
			canvas,
			selection.x,
			selection.y,
			selection.w,
			selection.h,
			0,
			0,
			selection.w,
			selection.h
		);

		return tempCanvas.toDataURL('image/png');
	}

	function parseMindMapFromText(text: string) {
		const lines = text.split('\n').filter((l) => l.trim());
		const nodes: any[] = [];
		let nodeId = 0;

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith('#')) {
				const indent = line.search(/\S/);
				const level = Math.floor(indent / 2);
				const text = trimmed.replace(/^[-•→*:]/g, '').trim();

				if (text) {
					nodes.push({
						id: nodeId++,
						text: text,
						level: level,
						parent: null,
						x: 0,
						y: 0,
						width: 0,
						height: 0
					});
				}
			}
		});

		// Determine parent relationships
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].level > 0) {
				for (let j = i - 1; j >= 0; j--) {
					if (nodes[j].level < nodes[i].level) {
						nodes[i].parent = nodes[j].id;
						break;
					}
				}
			}
		}

		return nodes;
	}

	function layoutMindMap(nodes: any[]) {
		if (nodes.length === 0) return;

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;

		// IMPROVED LAYOUT - More spacing!
		const levelGapY = 200; // Vertical gap between levels
		const siblingGapX = 300; // Horizontal gap between siblings

		// Find root node
		const rootNodes = nodes.filter((n) => n.level === 0);
		if (rootNodes.length > 0) {
			rootNodes[0].x = centerX;
			rootNodes[0].y = 100; // Start from top
		}

		// Group nodes by parent
		const childrenMap: any = {};
		nodes.forEach((node) => {
			if (node.parent !== null) {
				if (!childrenMap[node.parent]) {
					childrenMap[node.parent] = [];
				}
				childrenMap[node.parent].push(node);
			}
		});

		// Calculate subtree width for better spacing
		function getSubtreeWidth(nodeId: number): number {
			const children = childrenMap[nodeId] || [];
			if (children.length === 0) return 1;

			let totalWidth = 0;
			children.forEach((child: any) => {
				totalWidth += getSubtreeWidth(child.id);
			});
			return Math.max(children.length, totalWidth);
		}

		// Layout children recursively with proper spacing
		function layoutChildren(parentId: number, startX: number, availableWidth: number) {
			const children = childrenMap[parentId] || [];
			if (children.length === 0) return;

			const parent = nodes.find((n) => n.id === parentId);
			if (!parent) return;

			// Calculate widths for each child's subtree
			const childWidths = children.map((child: any) => getSubtreeWidth(child.id));
			const totalWidthUnits = childWidths.reduce((sum: number, w: number) => sum + w, 0);

			let currentX = startX;

			children.forEach((child: any, idx: number) => {
				const childWidth = childWidths[idx];
				const childSpace = (availableWidth * childWidth) / totalWidthUnits;

				// Position child in the center of its allocated space
				child.x = currentX + childSpace / 2;
				child.y = parent.y + levelGapY;

				// Recursively layout this child's children
				layoutChildren(child.id, currentX, childSpace);

				currentX += childSpace;
			});
		}

		// Start layout from root
		if (rootNodes.length > 0) {
			const rootId = rootNodes[0].id;
			const totalWidth = getSubtreeWidth(rootId) * siblingGapX;
			const startX = centerX - totalWidth / 2;
			layoutChildren(rootId, startX, totalWidth);
		}

		// Center the view
		panX = 0;
		panY = 0;
		scale = 1;
	}

	function drawMindMap() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid();

		ctx.save();

		// Apply pan and zoom transformations
		ctx.translate(panX, panY);
		ctx.scale(scale, scale);

		// Draw connections first
		mindMapNodes.forEach((node) => {
			if (node.parent !== null) {
				const parent = mindMapNodes.find((n) => n.id === node.parent);
				if (parent) {
					drawConnection(parent, node);
				}
			}
		});

		// Draw nodes
		mindMapNodes.forEach((node) => {
			drawNode(node);
		});

		ctx.restore();
	}

	function drawConnection(parent: any, child: any) {
		ctx.save();

		const startX = parent.x;
		const startY = parent.y + parent.height / 2;
		const endX = child.x;
		const endY = child.y - child.height / 2;

		const controlY = (startY + endY) / 2;

		// Gradient line
		const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
		gradient.addColorStop(0, '#3b82f6');
		gradient.addColorStop(1, '#8b5cf6');

		ctx.strokeStyle = gradient;
		ctx.lineWidth = 3;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.bezierCurveTo(startX, controlY, endX, controlY, endX, endY);
		ctx.stroke();

		// Arrow
		const arrowSize = 12;
		ctx.fillStyle = '#8b5cf6';
		ctx.beginPath();
		ctx.moveTo(endX, endY);
		ctx.lineTo(endX - arrowSize / 2, endY - arrowSize);
		ctx.lineTo(endX + arrowSize / 2, endY - arrowSize);
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	}

	function drawNode(node: any) {
		ctx.save();

		// Measure text
		ctx.font = node.level === 0 ? 'bold 20px Inter, sans-serif' : '16px Inter, sans-serif';
		const textMetrics = ctx.measureText(node.text);
		const padding = 24;
		const width = Math.max(textMetrics.width + padding * 2, 150);
		const height = 60;

		node.width = width;
		node.height = height;

		const x = node.x - width / 2;
		const y = node.y - height / 2;

		// Shadow
		ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 5;

		// Background gradient
		let gradient;
		if (node.level === 0) {
			gradient = ctx.createLinearGradient(x, y, x, y + height);
			gradient.addColorStop(0, '#3b82f6');
			gradient.addColorStop(1, '#2563eb');
		} else if (node.level === 1) {
			gradient = ctx.createLinearGradient(x, y, x, y + height);
			gradient.addColorStop(0, '#8b5cf6');
			gradient.addColorStop(1, '#7c3aed');
		} else {
			gradient = ctx.createLinearGradient(x, y, x, y + height);
			gradient.addColorStop(0, '#06b6d4');
			gradient.addColorStop(1, '#0891b2');
		}

		ctx.fillStyle = gradient;

		// Rounded rectangle
		const radius = 15;
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		ctx.fill();

		// Border
		ctx.shadowColor = 'transparent';
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
		ctx.lineWidth = 2;
		ctx.stroke();

		// Text
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(node.text, node.x, node.y);

		// Icon
		ctx.font = '24px serif';
		const icon = node.level === 0 ? '🎯' : node.level === 1 ? '📌' : '💡';
		ctx.fillText(icon, x + 20, node.y);

		ctx.restore();
	}

	async function handleAIAction(action: string) {
		processing = true;
		showPopup = false;

		try {
			const imageData = extractSelection();
			const aiResponse = await analyzeImage(imageData, action);

			if (action === 'tidy') {
				clearCanvas();
				drawTidyText(aiResponse);
			} else if (action === 'mindmap') {
				mindMapNodes = parseMindMapFromText(aiResponse);
				layoutMindMap(mindMapNodes);
				showMindMap = true;
				mode = 'pan'; // Auto-switch to pan mode
				drawMindMap();
			} else {
				result = {
					type: action,
					content: aiResponse
				};
			}
		} catch (error) {
			console.error('Error:', error);
			result = {
				type: 'error',
				content: 'Sorry, there was an error processing your request. Please try again.'
			};
		} finally {
			processing = false;
		}
	}

	function drawTidyText(text: string) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid();

		ctx.font = '18px "Inter", -apple-system, sans-serif';
		ctx.fillStyle = '#1e293b';
		ctx.textAlign = 'left';

		const lines = text.split('\n');
		const lineHeight = 32;
		const startX = 80;
		let startY = 100;

		ctx.font = 'bold 28px "Inter", -apple-system, sans-serif';
		ctx.fillStyle = '#0f172a';
		ctx.fillText('✨ Organized Notes', startX, startY);

		startY += 60;
		ctx.font = '18px "Inter", -apple-system, sans-serif';

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (trimmed) {
				if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
					ctx.fillStyle = '#3b82f6';
					ctx.fillText('●', startX, startY);
					ctx.fillStyle = '#334155';
					ctx.fillText(trimmed.substring(1).trim(), startX + 25, startY);
				} else if (trimmed.endsWith(':')) {
					ctx.font = 'bold 20px "Inter", -apple-system, sans-serif';
					ctx.fillStyle = '#0f172a';
					ctx.fillText(trimmed, startX, startY);
					ctx.font = '18px "Inter", -apple-system, sans-serif';
				} else {
					ctx.fillStyle = '#334155';
					ctx.fillText(trimmed, startX, startY);
				}
				startY += lineHeight;
			} else {
				startY += lineHeight / 2;
			}
		});
	}

	function resetView() {
		panX = 0;
		panY = 0;
		scale = 1;
		if (showMindMap) {
			drawMindMap();
		}
	}
</script>

<svelte:head>
	<title>AI Note App</title>
</svelte:head>

<div class="app-container">
	<Toolbar on:mode={handleModeChange} on:clear={clearCanvas} />

	<canvas
		bind:this={canvas}
		on:pointerdown={pointerDown}
		on:pointermove={pointerMove}
		on:pointerup={pointerUp}
		on:pointerleave={pointerUp}
		on:touchstart={pointerDown}
		on:touchmove={pointerMove}
		on:touchend={pointerUp}
		class="drawing-canvas"
		style="cursor: {showMindMap
			? mode === 'pan'
				? isPanning
					? 'grabbing'
					: 'grab'
				: draggedNode
					? 'grabbing'
					: 'grab'
			: mode === 'pen'
				? 'crosshair'
				: mode === 'eraser'
					? 'cell'
					: 'crosshair'};"
	/>

	{#if mode === 'select' && selection.active && !showMindMap}
		<div
			class="selection-box"
			style="
                left: {selection.x}px;
                top: {selection.y}px;
                width: {selection.w}px;
                height: {selection.h}px;
            "
		/>
	{/if}

	{#if showPopup && !processing}
		<div
			class="popup"
			style="
                top: {selection.y + selection.h + 16}px;
                left: {Math.max(16, Math.min(selection.x, window.innerWidth - 250))}px;
            "
		>
			<button on:click={() => handleAIAction('mindmap')} class="popup-btn mindmap">
				🧠 Create Mind Map
			</button>
			<button on:click={() => handleAIAction('analyze')} class="popup-btn analyze">
				✨ Analyze & Summarize
			</button>
			<button on:click={() => handleAIAction('tidy')} class="popup-btn tidy">
				📝 Tidy Up Notes
			</button>
			<button on:click={() => (showPopup = false)} class="cancel-btn">Cancel</button>
		</div>
	{/if}

	{#if processing}
		<div class="processing">
			<div class="spinner">✨</div>
			<p>AI is analyzing your notes...</p>
		</div>
	{/if}

	{#if showMindMap}
		<div class="mindmap-controls">
			<div class="control-group">
				<p>
					🎯 Use <strong>Pan mode</strong> to move • <strong>Scroll</strong> to zoom •
					<strong>Click nodes</strong> to drag
				</p>
				<span class="zoom-level">Zoom: {Math.round(scale * 100)}%</span>
			</div>
			<div class="button-group">
				<button on:click={resetView} class="control-btn">🔄 Reset View</button>
				<button on:click={clearCanvas} class="control-btn close">✕ Close</button>
			</div>
		</div>
	{/if}

	{#if result && !showMindMap}
		<div class="result-panel">
			<div class="result-header">
				<h3>✨ AI Result</h3>
				<button on:click={() => (result = null)}>×</button>
			</div>
			<div class="result-content">
				<pre>{result.content}</pre>
			</div>
		</div>
	{/if}

	<div class="instructions">
		<h4>How to use:</h4>
		<ul>
			<li>✏️ Use <strong>Pen</strong> to draw notes</li>
			<li>🧹 Use <strong>Eraser</strong> to erase</li>
			<li>🔲 Use <strong>Select</strong> to lasso an area</li>
			<li>🤚 Use <strong>Pan</strong> to move mind map</li>
			<li>✨ Choose an AI action to analyze</li>
		</ul>
	</div>
</div>

<style>
	/* ... keep all your existing styles ... */
	:global(body) {
		margin: 0;
		overflow: hidden;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	.app-container {
		position: relative;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%);
	}

	.drawing-canvas {
		position: fixed;
		inset: 0;
		touch-action: none;
	}

	.selection-box {
		position: fixed;
		border: 3px solid #3b82f6;
		background: rgba(59, 130, 246, 0.1);
		pointer-events: none;
		z-index: 40;
		border-radius: 8px;
		box-shadow:
			0 0 0 2px white,
			0 0 20px rgba(59, 130, 246, 0.3);
	}

	.popup {
		position: fixed;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		border-radius: 16px;
		padding: 12px;
		z-index: 50;
		border: 1px solid rgba(226, 232, 240, 0.8);
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.popup-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 16px;
		border-radius: 12px;
		margin-bottom: 8px;
		font-weight: 500;
		transition: all 0.2s;
		border: 1px solid;
		font-size: 14px;
	}

	.popup-btn.mindmap {
		background: linear-gradient(135deg, #d1fae5, #a7f3d0);
		border-color: #6ee7b7;
		color: #064e3b;
	}

	.popup-btn.analyze {
		background: linear-gradient(135deg, #ddd6fe, #e9d5ff);
		border-color: #c4b5fd;
		color: #581c87;
	}

	.popup-btn.tidy {
		background: linear-gradient(135deg, #dbeafe, #bfdbfe);
		border-color: #93c5fd;
		color: #1e3a8a;
	}

	.popup-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.cancel-btn {
		width: 100%;
		padding: 8px;
		color: #64748b;
		font-size: 14px;
		transition: color 0.2s;
	}

	.cancel-btn:hover {
		color: #334155;
	}

	.processing {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		border-radius: 16px;
		padding: 32px 48px;
		z-index: 50;
		border: 1px solid rgba(226, 232, 240, 0.8);
		text-align: center;
	}

	.spinner {
		font-size: 48px;
		animation: spin 2s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.mindmap-controls {
		position: fixed;
		top: 100px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		border-radius: 16px;
		padding: 16px 24px;
		z-index: 50;
		border: 2px solid #3b82f6;
		display: flex;
		align-items: center;
		gap: 24px;
		animation: slideDown 0.4s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translate(-50%, -20px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.control-group p {
		margin: 0;
		color: #1e293b;
		font-size: 14px;
	}

	.zoom-level {
		padding: 4px 12px;
		background: #dbeafe;
		color: #1e40af;
		border-radius: 8px;
		font-weight: 600;
		font-size: 13px;
	}

	.button-group {
		display: flex;
		gap: 8px;
	}

	.control-btn {
		padding: 8px 16px;
		background: #3b82f6;
		color: white;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
		transition: all 0.2s;
	}

	.control-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.control-btn.close {
		background: #ef4444;
	}

	.control-btn.close:hover {
		background: #dc2626;
	}

	.result-panel {
		position: fixed;
		top: 100px;
		right: 24px;
		width: 400px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		border-radius: 20px;
		padding: 24px;
		z-index: 50;
		border: 1px solid rgba(226, 232, 240, 0.8);
		animation: slideIn 0.4s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.result-header h3 {
		margin: 0;
		font-size: 20px;
		font-weight: 700;
		color: #0f172a;
	}

	.result-header button {
		font-size: 28px;
		color: #94a3b8;
		transition: color 0.2s;
		line-height: 1;
	}

	.result-header button:hover {
		color: #475569;
	}

	.result-content {
		background: linear-gradient(135deg, #f8fafc, #e0e7ff);
		border-radius: 12px;
		padding: 16px;
		border: 1px solid #e2e8f0;
		max-height: 500px;
		overflow-y: auto;
	}

	.result-content pre {
		margin: 0;
		font-size: 14px;
		color: #334155;
		white-space: pre-wrap;
		font-family:
			'Inter',
			-apple-system,
			sans-serif;
		line-height: 1.6;
	}

	.instructions {
		position: fixed;
		bottom: 24px;
		left: 24px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12px);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(226, 232, 240, 0.8);
		max-width: 320px;
	}

	.instructions h4 {
		margin: 0 0 12px 0;
		font-weight: 700;
		color: #0f172a;
		font-size: 16px;
	}

	.instructions ul {
		margin: 0;
		padding-left: 20px;
		color: #475569;
		font-size: 14px;
		line-height: 1.8;
	}

	.instructions li {
		margin-bottom: 6px;
	}
</style>
