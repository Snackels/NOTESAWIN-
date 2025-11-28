<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let mode: 'pen' | 'select' | 'eraser' | 'pan' = 'pen';

	function setMode(newMode: 'pen' | 'select' | 'eraser' | 'pan') {
		mode = newMode;
		dispatch('mode', { mode });
	}

	function clear() {
		dispatch('clear');
	}
</script>

<div class="toolbar">
	<button class:active={mode === 'pen'} on:click={() => setMode('pen')} class="btn">
		✏️ Pen
	</button>

	<button class:active={mode === 'eraser'} on:click={() => setMode('eraser')} class="btn">
		🧹 Eraser
	</button>

	<button class:active={mode === 'select'} on:click={() => setMode('select')} class="btn">
		🔲 Select
	</button>

	<button class:active={mode === 'pan'} on:click={() => setMode('pan')} class="btn">
		🤚 Pan
	</button>

	<div class="divider"></div>

	<button on:click={clear} class="btn secondary"> 🗑️ Clear </button>
</div>

<style>
	.toolbar {
		position: fixed;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 8px;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(20px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		padding: 8px;
		border-radius: 16px;
		z-index: 50;
		border: 1px solid rgba(226, 232, 240, 0.8);
	}

	.btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 12px;
		background: #f1f5f9;
		color: #334155;
		font-weight: 500;
		font-size: 14px;
		transition: all 0.2s ease;
		border: 2px solid transparent;
	}

	.btn:hover {
		background: #e2e8f0;
		transform: translateY(-1px);
	}

	.btn.active {
		background: linear-gradient(135deg, #3b82f6, #6366f1);
		color: white;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.btn.secondary {
		background: #fee2e2;
		color: #dc2626;
	}

	.btn.secondary:hover {
		background: #fecaca;
	}

	.divider {
		width: 1px;
		background: #cbd5e1;
		margin: 0 4px;
	}
</style>
