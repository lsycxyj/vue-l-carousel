<style lang="less">
.v-carousel {
	&-item {
		width: 100%;
		float: left;
	}
}
</style>

<template>
	<div class="v-carousel-item">
		<slot></slot>
	</div>
</template>

<script>
export default{
	data() {
		return {};
	},
};
</script>
