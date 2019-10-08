<template>
  <div class="range-chart">
    <div
      :style="{ left: bar_styles.left, right: bar_styles.right }"
      class="picc-range-bar"
      ref="bar"
    ></div>
    <span class="picc-range-label picc-range-label-min" :style="_min.styles" ref="min">
      <span v-html="_min.label"></span>
    </span>
    <span class="picc-range-label picc-range-label-max" :style="_max.styles" ref="max">
      <span v-html="_max.label"></span>
    </span>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <span
          class="picc-range-label picc-range-label-lower"
          :style="_lower.styles"
          ref="lower"
          v-on="on"
        >
          <span v-html="_lower.label"></span>
        </span>
      </template>
      <span>{{lowertip}}</span>
    </v-tooltip>
    <span
      v-if="!hideMiddle"
      class="picc-range-label picc-range-label-middle"
      :style="_middle.styles"
      ref="middle"
    >
      <span v-html="_middle.label"></span>
    </span>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <span class="picc-range-label picc-range-label-upper" :style="_upper.styles" ref="upper" v-on="on">
          <span v-html="_upper.label"></span>
        </span>
      </template>
      <span>{{uppertip}}</span>
    </v-tooltip>
  </div>
</template>

<style lang="scss">
@import "sass/_variables.scss";
.range-chart {
  $label-height: 1.5em;
  $label-offset: 1.5em;
  $label-margin: $label-offset + $label-height;
  $label-width: 8em;

  background-color: $light-gray;
  display: block;
  height: 15px;
  margin-bottom: $label-margin + 1em;
  margin-top: $label-margin;
  max-width: none;
  position: relative;

  .picc-range-bar {
    background-color: $dark-blue;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: left 0.5s, right 0.5s;
  }

  .picc-range-label {
    height: 22px;
    position: absolute;
    top: 0;
    transition: left 0.5s;
    font-size: 1rem;

    span {
      font-weight: 200;
      position: absolute;
      top: $label-height;
      width: $label-width;
    }

    &.picc-range-label-min,
    &.picc-range-label-max,
    &.picc-range-label-middle {
      color: $dark-gray;
      font-size: 0.75rem;
    }

    &.picc-range-label-max,
    &.picc-range-label-lower {
      span {
        right: 0;
        text-align: right;
      }
    }

    &.picc-range-label-middle,
    &.picc-range-label-lower,
    &.picc-range-label-upper {
      border-left: 1px solid black;
    }

    &.picc-range-label-upper {
      border-left: none;
      border-right: 1px solid black;
    }

    &.picc-range-label-min,
    &.picc-range-label-max,
    &.picc-range-label-middle {
      bottom: -0.5em;
      top: auto;

      span {
        bottom: 100%;
        top: auto;
      }
    }

    &.picc-range-label-middle {
      span {
        margin-left: -($label-width / 2);
        text-align: center;
      }
    }
  }
}
</style>

<script>
export default {
  props: {
    min: {
      type: Object,
      default: function() {
        return { value: 0, label: "0" };
      }
    },
    max: {
      type: Object,
      default: function() {
        return { value: 100, label: "100" };
      }
    },
    lower: {
      type: Object,
      default: function() {
        return { value: 25, label: "Lower" };
      }
    },
    middle: {
      type: Object,
      default: function() {
        return { value: 50, label: "Middle" };
      }
    },
    upper: {
      type: Object,
      default: function() {
        return { value: 75, label: "Upper" };
      }
    },
    lowertip: {
      type: String,
      default: ""
    },
    uppertip: {
      type: String,
      default: ""
    },
    hideMiddle: {
      type: Boolean
    }
  },
  data() {
    return {
      bar_styles: { left: 0, right: 0 }
    };
  },
  computed: {
    _min() {
      return this.styleLabel(this.min);
    },
    _max() {
      return this.styleLabel(this.max);
    },
    _lower() {
      return this.styleLabel(this.lower);
    },
    _middle() {
      return this.styleLabel(this.middle);
    },
    _upper() {
      return this.styleLabel(this.upper);
    }
  },
  methods: {
    update() {
      var min = this._min.value;
      var max = this._max.value;
      this.bar_styles.left = this.percent(this._lower.value);
      this.bar_styles.right = this.percent(
        this._min.value + this._max.value - this._upper.value
      );
    },
    scale(v) {
      return (v - this.min.value) / (this.max.value - this.min.value);
    },
    percent(v) {
      return (this.scale(v) * 100).toFixed(1) + "%";
    },
    styleLabel(obj) {
      let newObj = { ...obj };
      newObj.styles = {};
      newObj.styles.display = newObj.label ? "block" : "none";
      newObj.styles.left = this.percent(newObj.value);
      return newObj;
    }
  },

  mounted() {
    this.update();
  }
};
</script>