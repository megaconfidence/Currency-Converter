if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register('/Currency-Converter/sw.js', {scope: '/Currency-Converter/'})
    // .register('../sw.js')
    .then(() => console.log("Service worker registered"));
}

if ("caches" in window) {
  caches
    .match("https://free.currencyconverterapi.com/api/v5/currencies")
    .then(res => {
      if (res) {
        res.json().then(json => {
          console.log('Fetching form cache...')
          bulidOptions(json.results)
        });
      } else {
        fetchFromApi();
      }
    });
} else {
  console.log('Fetching form API...')
  fetchFromApi();
}

function fetchFromApi() {
  // fetch("../json/currencies.json")
  fetch("https://free.currencyconverterapi.com/api/v5/currencies")
    .then(res => res.json())
    .then(currencyJson => {
      bulidOptions(currencyJson.results);
    })
    .catch(err => console.log(err));
}

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
  let options = document.querySelectorAll('option');
  initSelectForm(options);
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
  let options = document.querySelectorAll('option');
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
  // document.querySelector('#loop').id = 'loop-icon';
  document.querySelector("#convert").innerHTML = 'Converting<i id="loop-icon" class="material-icons right">autorenew</i>';
  document.querySelector("#result").style.display = 'none';
  let loader = document.querySelector('.progress');
  loader.style.display = 'block';
  setTimeout(() => {
    loader.style.display = 'none';
    document.querySelector("#convert").innerHTML = 'Convert<i id="loop" class="material-icons right">autorenew</i>';
    document.querySelector("#result").style.display = 'block';

  },3000)
  let currency1 = document.querySelector("#from_currency").value;
  let currency2 = document.querySelector("#to_currency").value;
  //checks if item is in indexedDB and makes a decision based on outcome
  localforage
    .getItem(`${currency1}_${currency2}`)
    .then(value => {
      if (value) {
        console.log("Getting from DB...");
        getFromIndexedDB(value);
      } else {
        console.log("Getting from net...");
        getFromNet();
      }
    })
    .catch(err => console.log(err));

  //gets value from indexedDB and renders it
  function getFromIndexedDB(gottenValue) {
    let calculateResult =
      document.querySelector("#from_value").value * gottenValue;
    let stringedResult = calculateResult.toString();
    if (stringedResult.includes(".")) {
      let resultArr = stringedResult.split(".");
      let part2 = `${resultArr[1][0]}${hasProperty(resultArr[1][1])}`;
      let finalResult = Number(`${resultArr[0]}.${part2}`);
      document.querySelector("#result").value = finalResult;
    } else {
      document.querySelector("#result").value = calculateResult;
    }
  }
  //gets value from net api saves and renders it
  function getFromNet() {
    fetch(
      `https://free.currencyconverterapi.com/api/v5/convert?q=${currency1}_${currency2}&compact=y`
    )
      .then(res => res.json())
      .then(resultJson => {
        showResult(resultJson[`${currency1}_${currency2}`].val);
      })
      .catch(err => console.log(err));

    function showResult(result) {
      //save result to indexedDB
      localforage
        .setItem(`${currency1}_${currency2}`, result)
        .then(value => console.log(`Saved ${value} to DB`))
        .catch(err => console.log(err));

      let calculateResult =
        document.querySelector("#from_value").value * result;
      let stringedResult = calculateResult.toString();
      if (stringedResult.includes(".")) {
        let resultArr = stringedResult.split(".");
        let part2 = `${resultArr[1][0]}${hasProperty(resultArr[1][1])}`;
        let finalResult = Number(`${resultArr[0]}.${part2}`);
        document.querySelector("#result").value = finalResult;
      } else {
        document.querySelector("#result").value = calculateResult;
      }
    }
  }
});

//materialize css plugins
//plugin for select
function initSelectForm(options) {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems, options);
}
//install PWA
let installPromptEvent;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPromptEvent = event;
  document.querySelector('#install-button').disabled = false;
});

// btnInstall.addEventListener('click', () => {
//   document.querySelector('#install-button').disabled = true;
//   installPromptEvent.prompt();
//   installPromptEvent.userChoice.then((choice) => {
//     if (choice.outcome === 'accepted') {
//       console.log('User accepted the A2HS prompt');
//     } else {
//       console.log('User dismissed the A2HS prompt');
//     }
//     installPromptEvent = null;
//   });
// });