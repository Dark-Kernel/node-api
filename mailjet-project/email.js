const mailjet = require ('node-mailjet')
.connect('****************************1234', '****************************abcd')
const request = mailjet
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "thrifty.noreply@gmail.com",
        "Name": "Thrifty"
      },
      "To": [
        {
          "Email": "thrifty.noreply@gmail.com",
          "Name": "Thrifty"
        }
      ],
      "Subject": "Greetings from Mailjet.",
      "TextPart": "My first Mailjet email",
      "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })

//CURL
  /*

   curl -s -X POST --user "b7aff59a27bac9c40b1307d1bfc51002:6b5861a1f5c5fcf74a3ab11b4a92c4e8" https://api.mailjet.com/v3.1/send -H 'Content-Type: application/json' -d '{
  "Messages":[
    {
      "From": {
        "Email": "thrifty.noreply@gmail.com",
        "Name": "Thrifty"
      },
      "To": [
        {
          "Email": "thrifty.noreply@gmail.com",
          "Name": "Thrifty"
        }
      ],
      "Subject": "My first Mailjet email",
      "TextPart": "Greetings from Mailjet.",
      "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
      "CustomID": "AppGettingStartedTest"
    }
  ]
}'


*/