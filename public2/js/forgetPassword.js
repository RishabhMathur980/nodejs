const forget = async (data) => {
  try {
    const url = '/api/v1/user/forgetpassword';
    const res = await axios({
      method: 'POST',
      url,
      data,
    });
    if (res.status == '200') {
      alert('plzz check your mail and click the link');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert('plzz enter the details again!!');
  }
};
document.querySelector('.forgetpassword').addEventListener('submit', (el) => {
  el.preventDefault();
  const email = document.getElementById('email2').value;
  // console.log(email);
  forget({ email });
});
