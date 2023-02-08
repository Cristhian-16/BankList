'use strict';

import { account1, account2, account3, account4 } from '../js/users.js';

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

/* Modal */
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal');

function openModal(name) {

  removeModal();

  const text = document.createElement('h1');
  text.textContent = `Welcome ${name} 🥵`;
  text.classList.add('texto-bienvenida');

  modal.appendChild(text);

  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');

  setTimeout(() => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
  }, 2000);
}

function removeModal() {
  while (modal.firstChild) {
    modal.removeChild(modal.firstChild);
  }
}

const displayMovements = (acc, sort = false) => {

  containerMovements.innerHTML = '';


  const movs = sort ? acc.movements.slice().sort((a, b) => b - a) : acc.movements


  movs.forEach((mov, index) => {

    /* Preguntamos si la transaccion es mayor a 0 */
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    /* Creamos el HTML */
    const html = document.createElement('div');
    html.classList.add('movements__row');

    html.innerHTML = `
        <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
        <div class="movements__value">${mov}</div>
    `

    containerMovements.appendChild(html)

  });
}

const balanceAccount = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
}

const calcDisplaySummary = function (acc) {
  const { movements, interestRate } = acc
  const ingresos = movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${ingresos}€`;

  const retiro = movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(retiro)}€`;

  const interes =
    movements.filter(mov => mov > 0)
      .map(mov => mov * interestRate / 100)
      .filter(int => int > 1)
      .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = `${interes}€`
}

/* Create USer */
const createUser = function (accounts) {

  accounts.forEach(acc => {
    const { owner } = acc;
    /* Creo una nueva Propiedad => Cristhian Espiritu = ce */
    acc.username = owner.toLowerCase().split(' ').map(u => u[0]).join('');
  })
}
createUser(accounts);

function callFunction(acc) {
  displayMovements(acc);
  balanceAccount(acc)
  calcDisplaySummary(acc);
}
/* Event Listener */
let currentAcount; /* cuenta Actual */

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  /* Encontrara una cuenta */
  currentAcount = accounts.find(acc => acc.username === inputLoginUsername.value);

  /* CurrentAcount es un objeto */
  /* Puede que existe o no , si no existe te mandara undefined */
  if (currentAcount?.pin === Number(inputLoginPin.value)) {
    openModal(currentAcount.owner);
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    setTimeout(() => {
      labelWelcome.textContent = `Welcome ${currentAcount.owner.split(' ', 1)}`
      containerApp.style.opacity = '100'
    }, 2500);

    callFunction(currentAcount)
  }
});


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recibedAcount = accounts.find(acc => acc.username === inputTransferTo.value);

  if (amount > 0 && recibedAcount && currentAcount.balance > amount && recibedAcount?.username !== currentAcount.username) {
    currentAcount.movements.push(-amount);
    recibedAcount.movements.push(amount);

    inputTransferTo.value = '';
    inputTransferAmount.value = '';
    inputTransferAmount.blur();

    callFunction(currentAcount)
  }

})

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  currentAcount.movements.sort((a, b) => b - a);

  callFunction(currentAcount);
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  /* 
    const prestamo = currentAcount.balance.some( mov => mov > valor)
    currentAcount.movements.push(valor)
  */
  const valor = Number(inputLoanAmount.value)

  if (valor > 0 && currentAcount.movements.some(mov => mov > valor * 0.1)) {
    currentAcount.movements.push(valor);
  }
  callFunction(currentAcount)

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault()

  /* Logica */
  if (inputCloseUsername.value === currentAcount.username && Number(inputClosePin.value) === currentAcount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAcount.username);

    accounts.splice(index, 1);
    containerApp.style.opacity = '0';

  }

  inputCloseUsername.value = '';
  inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
  inputClosePin.blur();

})
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAcount, !sorted);
  sorted = !sorted;
})
