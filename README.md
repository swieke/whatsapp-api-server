# whatsapp-api-server
root: https://azriel-whatsapp-api.herokuapp.com/
* **Method:**

  GET: Loads the QR code for WhatsApp authentication
_____________________________________
* **URL**

  /post-commands

* **Method:**

  POST

* **Data Params**
  
  example: {"startingMessage":"Welcome","commands":[{"command":"1","reply":"one"},{"command":"2","reply":"two"}]}
  
* **Success Response:**
  
  {
    "status": true
  }
