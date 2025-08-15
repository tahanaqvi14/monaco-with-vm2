import React, { useEffect, useRef, useState } from 'react';
import './App.css'
// Load Monaco via CDN, so we use the loader inside useEffect
// Make sure you include monaco-editor loader in your public/index.html or use dynamic import here.

const App = () => {
  const containerRef = useRef(null);
  // Creates a ref to store the HTML container where Monaco will appear.
  const editorRef = useRef(null);
  // Creates a ref to store the actual Monaco editor instance once it’s created.
  const [output, setOutput] = useState('');
  // Sets up a piece of state called output to hold the run results or errors.
  useEffect(() => {
    // Load Monaco Editor AMD loader script dynamically
    const loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/loader.js';
    // Tells that script tag to load Monaco’s AMD loader from jsDelivr.


    // Sets up a function to run after the loader script finishes downloading.
    loaderScript.onload = () => {
      window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' } });
      // Configures Monaco’s module loader so it knows where to find its files.
      window.require(['vs/editor/editor.main'], () => { //Loads Monaco’s main editor module.

        // Define the custom theme with black borders
        window.monaco.editor.defineTheme('custom-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
            { token: 'keyword', foreground: '22d3ee', fontStyle: 'bold' },
            { token: 'string', foreground: 'facc15' },
            { token: 'number', foreground: 'f472b6' },
          ],
          colors: {
            'editor.background': '#0d1117',
            'editor.foreground': '#e5e7eb',
            'editorLineNumber.foreground': '#6b7280',
            'editorCursor.foreground': '#22d3ee',
            'editor.selectionBackground': '#164e63',
            'editor.inactiveSelectionBackground': '#1e293b',

            // Black border colors for Monaco UI elements
            'editorWidget.border': '#000000',
            'editorGroup.border': '#000000',
            'sideBar.border': '#000000'
          }
        });



        editorRef.current = window.monaco.editor.create(containerRef.current, { //Creates a new Monaco editor inside your containerRef element.
          value: `// Write your JS code here\nconsole.log("Hello from sandbox!");\nreturn 42;`,
          language: 'javascript',
          theme: 'custom-dark', // 👈 Use your theme
          fontFamily: 'Fira Code, monospace',
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true
        
        });
      });
    };
    // Actually adds the <script> tag to the page so it starts loading.
    document.body.appendChild(loaderScript);

    // Cleanup editor on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
      document.body.removeChild(loaderScript);
    };
  }, []);




  const runCode = async () => {
    if (!editorRef.current) return; //If the editor isn’t ready yet, stop the function.
    const code = editorRef.current.getValue(); //Gets whatever text is in the editor right now.

    // Sends a request to your local backend to execute the code.
    try {
      const response = await fetch('http://localhost:3000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      //backend data
      const data = await response.json();

      if (data.error) {
        setOutput('Error: ' + data.error);
      } else {
        setOutput(`Result: ${data.result}\n\nConsole Logs:\n${data.logs.join('\n')}`);
      }
    } catch (err) {
      setOutput('Fetch error: ' + err.message);
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Monaco Editor - JS Sandbox</h2>

      {/* Empty div where Monaco will be placed, with some styling. */}
      <div
        id='container_main'
        ref={containerRef}
        style={{ width: '800px', height: '500px', border: '1px solid #ccc', margin: '20px auto' }}
      />

      <button
        onClick={runCode}
        style={{
          right: 10,
          display: 'block',
          margin: '0 auto 20px auto',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Run Code
      </button>


      {/* A styled box that shows the output text from running code. */}
      <pre
        style={{
          width: '800px',
          margin: '20px auto',
          border: '1px solid #ccc',
          minHeight: '100px',
          padding: '10px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}
      >
        {output}
      </pre>
    </>
  );
};

export default App;
