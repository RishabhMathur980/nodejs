const reset = async (data) => {
  try {
    const url = '/api/v1/user/resetpassword';
    const res = await axios({
      method: 'POST',
      url,
      data,
    });
    if ((res.status = '200')) {
      alert('succesfully updated');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert('enter details !!!');
  }
};
document.querySelector('.resetpassword').addEventListener('submit', (el) => {
  el.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('password2').value;
  reset({ password, confirmPassword });
});
