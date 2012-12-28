define({

  toBeOneOf: function() {
    if (arguments.indexOf) return arguments.indexOf(this.actual);

    for ( var i = 0; i < arguments.length; i++) {
      if (this.actual === arguments[i]) return true;
    }
    return false;
  },

  toHaveBeenCalledOnce: function() {
    if (arguments.length > 0) {
      throw new Error('toHaveBeenCalledOnce does not take arguments, use toHaveBeenCalledWith');
    }

    if (!jasmine.isSpy(this.actual)) {
      throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
    }

    this.message = function() {
      var msg = 'Expected spy ' + this.actual.identity + ' to have been called once, but was ',
          count = this.actual.callCount;
      return [
        count === 0 ? msg + 'never called.' :
                      msg + 'called ' + count + ' times.',
        msg.replace('to have', 'not to have') + 'called once.'
      ];
    };

    return this.actual.callCount == 1;
  }
});