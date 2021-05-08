const signup = async (data) => {
  try {
    // console.log('hii');
    const url = '/api/v1/user/signup';
    const res = await axios({
      method: 'POST',
      url,
      data,
    });
    if (res.status == '200') {
      alert(`Sign in successfully`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    alert('enter your details again....Try again!!!');
  }
};
document.querySelector('.signup').addEventListener('submit', (el) => {
  el.preventDefault();
  const email = document.getElementById('emailuser').value;
  const name = document.getElementById('nameuser').value;
  const password = document.getElementById('passworduser').value;
  const confirmPassword = document.getElementById('confirmpassworduser').value;
  signup({ email, name, password, confirmPassword });
});
