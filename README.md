# ember-cli-locales-pods

Enjoy translating your pods with the language files in the pod directory!

## What is ember-cli-locales-pods?
Say you have an activities route
##### Generate regular route:
```
ember g route activities -p
```
##### Then, use ember-cli-locales-pods to generate locale files:
```
ember g locale activities -p
```

##### Your file structure would be:
```
app/

app/activities
app/activities/route.js
app/activities/template.hbs
app/activities/locales/[lang].js

app/locales/pods/[lang].js

```
##### app/locales/[lang].js
```
import Ember from 'ember';
import PodLocaes from 'stetson/locales/pods/en';

export default Ember.$.extend(true, PodLocaes, {
  "anything-else": {
    "could-go": "here",
    "if-you": "have no pod translations"
  }
});
```

## Installation

##### Install ember-cli-locales-pods

* `ember install ember-cli-locales-pods`

##### The import file
You need to add the import file into wherever you pass on your translations to your translation library as shown above. This addon simple combines all of your locales into a single hash for you to import somewhere else.

## Usage

To generate locales into your pod - just run:

```
ember g locale [path] -p
```

To provide specify a language (default to `en`) add lang:[lang]:

```
ember g locale [path] lang:de -p
```

Enjoy translating your pods! :)
