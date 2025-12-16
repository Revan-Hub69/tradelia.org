import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/api/order', (req,res)=>{
  const { exchange, symbol, direction, mode } = req.body;

  if(mode==='demo'){
    return res.json({status:'demo', exchange, symbol, direction});
  }

  // Integreresti qui l'API privata dell'exchange
  console.log(`Placing ${direction} order on ${symbol} (${exchange})`);
  res.json({status:'ok', exchange, symbol, direction});
});

app.listen(3000, ()=>console.log('Execution API running on http://localhost:3000'));
