/* eslint-disable */
const login2 = async (data) => {
  try {
    // console.log('hii');
    const url = '/api/v1/user/login';
    const res = await axios({
      method: 'POST',
      url,
      data,
    });
    if (res.status == '200') {
      alert(`Log in successfully`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert('enter your details again..Try again!!!');
  }
};

document.querySelector('.form--login').addEventListener('submit', (el) => {
  el.preventDefault();
  console.log('ijrijf');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login2({ email, password });
});

// document.querySelector('.form--login').addEventListener('submit', (el) => {
//   console.log('riajdsklnd');
//   el.preventDefault();
//   const email = document.getElementById('emailuser').value;
//   const name = document.getElementById('nameuser').value;
//   const password = document.getElementById('passworduser').value;
//   const confirmPassword = document.getElementById('confirmpassworduser').value;
//   login2({ email, name, password, confirmPassword }, 'Sign ');
// });
