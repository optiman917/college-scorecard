var CLASS_PREFIX = 'picc-side-meter-';

window.PICCMeterStack = document.registerElement('picc-side-meter', {
  prototype: Object.create(
    HTMLElement.prototype,
    {

      attachedCallback: {value: function() {
        this.min = getAttr(this, 'min', 0);
        this.max = getAttr(this, 'max', 1);
        this.value = getAttr(this, 'value');
        this.average = getAttr(this, 'average');

        this.update();
      }},

      attributeChangedCallback: {value: function(attr, prev, value) {
        // pass through attribute settings to
        // properties for min, max, value an
        // average
        switch (attr) {
          case 'min':
          case 'max':
          case 'value':
          case 'average':
            this[attr] = value;
            return;
        }
      }},

      update: {
        value: function() {
          var min = this.min;
          var max = this.max;
          var value = this.value;
          var average = this.average;

          var bar = getBar(this);
          var barVal = getBarVal(this);

          if (typeof value !== 'number' || isNaN(value)) {
            // console.log('bad value:', value);

            // reset the bar
            bar.removeAttribute('style');
            bar.style.setProperty('display', 'none');

            // reset the barVal
            barVal.removeAttribute('style');
            barVal.removeAttribute('flow');
            barVal.style.setProperty('display', 'none');


            // classify and bail
            classify(this, {
              'no_data': true,
              'above_average': false,
              'below_average': false,
              'about_average': false
            });

          } else {

            classify(this, {no_data: false});

            var scale = function(v) {
              return (v - min) / (max - min) * 100;
            };

            value = Math.max(min, Math.min(this.value, max));
            var left = Math.min(value, Math.max(0, min));
            var right = Math.max(0, value);
            var scaleRight = scale(right);
            var fixNum = (max > 1) ? 1 : 0;

            // reset the bar and barVal
            bar.removeAttribute('style');
            barVal.removeAttribute('style');
            barVal.removeAttribute('flow');

            bar.style.setProperty('left', scale(left) + '%');
            bar.style.setProperty('right', (100 - scaleRight).toFixed(fixNum) + '%');

            // attach the average value next to the bar chart
            // and responsively scale it from overflowing bar
            // when the bar is a little less than full
            var magicNum = (max > 1) ? 6 : 3;
            var magicFlow = 85;
            var sRightVal = (100 - (scaleRight + magicNum) <= magicNum ) ? 100 : scaleRight + magicNum;
            var sLeftVal = (sRightVal === 100) ? scaleRight - magicNum : scaleRight;

            if ( sRightVal < (100 - magicNum) ) {
              barVal.style.setProperty('left', sLeftVal.toFixed(fixNum) + '%');

              // flag to remove left property at smaller viewports
              if ( sRightVal > magicFlow ) {
                barVal.setAttribute('flow', true);

              }
            } else {
              barVal.style.setProperty('right', (100 -  sRightVal).toFixed(fixNum) + '%');
              barVal.style.setProperty('background', 'none');
            }


            if (this.hasAttribute('average-range')) {
              var range = this.getAttribute('average-range');
              var numbers = range.split('..').map(Number);
              if (numbers.some(isNaN)) {
                console.warn('invalid average-range:', range, numbers);
                classify(this, {
                  'above_average': false,
                  'below_average': false,
                  'about_average': false
                });
              } else {
                var lo = numbers[0];
                var hi = numbers[1];
                classify(this, {
                  'above_average': value > hi,
                  'below_average': value < lo,
                  'about_average': value >= lo && value <= hi
                });
              }
            } else {
              classify(this, {
                'above_average': false,
                'below_average': false,
                'about_average': false
              });
            }

          }

          delete this.__timeout;

          this.dispatchEvent(new CustomEvent('update'));
        }
      },

      min: {
        get: function() {
          return this.__min;
        },
        set: function(value) {
          this.__min = number(value, 0);
          deferUpdate(this);
        }
      },

      max: {
        get: function() {
          return this.__max;
        },
        set: function(value) {
          this.__max = number(value, 1);
          deferUpdate(this);
        }
      },

      value: {
        get: function() {
          return this.__value;
        },
        set: function(value) {
          this.__value = number(value);
          deferUpdate(this);
        }
      },

      average: {
        get: function() {
          return this.__average;
        },
        set: function(value) {
          this.__average = number(value);
          deferUpdate(this);
        }
      }
    }
  )
});

function deferUpdate(meter, delay) {
  if (!delay) delay = 50;
  if (!meter.__timeout) {
    meter.__timeout = setTimeout(function() {
      delete meter.__timeout;
      meter.update();
    }, delay);
  }
}

function getAttr(node, attr, fallback) {
  return node.hasAttribute(attr)
    ? node.getAttribute(attr) || fallback
    : fallback;
}

function getBar(meter) {
  var bar = meter.querySelector('.' + CLASS_PREFIX + 'bar');
  if (!bar) {
    bar = meter.appendChild(document.createElement('div'));
    bar.className = CLASS_PREFIX + 'bar';
  }
  return bar;
}

function getBarVal(meter) {
  var avg = meter.querySelector('.' + CLASS_PREFIX + 'val');
  if (!avg) {
    avg = meter.appendChild(document.createElement('span'));
    avg.className = CLASS_PREFIX + 'val';
  }
  return avg;
}

function number(value, fallback) {
  var num = String(value).length ? +value : NaN;
  // console.log('number(', value, ') ->', num);
  if (arguments.length < 2) fallback = NaN;
  return isNaN(num) ? fallback : num;
}

function classify(el, classes) {
  for (var klass in classes) {
    el.classList[classes[klass] ? 'add' : 'remove'](klass);
  }
}
