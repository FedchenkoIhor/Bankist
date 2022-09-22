'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2022-09-17T14:11:59.604Z',
    '2022-09-19T17:01:17.194Z',
    '2022-09-21T12:36:17.929Z',
    '2022-09-22T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'CAD',
  locale: 'en-CD',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount, timer;

// MODAL WINDOW
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const modalMessage = document.querySelector('.modal-text');
const btnCloseModal = document.querySelector('.close-modal');

/////////////////////////////////////////////////
/////////////////////////////////////////////////

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// FORMAT DATE
const formatMovementsDate = function (date, locale) {
  const calcPassDay = (date1, date2) => {
    return Math.abs(Math.round((date2 - date1) / (1000 * 60 * 60 * 24)));
  };
  const passDay = calcPassDay(date, new Date());
  console.log(passDay);
  if (passDay === 0) {
    return 'Today';
  } else if (passDay === 1) {
    return 'Yesterday';
  } else if (passDay <= 7) {
    return `${passDay} days ago`;
  } else {
    const option = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return Intl.DateTimeFormat(locale, option).format(date);
  }
};

// START TIMER INTERVAL
const startLogOutTimer = function () {
  // set interval (seconds)
  let time = 300;
  // start timer
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;
    // log out if time = 0
    if (time === 0) {
      clearInterval(timer);
      // display welcome
      labelWelcome.textContent = 'Log in to get started';
      // hidden UI
      containerApp.style.opacity = 0;
    }
    time--;
  };
  tick();
  timer = setInterval(tick, 1000);
};

// RESTART TIMER WHEN MOUSE MOVE
document.body.addEventListener('mousemove', () => {
  clearInterval(timer);
  startLogOutTimer();
});

// ACCOUNT MOVEMENTS
const accountMovement = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  let html = '';
  let typeMove = '';
  // SORTING ARRAY
  const movementsSort = sort
    ? acc.movements.slice().sort((a, b) => b - a)
    : acc.movements;

  movementsSort.forEach((mov, index) => {
    const date = new Date(acc.movementsDates[index]);
    const displayDate = formatMovementsDate(date, acc.locale);
    const formatMovment = new Intl.NumberFormat(acc.locale, {
      style: 'currency',
      currency: acc.currency,
    }).format(mov);
    mov > 0 ? (typeMove = 'deposit') : (typeMove = 'withdrawal');
    html =
      html +
      `<div class="movements__row">
        <div class="movements__type movements__type--${typeMove}">${
        index + 1
      } ${typeMove}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formatMovment}</div>
        </div>`;
    // containerMovements.insertAdjacentHTML('afterbegin', html);
    // frag.appendChild(html);
  });
  // console.log(frag);
  // containerMovements.appendChild(frag);
  containerMovements.insertAdjacentHTML('afterbegin', html);
};

// FORMAT SUMM
const formatSum = function (sum, locale, curr) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
  }).format(sum);
};
// CURRENT BALANCE
const getUserBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov);
  labelBalance.textContent = formatSum(
    account.balance,
    account.locale,
    account.currency
  );
};
//TOTAL SUMMARY
const calcDisplaySummary = function (account) {
  // deposit
  const depositSummary = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = formatSum(
    depositSummary,
    account.locale,
    account.currency
  );

  // withdrawal
  const withdrawalSummary = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + Math.abs(mov));
  labelSumOut.textContent = formatSum(
    withdrawalSummary,
    account.locale,
    account.currency
  );

  // interest
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, mov) => acc + mov);
  labelSumInterest.textContent = formatSum(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = function (account) {
  // display movements
  accountMovement(account);

  // display current balance
  console.log(account);
  getUserBalance(account);

  // calc total deposit, withdrawal, interest
  calcDisplaySummary(account);
};

//LOGIN AND MESSAGE
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value.trim()
  );
  if (currentAccount?.pin === Number(inputLoginPin.value.trim())) {
    // clear and focus out input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // display welcome
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // display UI
    containerApp.style.opacity = 100;
    if (timer) clearInterval(timer);
    startLogOutTimer();

    // display current date
    const now = new Date();
    const option = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: '2-digit',
      year: 'numeric',
    };
    const locale = navigator.language;
    labelDate.textContent = Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(now);

    updateUI(currentAccount);
  } else {
    openModal('Something went wrong :( Username or password are not valid.');
  }
});

// MOVMENTS
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const summTransfer = Number(inputTransferAmount.value.trim());
  // get object account
  const reciveAccount = accounts.find(
    acc => acc.userName === inputTransferTo.value.trim()
  );

  // valid account, balance and summ
  if (
    reciveAccount &&
    currentAccount.userName !== reciveAccount.userName &&
    currentAccount.balance > summTransfer &&
    summTransfer > 0
  ) {
    console.log('Valid transfer');
    currentAccount.movements.push(-summTransfer);
    reciveAccount.movements.push(summTransfer);
    // add date of transfer
    currentAccount.movementsDates.push(new Date().toISOString());
    reciveAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    openModal(
      `GOOD! :) You share ${summTransfer} \u20AC with ${reciveAccount.owner}`
    );
  } else {
    openModal(`Something went wrong :( Check your balance or username.`);
  }
  inputTransferTo.value = inputTransferAmount.value = '';
});

// LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    openModal(`You got loan ${amount} €`);
    updateUI(currentAccount);
    inputLoanAmount.value = '';
  } else {
    openModal(`Unfortunately, you cannot get a loan, ${amount} € is too large`);
  }
});

// CLOSE ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value.trim() === currentAccount.userName &&
    Number(inputClosePin.value.trim()) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';

    openModal('Account was delete succsessfully!');
  } else {
    openModal('Wrong username or password :( ');
  }
  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

// SORT ARRAY
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  accountMovement(currentAccount, !sorted);
  sorted = !sorted;
});

// CREATE NEW USERNAME
const createUserName = function (accs) {
  accs.forEach(account => {
    account.userName = account.owner
      .toLowerCase()
      .split(' ')
      .map(el => el[0])
      .join('');
  });
};

createUserName(accounts);

// MODAL WINDOW
const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

const openModal = function (message) {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  modalMessage.textContent = message;
};

// CLOSE MODAL WINDOW
btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// 1. Select summ of all deposits
console.log(
  accounts
    .flatMap(acc => acc.movements.filter(mov => mov > 0))
    .reduce((accum, curr) => accum + curr, 0)
);

// 2. Select count of deposit more then 1000
console.log(
  accounts.flatMap(acc => acc.movements.filter(mov => mov >= 1000)).length
);

console.log(
  accounts
    .flatMap(acc => acc.movements)
    .reduce((accum, curr) => (curr >= 1000 ? ++accum : accum), 0)
);

//3. Select summ of deposit and withdrawal
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, curr) => {
      sums[curr >= 0 ? 'deposits' : 'withdrawals'] += curr;
      // curr >= 0 ? (sums.deposits += curr) : (sums.withdrawals += curr);
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals);

// 4. Convert string to sitring with titlecase This is a string with titlecase -> This Is a String With Titlecase
const convertStringIntoTitlecase = function (str) {};

// const euroToUSD = 1.1;
// const convertUSD = movements.map(mov => mov * euroToUSD);
// console.log(convertUSD);

// console.log(accounts);

// const userDeposits = function (user) {
//   accounts.map(acc => {
//     if (acc.userName === user) {
//       acc.movements.filter(mov => mov > 0);
//       console.log(acc.userName, acc.movements);
//     }
//   });
// };

// // const deposits = accounts.map(acc => acc.movements.filter(mov => mov > 0));
// userDeposits('ss');

// const maxValueMovments = movements.reduce(
//   (acc, mov) => (acc < mov ? mov : acc),
//   movements[0]
// );
// console.log(maxValueMovments);
