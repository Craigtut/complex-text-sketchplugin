export function createComplexText(input) {
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
      searchingForEnd = '';
    } else {
      currentString += input[i];
    }
  }


  return this.complexStringArray.reduce((concatString, node) => {
      switch(node.type) {
        case '#':
          return concatString + processNumberRange(node);
        default:
          return concatString + node.text;
      }
  }, '')
}




function processNumberRange() {
  return node.text;
}
