const stripe = Stripe(
  'pk_test_51ImbMiSHxwprrGrETNDY7CP3zs0hUEmgYAKNxhpJCXjoNaOR9vANyzdves32x4iQq57lOSLLQLwo3Hz7SBpgFSdg00gOmoh0LU'
);

const bookid = async (tourid) => {
  try {
    const url = `/api/v1/booking/createSession/${tourid}`;
    const res = await axios({
      method: 'GET',
      url,
    });
    // console.log('fncjn');
    await stripe.redirectToCheckout({
      sessionId: res.data.session.id,
    });
    // if ((res.status = '200')) {
    //   alert('booking payment successfully');
    // }
  } catch (err) {
    console.log(err);
    alert('booking payment failed');
  }
};

document.getElementById('book-tour').addEventListener('click', (e) => {
  e.target.textContent = 'Processing.....';
  // console.log('tourid');
  const tourid = e.target.dataset.tourId;

  bookid(tourid);
});
