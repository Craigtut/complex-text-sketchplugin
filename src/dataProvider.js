const sketch = require('sketch')
const { DataSupplier, UI, Settings } = sketch
const util = require('util')

export function onStartup () {
  // To register the plugin, uncomment the relevant type:
  DataSupplier.registerDataSupplier('public.text', 'complex-text-sketchplugin', 'SupplyData')
  // DataSupplier.registerDataSupplier('public.image', 'complex-text-sketchplugin', 'SupplyData')
}

export function onShutdown () {
  // Deregister the plugin
  DataSupplier.deregisterDataSuppliers()
}

export function onDataRequested (context) {
  let dataKey = context.data.key
  const items = util.toArray(context.data.items).map(sketch.fromNative)
  items.forEach((item, index) => {
    let data = Math.random().toString()
    DataSupplier.supplyDataAtIndex(dataKey, data, index)
  })
}

export function onComplexTextRequest(context) {
  const settingsKey = 'complexText.customString';

  const selectedLayers = sketch.getSelectedDocument().selectedLayers.layers;
  const previousSettings = selectedLayers.map(layer => Settings.layerSettingForKey(layer, settingsKey));

  const singlePreviousSettings = previousSettings.find((setting) => setting !== undefined);
  const formContent = singlePreviousSettings || 'example';

  if (sketch.version.sketch < 53) {
    const userInput = UI.getStringFromUser('Complex String, ex. $[0-6].[0-99] dollars', formContent).trim()
    if (userInput !== 'null') {
      selectedLayers.forEach(layer => {
        Settings.setLayerSettingForKey(layer, settingsKey, userInput)
      })
      
      const complexString = createComplexString(userInput);
      supplyDataToAll(context, complexString);

    }
  } else {
    UI.getInputFromUser('Complex String, ex. $[0-6].[0-99] dollars',
      { initialValue: formContent },
      (err, userInput) => {
        if (err) { return } // user hit cancel
        if ((userInput = userInput.trim()) !== 'null') {
          selectedLayers.forEach(layer => {
            Settings.setLayerSettingForKey(layer, settingsKey, userInput)
          })

          const complexString = createComplexString(userInput);
          supplyDataToAll(context, complexString);

        }
      }
    )
  }

}

export function createComplexString(input) {
  const complexStringArray = []
  const supportedTypes = ['#']

  let currentString = '';
  let searchingForEnd = false;

  for (let i = 0; i < input.length; i++) {
    if (supportedTypes.includes(input[i]) && i + 1 !== input.length && input[i + 1] === '[') {
      complexStringArray.push({ type: 'simpleString', text: currentString});
      searchingForEnd = input[i];

      currentString = input[i];
    } else if(searchingForEnd && input[i] === ']') {
      currentString += input[i];
      complexStringArray.push({ type: searchingForEnd, text: currentString});
      searchingForEnd = false;
      currentString = '';
    } else {
      currentString += input[i];
      if (i + 1 === input.length) {
        complexStringArray.push({ type: 'simpleString', text: currentString});
      }
    }
  }

  console.log(complexStringArray)

  return complexStringArray.reduce((concatString, node) => {
      switch(node.type) {
        case '#':
          return concatString + processNumberRange(node);
        default:
          return concatString + node.text;
      }
  }, '')
}

function processNumberRange(node) {
  const regex = /[^\[]+(?=\])/;
  const range = node.text.match(regex)[0];
  console.log(range)
  const minMax = range.split('-');

  const min = Math.ceil(parseInt(minMax[0]));
  const max = Math.floor(parseInt(minMax[1]) + 1);
  return Math.floor(Math.random() * (max - min)) + min;
}

function supplyDataToAll(context, data) {
  let dataKey = context.data.key;
  const items = util.toArray(context.data.items).map(sketch.fromNative);

  items.forEach((item, index) => {
    DataSupplier.supplyDataAtIndex(dataKey, data, index);
  })
}
