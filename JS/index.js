
import dotenv from 'dotenv';
import express from 'express';

dotenv.config()

const app = express()
app.use( express.static('public') )

const port= parseInt( process.env.PORT )
app.listen(port, () => {
  console.log(`Cat mouse game server listening on port ${port}`)
})
