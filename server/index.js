import express from 'express';
import cors from 'cors';
import { NodeVM } from 'vm2';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const userCode = req.body.code; // User writes a function like: function twoSum(nums, target) { ... }

  const testCases = [
    { input: [7,2], expected: 9 },
    { input: [0, 10], expected: 10 },
  ];

  const vm = new NodeVM({
    console: 'redirect',
    timeout: 1000,
    sandbox: {},
  });

  let logs = [];
  vm.on('console.log', msg => logs.push(msg));

  try {
    // Export the user's function (user must define a named function, e.g., twoSum)
    const userFunction = vm.run(`${userCode}; module.exports = twoSum;`);

    // Run test cases
    const results = testCases.map(tc => {
      const output = userFunction(...tc.input);
      return {
        input: tc.input,
        expected: tc.expected,
        output,
        passed: output === tc.expected
      };
    });

    res.json({ results, logs });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
