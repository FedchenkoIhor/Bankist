'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

let currentAccount = '';

// MODAL WINDOW
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const modalMessage = document.querySelector('.modal-text');
const btnCloseModal = document.querySelector('.close-modal');
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// ACCOUNT MOVEMENTS
const accountMovement = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  let html = '';
  let typeMove = '';
  // SORTING ARRAY
  const movementsSort = sort
    ? movements.slice().sort((a, b) => b - a)
    : movements;

  movementsSort.forEach((mov, index) => {
    mov > 0 ? (typeMove = 'deposit') : (typeMove = 'withdrawal');
    html =
      html +
      `<div class="movements__row">
        <div class="movements__type movements__type--${typeMove}">${
        index + 1
      } ${typeMove}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${mov} &euro;</div>
        </div>`;
    // containerMovements.insertAdjacentHTML('afterbegin', html);
    // frag.appendChild(html);
  });
  // console.log(frag);
  // containerMovements.appendChild(frag);
  containerMovements.insertAdjacentHTML('afterbegin', html);
};

// CURRENT BALANCE
const getUserBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov);
  labelBalance.textContent = `${account.balance} \u20AC`;
};

//TOTAL SUMMARY
const calcDisplaySummary = function (account) {
  // deposit
  const depositSummary = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = `${depositSummary} \u20AC`;

  // withdrawal
  const withdrawalSummary = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + Math.abs(mov));
  labelSumOut.textContent = `${withdrawalSummary} \u20AC`;

  // interest
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, mov) => acc + mov);
  labelSumInterest.textContent = `${interest} \u20AC`;
};

const updateUI = function (account) {
  // display movements
  accountMovement(account.movements);

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
  accountMovement(currentAccount.movements, !sorted);
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
