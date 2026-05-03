Component({
  properties: {
    rating: { type: Number, value: 0 },
    readonly: { type: Boolean, value: false },
    size: { type: Number, value: 40 },
  },

  data: {
    stars: [1, 2, 3, 4, 5],
  },

  methods: {
    onTapStar(e) {
      if (this.data.readonly) return;
      const value = e.currentTarget.dataset.value;
      this.setData({ rating: value });
      this.triggerEvent('change', { value });
    },
  },
});
