if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register('/Currency-Converter/sw.js', {scope: '/Currency-Converter/'})
    // .register("../sw.js")
    .then(() => console.log("Service worker registered"));
}

if ("caches" in window) {
  caches
    .match("https://free.currencyconverterapi.com/api/v5/currencies")
    .then(res => {
      if (res) {
        res.json().then(json => {
          console.log("Fetching form cache...");
          bulidOptions(json.results);
        });
      } else {
        fetchFromApi();
      }
    });
} else {
  console.log("Fetching form API...");
  fetchFromApi();
}

function fetchFromApi() {
  // fetch("../currencies.json")
    fetch("https://free.currencyconverterapi.com/api/v5/currencies")
    .then(res => res.json())
    .then(currencyJson => {
      bulidOptions(currencyJson.results);
    })
    .catch(err => console.log(err));
}

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
  selectFrom();
  selectTo();
}
function selectFrom() {
  sortedArr = currencyArr.sort();
  sortedArr.forEach(currencyItem => {
    let currOption = document.createElement("option");
    currOption.setAttribute("value",currencyItem.slice(currencyItem.length - 4, currencyItem.length - 1));
    currOption.textContent = currencyItem;
    document.querySelector("#from_currency").appendChild(currOption);
  });
  let options = document.querySelectorAll("option");
  initSelectForm(options);
}

function selectTo() {
  sortedArr = currencyArr.sort();
  sortedArr.forEach(currencyItem => {
    let currOption = document.createElement("option");
    currOption.setAttribute("value", currencyItem.slice(currencyItem.length - 4, currencyItem.length - 1));
    currOption.textContent = currencyItem;
    document.querySelector("#to_currency").appendChild(currOption);
  });
  let options = document.querySelectorAll("option");
  initSelectForm(options);
}

function hasProperty(val) {
  if (val) {
    return val;
  } else {
    return "";
  }
}

document.querySelector("#convert").addEventListener("click", e => {
  e.preventDefault();

  let currency1 = document.querySelector("#from_currency").value;
  let currency2 = document.querySelector("#to_currency").value;

  if((currency1 !== '')&&(currency2 !== '')) {

    document.querySelector("#convert").innerHTML =
    'Converting<i id="loop-icon" class="material-icons right">autorenew</i>';
  document.querySelector("#result").style.display = "none";
  let loader = document.querySelectorAll(".progress");
  loader.forEach(ele => (ele.style.display = "block"));
  setTimeout(() => {
    loader.forEach(ele => (ele.style.display = "none"));
    document.querySelector("#convert").innerHTML =
      'Convert<i id="loop" class="material-icons right">autorenew</i>';
    document.querySelector("#result").style.display = "block";
  }, 3000);

    //checks if item is in indexedDB and makes a decision based on outcome
    localforage
    .getItem(`${currency1}_${currency2}`)
    .then(value => {
      if (value) {
        //gets value from indexedDB and renders it
        console.log("Getting from DB...");
        showResult(value);
      } else {
        //gets value from net api saves and renders it
        console.log("Getting from net...");
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
            M.toast({html: 'You need the internet for every initial currency conversion!'})
            console.log(err)
          });
      }
    })
    .catch(err => console.log(err));
  } else {
    M.toast({html: 'Please enter valid inputs'})
  }

  function showResult(result) {
    let currency = document.querySelector("#to_currency").value;
    let amount = (document.querySelector("#from_value").value || 1);
    let calculateResult = amount * result;
    calculateResult = toFixed(calculateResult);
    let stringedResult = calculateResult.toString();
    let hysResult;
    if (stringedResult.includes(".")) {
      let resultArr = stringedResult.split(".");
      let part2 = `${resultArr[1][0]}${hasProperty(resultArr[1][1])}`;
      let finalResult = `${resultArr[0]
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${part2}`;
      hysResult = finalResult;
      document.querySelector("#result").value = `${currency} ${finalResult}`;
    } else {
      hysResult = `${calculateResult
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
      document.querySelector(
        "#result"
      ).value = `${currency} ${calculateResult
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    //save to history
    let toCurrency = currency;
    let fromCurrency = document.querySelector("#from_currency").value;
    let exchangeRate = result;
    history(amount, fromCurrency, toCurrency, hysResult, exchangeRate);
  }

  function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split("+")[1]);
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
      .then(value => {
        console.log("Updated history with =>");
        console.log(value);
      })
      .catch(err => console.log(err));
    console.log(historyArr);
  }
});

let historyArr = [];

document.querySelector("#history-btn").addEventListener("click", () => {
  document.querySelector("#calculate-card").style.display = "none";
  document.querySelector("#history-card").style.display = "block";

  let historyOl = document.querySelector("#history-ol");
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

document.querySelector("#history-close").addEventListener("click", () => {
  document.querySelector("#calculate-card").style.display = "block";
  document.querySelector("#history-card").style.display = "none";
});

//materialize css plugins
//plugin for select
function initSelectForm(options) {
  var elems = document.querySelectorAll("select");
  var instances = M.FormSelect.init(elems, options);
}
