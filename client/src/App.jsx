import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const containerRef = useRef(null); // HTML container for Monaco
  const editorRef = useRef(null);    // Monaco editor instance
  const [code, setCode] = useState(`function twoSum(a,b){
  //Write your function inside this
}\n`);
  const [output, setOutput] = useState('');

  useEffect(() => {
    const loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/loader.js';

    loaderScript.onload = () => {
      window.require.config({
        paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' }
      });

      window.require(['vs/editor/editor.main'], () => {
        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value: code,
          language: 'javascript',
          theme: 'vs-dark',
          fontFamily: 'Fira Code, monospace',
          fontSize: 14,
          minimap: { enabled: false },
          suggestOnTriggerCharacters: false,
          quickSuggestions: false,
          parameterHints: { enabled: false },
          wordBasedSuggestions: false,
          snippetSuggestions: 'none'
        });
      });

    };

    document.body.appendChild(loaderScript);

    return () => {
      if (editorRef.current) editorRef.current.dispose();
      document.body.removeChild(loaderScript);
    };
  }, []);

  const runCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();

    try {
      const response = await fetch('http://localhost:3000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput('Error: ' + data.error);
      } else if (data.results) {
        // Format results for display
        let resultText = '';
        data.results.forEach((r, idx) => {
          resultText += `Test Case ${idx + 1}:\n`;
          resultText += `Input: [${r.input.join(', ')}]\n`;
          resultText += `Expected: ${r.expected}, Got: ${r.output}\n`;
          resultText += r.passed ? '✅ Passed\n\n' : '❌ Failed\n\n';
        });
        if (data.logs.length > 0) {
          resultText += 'Console Logs:\n' + data.logs.join('\n');
        }
        setOutput(resultText);
      }
    } catch (err) {
      setOutput('Fetch error: ' + err.message);
    }
  };

  const handleReset = () => {
    const initialCode = `function twoSum(a,b){
  //Write your function inside this
}\n`;
    setCode(initialCode);
    if (editorRef.current) editorRef.current.setValue(initialCode);
  };

  return (
    <>
      <div className="bg-[#0A0E17] text-white p-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-semibold text-2xl mb-3">Problem Statement</h2>
          <p className="mb-4 text-sm leading-relaxed">
            Given an array of integers{" "}
            <code className="bg-[#2d2f37] rounded px-1.5 py-0.5 text-xs font-mono">nums</code>{" "}
            and an integer{" "}
            <code className="bg-[#2d2f37] rounded px-1.5 py-0.5 text-xs font-mono">target</code>,
            return indices of the two numbers such that they add up to target.
          </p>
          <p className="mb-4 text-sm leading-relaxed">
            You may assume that each input would have exactly one solution, and you may not use the same element twice.
          </p>
          <p className="mb-6 text-sm leading-relaxed">
            You can return the answer in any order.
          </p>
          <hr className="border-t border-[#1f2129]" />
        </div>

        <div className="bg-[#0A0E17] flex items-start justify-center p-4">
          <div className="w-full max-w-4xl space-y-4">
            {/* Top bar */}
            <div className="flex justify-between">
              <div>
                <div className="bg-[#0a0e17] border border-[#1f2937] rounded-md text-white text-sm px-3 py-2">
                  JavaScript
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center space-x-1 bg-[#0a0e17] border border-[#1f2937] rounded-md text-white text-sm px-3 py-2 hover:bg-[#1f2937]"
                >
                  <i className="fas fa-redo"></i>
                  <span className="font-semibold">Reset</span>
                </button>

                <button
                  type="button"
                  onClick={runCode}
                  className="flex items-center space-x-1 bg-[#0ea5e9] rounded-md text-white text-sm px-4 py-2 hover:bg-[#0284c7]"
                >
                  <i className="fas fa-play"></i>
                  <span>Run</span>
                </button>

                <button
                  type="button"
                  onClick={runCode}
                  className="flex items-center space-x-1 bg-[#14b8a6] rounded-md text-white text-sm px-4 py-2 hover:bg-[#0d9488]"
                >
                  <i className="fas fa-paper-plane"></i>
                  <span>Submit</span>
                </button>
              </div>
            </div>

            {/* Monaco container */}
            <div
              id="container_main"
              ref={containerRef}
              style={{ width: '800px', height: '500px', border: '1px solid #ccc', margin: '20px auto' }}
            />

            {/* Output box */}
            <div
              className="bg-[#0a0e17] border border-[#1f2937] rounded-md p-4 text-gray-300 max-w-full"
              aria-label="Output section"
            >
              <p className="font-semibold mb-2 text-white">Output</p>
              <p className="text-sm whitespace-pre-wrap">{output}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
