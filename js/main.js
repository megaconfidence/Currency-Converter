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
