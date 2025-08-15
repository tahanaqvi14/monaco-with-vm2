import express from 'express';
import cors from 'cors';
import { NodeVM } from 'vm2';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const userCode = req.body.code; // Get code sent from frontend

  const vm = new NodeVM({
    console: 'redirect',    // Redirect console output so we can capture it
    sandbox: {},            // Start with empty sandbox
    timeout: 1000,          // Stop code if it runs longer than 1s
    require: { external: false } // Disallow require() in sandbox
  });

  let logs = [];
  vm.on('console.log', (msg) => logs.push(msg)); // Capture console.log output

  try {
    // Wrap user code in a function export so vm2 can run it safely
    const fn = vm.run(`module.exports = function() { ${userCode} }`);
    const result = fn(); // Execute the user function
    res.json({ result, logs });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
