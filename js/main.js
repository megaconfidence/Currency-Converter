fetch("../json/currencies.json")
  .then(res => res.json())
  .then(currencyJson => {
    bulidOptions(currencyJson.results);
  })
  .catch(err => console.log(err));

function bulidOptions(currencies) {
  selectFrom(currencies);
  selectTo(currencies);
}
function selectFrom(currencies) {
  for (let currency in currencies) {
    if (currencies.hasOwnProperty(currency)) {
      let currSym = hasProperty(currencies[currency].currencySymbol);
      let currOption = document.createElement("option");
      currOption.setAttribute("value", currency);
      currOption.textContent = `${currency} ${currSym}`;
      document.querySelector("#from_currency").appendChild(currOption);
    }
  }
}
function selectTo(currencies) {
  for (let currency in currencies) {
    if (currencies.hasOwnProperty(currency)) {
      let currSym = hasProperty(currencies[currency].currencySymbol);
      let currOption = document.createElement("option");
      currOption.setAttribute("value", currency);
      currOption.textContent = `${currency} ${currSym}`;
      document.querySelector("#to_currency").appendChild(currOption);
    }
  }
}

function hasProperty(val) {
  if (val) {
    return val;
  } else {
    return "";
  }
}

document.querySelector('#convert').addEventListener('click', (e) => {
    e.preventDefault();
    let currency1 = document.querySelector('#from_currency').value;
    let currency2 = document.querySelector('#to_currency').value;
       fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${currency1}_${currency2}&compact=y`)
    .then(res => res.json())
    .then(resultJson => {
      showResult(resultJson[`${currency1}_${currency2}`].val);
    })
    .catch(err => console.log(err));

    function showResult(result) {
        let calculateResult  = document.querySelector('#from_value').value*result;
       let stringedResult = calculateResult.toString();
       if(stringedResult.includes('.')){
           let resultArr = stringedResult.split('.');
           let part2 = `${resultArr[1][0]}${hasProperty(resultArr[1][1])}`
           let finalResult = Number(`${resultArr[0]}.${part2}`);
           document.querySelector('#result').value = finalResult;
       } else {
        document.querySelector('#result').value = calculateResult;
       }
    }
})