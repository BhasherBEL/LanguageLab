<script lang="ts">
	let message = '';

	async function sendMessage() {
		if (message.length == 0) return;
	}
</script>

<div id="mainbox">
	<div id="chatbox"></div>
	<input
		type="text"
		id="chatinput"
		placeholder="Send a message..."
		on:keypress={async (e) => {
			if (e.key === 'Enter') {
				await sendMessage();
			}
		}}
	/>
</div>

<style lang="less">
	#mainbox {
		display: flex;
		flex-direction: column;
		height: 90%;
		margin-top: 50px;
		width: clamp(300px, 50%, 800px);
		border: 2px solid black;
		border-radius: 5px;
	}

	#chatbox {
		flex-grow: 1;
	}

	#chatinput {
		height: 50px;
	}
</style>
