(function(exports) {

  var resultsRoot = document.querySelector('.search-results');
  var query = location.search;
  if (!query) {
    resultsRoot.classList.add('js-empty');
    return;
  }

  // TODO: include formdb, querystring, and tagalong
  var form = new formdb.Form('#search-form');
  var data = querystring.parse(query.substr(1));
  console.debug('[search] form data:', data);
  form.setData(data);

  /**
   * This is our format generator. Its methods are format generators for
   * specific types of values, and they take a key in the data object to
   * format. For instance:
   *
   * @example
   * var formatFoo = format.percent('foo');
   * formatFoo({foo: 0.5}) -> '50%'
   */
  var format = (function() {
    var formatter = function(fmt, _empty) {
      if (typeof fmt === 'string') {
        fmt = d3.format(fmt);
      }
      return function(key, empty) {
        empty = empty || _empty;
        if (typeof empty === 'string') {
          empty = d3.functor(empty);
        }
        return function(d) {
          var value = d[key];
          return (!value && empty)
            ? empty.call(d)
            : fmt.call(d, +value, key);
        };
      };
    };

    return {
      dollars: formatter('$,d', '$0'),
      percent: formatter('%.0f', '--'),
      plural: function(key, plural) {
        if (!plural) plural = 's';
        return function(d) {
          return d[key] == 1 ? '' : plural;
        };
      }
    };
  })();

  // these directives tell the template renderer how to format specific keys in
  // the data, for instance as dollars or percentages.
  var directives = {
    branches_plural:  format.plural('NUMBRANCH'),
    tuition_in:       format.dollars('TUITIONFEE_IN'),
    tuition_out:      format.dollars('TUITIONFEE_OUT'),
    pct_pell:         format.percent('PCTPELL'),
    pct_fed_loan:     format.percent('PCTFLOAN'),
    avg_fac_salary:   format.dollars('AVGFACSAL'),
  };

  resultsRoot.classList.add('js-loading');
  API.load('../data/schools-sample.csv', function(error, rows) {
    resultsRoot.classList.remove('js-loading');
    if (error) {
      return showError(error);
    }
    console.log('loaded schools:', rows);
    resultsRoot.classList.add('js-loaded');
    var list = resultsRoot.querySelector('.schools-list');

    console.time('[render]');

    console.time('[render] template');
    // render the basic DOM template for each school
    tagalong(list, rows, directives);
    console.timeEnd('[render] template');

    console.time('[render] charts');
    // bind all of the data to elements in d3, then
    // call renderCharts() on the selection
    d3.select(list)
      .selectAll('.school-item')
      .data(rows)
      .call(renderCharts);
    console.timeEnd('[render] charts');

    console.timeEnd('[render]');
  });

  function renderCharts(selection) {
    // TODO
  }

  function showError(error) {
    console.error('error:', error);
    resultsRoot.classList.add('error');
    var out = resultsRoot.querySelector('.error');
    out.classList.remove('hidden');
    out.textContent = String(error);
  }

})(this);