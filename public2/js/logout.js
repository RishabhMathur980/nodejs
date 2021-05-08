const logout2 = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/user/logout',
    });
    console.log(res);
    if (res.data.status == 'success') {
      location.reload(true);
      // location.assign('/');
    }
  } catch (err) {
    alert('error logging out!!');
  }
};

document.querySelector('.nav__el--logout').addEventListener('click', logout2);
