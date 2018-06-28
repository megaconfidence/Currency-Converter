let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
  .register('/Currency-Converter/sw.js', {scope: '/Currency-Converter/'})
  .then(() => console.log("Service worker registered"));
}

//fetch data
fetch("../Currency-Converter/js/currencies.json")
.then(res => res.json())
.then(currencyJson => {
  bulidOptions(currencyJson.results);
})
.catch(err => console.log(err));

function bulidOptions(currencies) {
  bulidCurrencyArr(currencies);
}

let currencyArr = [];

function bulidCurrencyArr(currencies) {

  for (let currency in currencies) {
    if (currencies.hasOwnProperty(currency)) {
      let currName = currencies[currency].currencyName;
      currencyArr.push(`${currName} (${currency})`);
    }
  }

  buildSelectFromOptions();
  buildSelectToOptions();
}

function buildSelectFromOptions() {
  sortedArr = currencyArr.sort();
  sortedArr.forEach(currencyItem => {
    let currOption = document.createElement("option");
    currOption.setAttribute("value",currencyItem.slice(currencyItem.length - 4, currencyItem.length - 1));
    currOption.textContent = currencyItem;
    $("#from_currency").appendChild(currOption);
  });
  let options = $$("option");
  initSelectForm(options);
}

function buildSelectToOptions() {
  sortedArr = currencyArr.sort();
  sortedArr.forEach(currencyItem => {
    let currOption = document.createElement("option");
    currOption.setAttribute("value", currencyItem.slice(currencyItem.length - 4, currencyItem.length - 1));
    currOption.textContent = currencyItem;
    $("#to_currency").appendChild(currOption);
  });
  let options = $$("option");
  initSelectForm(options);
}

function hasProperty(val) {

  if (val) {
    return val;
  } else {
    return "";
  }

}

//converts amount
$("#convert").addEventListener("click", e => {
  e.preventDefault();
  let currency1 = $("#from_currency").value;
  let currency2 = $("#to_currency").value;

  if((currency1 !== '')&&(currency2 !== '')) {
    $("#convert").innerHTML =
    'Converting<i id="loop-icon" class="material-icons right">autorenew</i>';
    $("#copy-result").style.display = "none";
    let loader = $$(".progress");
    loader.forEach(ele => (ele.style.display = "block"));

    setTimeout(() => {
      loader.forEach(ele => (ele.style.display = "none"));
      $("#convert").innerHTML =
      'Convert<i id="loop" class="material-icons right">autorenew</i>';
      $("#copy-result").style.display = "block";
    }, 3000);

    //checks if exchange rate is in indexedDB and makes a decision based on outcome
    localforage
    .getItem(`${currency1}_${currency2}`)
    .then(value => {

      if (value) {
        //gets value from indexedDB and renders it
        console.log("Getting exchange rate from DB...");
        showResult(value);
      } else {
        //gets value from net api saves and renders it
        console.log("Getting exchange rate from net...");
        fetch(
          `https://free.currencyconverterapi.com/api/v5/convert?q=${currency1}_${currency2}&compact=y`
        )
        .then(res => res.json())
        .then(resultJson => {
          //save result to indexedDB
          let value = resultJson[`${currency1}_${currency2}`].val;
          
          localforage
          .setItem(`${currency1}_${currency2}`, value)
          .then(value => console.log(`Saved ${value} to DB`))
          .catch(err => console.log(err));
          showResult(value);
        })
        .catch(err => {
          M.toast({html: 'You need the internet for every initial currency conversion!'});
          console.log(err);
        });
      }
    })
    .catch(err => console.log(err));
  } else {
    M.toast({html: 'Please enter valid inputs'});
  }

  function showResult(result) {
    let currency = $("#to_currency").value;
    let amount = ($("#from_value").value || 1);
    let calculateResult = amount * result;
    calculateResult = toFixed(calculateResult);
    let stringedResult = calculateResult.toString();
    let hysResult;

    if (stringedResult.includes(".")) {
      let resultArr = stringedResult.split(".");
      let part2 = `${resultArr[1][0]}${hasProperty(resultArr[1][1])}`;
      let finalResult = `${resultArr[0].toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${part2}`;
      hysResult = finalResult;
      $("#result").value = `${currency} ${finalResult}`;
    } else {
      hysResult = `${calculateResult.toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
      $("#result").value = `${currency} ${calculateResult
      .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    //save to history
    let toCurrency = currency;
    let fromCurrency = $("#from_currency").value;
    let exchangeRate = result;
    history(amount, fromCurrency, toCurrency, hysResult, exchangeRate);
  }

  function toFixed(x) {

    if (Math.abs(x) < 1.0) {
      let e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      let e = parseInt(x.toString().split("+")[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join("0");
      }
    }

    return x;
  }

  function history(amount, fromCurrency, toCurrency, result, exchangeRate) {

    if (historyArr.length === 5) {
      historyArr.shift();
    }

    historyArr.push(
      `${amount} ${fromCurrency} > ${toCurrency} = ${toCurrency} ${result} (Exchange rate : 1 ${fromCurrency} = ${exchangeRate} ${toCurrency})`
    );

    localforage
    .setItem("History", historyArr)
    .then(value => console.log("Updated history"))
    .catch(err => console.log(err));
  }
});

let historyArr = [];

$("#history-btn").addEventListener("click", () => {
  $("#calculate-card").style.display = "none";
  $("#history-card").style.display = "block";
  $('.main-card').style.height = '595px';
  let historyOl = $("#history-ol");
  historyOl.textContent = "";

  localforage
    .getItem("History")
    .then(value => {
      value.forEach((hysItem, i) => {
        let paragraph = document.createElement("li");
        paragraph.textContent = hysItem;
        historyOl.insertAdjacentElement("beforeend", paragraph);
      });
      console.log(value);
    })
    .catch(err => console.log(err));
});

$("#history-close").addEventListener("click", () => {
  $("#calculate-card").style.display = "block";
  $("#history-card").style.display = "none";
  $('.main-card').style.height = '';
});

$('#copy-icon').addEventListener('click', () => {
  let result = $('#result');
  result.disabled = false;
  result.select();

  try {
    let successful = document.execCommand('copy');
    result.disabled = true;
    M.toast({html: `Copied to clip board!`});
  } catch (err) {
    M.toast({html: 'Oops, unable to copy'});
    result.disabled = true;
  }
  deselectAll()
})

function deselectAll() {
  let element = document.activeElement;
  
  if (element && /INPUT|TEXTAREA/i.test(element.tagName)) {
    if ('selectionStart' in element) {
      element.selectionEnd = element.selectionStart;
    }
    element.blur();
  }

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

//M plugin for select
function initSelectForm(options) {
  let elems = $$("select");
  let instances = M.FormSelect.init(elems, options);
}
