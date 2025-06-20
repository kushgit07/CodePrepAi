import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import styled from "styled-components";
import { FaChevronUp, FaChevronDown, FaTimes } from "react-icons/fa";

const CodeEditor = ({
  code,
  language,
  onChange,
  executing,
  executionResult,
  error,
}) => {
  const editorRef = useRef(null);
  const [outputExpanded, setOutputExpanded] = useState(true);
  const [showOutput, setShowOutput] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const toggleOutput = () => {
    setOutputExpanded(!outputExpanded);
  };

  const closeOutput = () => {
    setShowOutput(false);
  };


  useEffect(() => {
    if (executionResult || error) {
      setShowOutput(true);
    }
  }, [executionResult, error]);

  return (
    <EditorContainer>
      <MonacoEditorWrapper>
        <Editor
          height="70vh"
          language={language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: "on",
            wordWrap: "on",
          }}
        />
      </MonacoEditorWrapper>

      {showOutput && (executionResult || error) && (
        <FloatingOutputWrapper expanded={outputExpanded}>
          <OutputHeader>
            <span>Execution Result</span>
            <HeaderButtons>
              <ToggleButton onClick={toggleOutput} title="Minimize/Expand">
                {outputExpanded ? <FaChevronDown /> : <FaChevronUp />}
              </ToggleButton>
              <CloseButton onClick={closeOutput} title="Close">
                <FaTimes />
              </CloseButton>
            </HeaderButtons>
          </OutputHeader>

          {outputExpanded && (
            <OutputContainer>
              {error && <ErrorOutput>{error}</ErrorOutput>}

              {executionResult && (
                <ResultOutput>
                  <StatusLine status={executionResult.status}>
                    Status: {executionResult.status}
                  </StatusLine>

                  {executionResult.stdout && (
                    <OutputSection>
                      <OutputLabel>Output:</OutputLabel>
                      <OutputContent>{executionResult.stdout}</OutputContent>
                    </OutputSection>
                  )}

                  {executionResult.stderr && (
                    <OutputSection>
                      <OutputLabel>Error:</OutputLabel>
                      <OutputContent>{executionResult.stderr}</OutputContent>
                    </OutputSection>
                  )}

                  {executionResult.compile_output && (
                    <OutputSection>
                      <OutputLabel>Compilation Message:</OutputLabel>
                      <OutputContent>
                        {executionResult.compile_output}
                      </OutputContent>
                    </OutputSection>
                  )}

                  {executionResult.time && (
                    <OutputStats>
                      <StatItem>Time: {executionResult.time} sec</StatItem>
                      <StatItem>
                        Memory: {Math.round(executionResult.memory / 1000)} KB
                      </StatItem>
                    </OutputStats>
                  )}
                </ResultOutput>
              )}
            </OutputContainer>
          )}
        </FloatingOutputWrapper>
      )}
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1e1e1e;
  position: relative;
`;

const MonacoEditorWrapper = styled.div`
  flex: 1;
  min-height: 400px;
`;


const FloatingOutputWrapper = styled.div`
  position: absolute;
  bottom: 30px;
  left: 30px;
  right: 30px;
  background-color: rgba(40, 44, 52, 0.95);
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  max-height: ${(props) => (props.expanded ? "50%" : "42px")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  z-index: 100;
  border: 1px solid rgba(99, 110, 123, 0.4);
  max-height: 300px;
  overflow-y: auto;   
  border: 1px solid #ccc;
  padding: 10px;     
`;

const OutputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;

  &:hover {
    color: #2980b9;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;

  &:hover {
    color: #c0392b;
  }
`;

const OutputContainer = styled.div`
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100% - 42px);
  color: #e0e0e0;
`;

const ErrorOutput = styled.div`
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.2);
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 3px solid #e74c3c;
`;

const ResultOutput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StatusLine = styled.div`
  color: ${(props) =>
    props.status === "Accepted" || props.status === "Success"
      ? "#2ecc71"
      : "#e74c3c"};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const OutputSection = styled.div`
  margin-bottom: 0.8rem;
`;

const OutputLabel = styled.div`
  font-weight: 600;
  color: #bbb;
  margin-bottom: 0.3rem;
`;

const OutputContent = styled.pre`
  background-color: rgba(30, 30, 30, 0.6);
  padding: 0.8rem;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  margin: 0;
  color: #e0e0e0;
  max-height: 150px;
`;

const OutputStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #999;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
`;

export default CodeEditor;
