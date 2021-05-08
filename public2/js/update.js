const update2 = async (data, type) => {
  try {
    const url =
      type == 'password'
        ? '/api/v1/user/updatepassword'
        : '/api/v1/user/updateme';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status == 'success') {
      alert(`${type} updated successfully`);
      location.reload(true);
    }
  } catch (err) {
    alert('plzz try again');
    location.reload(true);
  }
};

document.querySelector('.form-user-data').addEventListener('submit', (el) => {
  el.preventDefault();
  const form = new FormData();
  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email').value);
  form.append('photo', document.getElementById('photo').files[0]);
  // const name = document.getElementById('name').value;
  // const email = document.getElementById('email').value;
  update2(form, 'data');
});
document
  .querySelector('.form-user-settings')
  .addEventListener('submit', (el) => {
    el.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    update2({ currentPassword, password, confirmPassword }, 'password');
  });
