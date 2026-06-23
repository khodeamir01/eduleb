exports.createPayment = async function ({ amountInRial, description, mobile }) {

  try {
    const response = await fetch(process.env.ZARINPAL_PAYMENT_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID ,
        amount: amountInRial,
        callback_url: process.env.ZARINPAL_PAYMENT_CALLBACK_URL,
        description,
        metadata: {
          mobile,
        }
      }),
    });
  
    const data = await response.json();
  
    return {
      authority: data.data.authority,
      paymentUrl: process.env.ZARINPAL_PAYMENT_URL + data.data.authority,
    };
    
  } catch (err) {
    throw Error(err)
  }


};

exports.verifyPayment = async function ({authority, amountInRial}) {

  try {
    const response = await fetch(process.env.ZARINPAL_PAYMENT_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        authority: authority,
        amount: amountInRial
      })
    });
 
    const responseData = await response.json();
    console.log(responseData);
  
    return responseData.data
    
  } catch (err) {
    throw Error(err)
  }
};
