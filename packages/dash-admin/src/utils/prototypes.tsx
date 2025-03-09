Object.defineProperty(Boolean.prototype, 'toInt', {
	value: function () {
		return this & 1;
	},
});