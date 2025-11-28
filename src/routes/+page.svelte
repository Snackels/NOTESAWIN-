<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import favicon from '$lib/assets/favicon.png';

	const loading = writable(false);

	async function goToDraw() {
		loading.set(true);
		await goto('/draw');
		loading.set(false);
	}
</script>

{#if $loading}
	<!-- Loading overlay -->
	<div class="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
		<div class="flex flex-col items-center gap-4">
			<img
				src={favicon}
				alt="loading icon"
				class="w-16 sm:w-20 md:w-24 rounded-full animate-spin-neon"
			/>
			<p class="text-white text-base sm:text-lg md:text-xl font-semibold">Loading...</p>
		</div>
	</div>
{:else}
	<!-- Main content -->
	<div
		class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F3A] to-[#1A1E8C] p-4 sm:p-6 md:p-8"
	>
		<div
			class="w-full max-w-md sm:max-w-xl md:max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-2xl border border-white/20 transition-all hover:scale-105 duration-300"
		>
			<div class="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
				<img
					src={favicon}
					alt="NOTESAWIN icon"
					class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full drop-shadow-2xl animate-bounce-slow neon-glow"
				/>

				<h1
					class="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg"
				>
					NOTESAWIN
				</h1>

				<p
					class="text-gray-300 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md md:max-w-lg text-center"
				>
					Notesawin: Intelligent Note-Taking That Elevates Productivity
				</p>

				<button
					on:click={goToDraw}
					class="mt-6 sm:mt-8 px-10 sm:px-14 md:px-16 py-3 sm:py-4 rounded-full bg-white/90 text-black font-bold text-sm sm:text-lg md:text-lg shadow-lg hover:bg-white/100 hover:shadow-2xl active:scale-95 transition-all duration-200"
				>
					TRY IT NOW
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Bounce animation */
	@keyframes bounce-slow {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	.animate-bounce-slow {
		animation: bounce-slow 2.5s infinite;
	}

	/* Neon glow on icon */
	.neon-glow {
		box-shadow:
			0 0 10px #7aadff,
			0 0 25px #7b7dff33;
	}

	/* Spinning neon for loading */
	@keyframes spin-neon {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.animate-spin-neon {
		animation: spin-neon 1.5s linear infinite;
		box-shadow:
			0 0 8px #8181ff,
			0 0 20px #a27aff55;
	}
</style>
