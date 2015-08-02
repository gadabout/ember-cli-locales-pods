import Ember from 'ember';

export default {
  locales: [],

  pushLocale(local) {
    this.locales.push(local)
  },

  getLocales() {
    var hash = {};
    var i = 0;

    for (i = 0; i < this.locales.length; i++) {
      hash = Ember.$.extend(true, hash, this.locales[i]);
    }

    return hash;
  }
};

