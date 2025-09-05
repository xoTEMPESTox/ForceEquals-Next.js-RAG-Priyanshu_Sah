# Testing Checklist for Mini PDF Q&A App

## Prerequisites

- [ ] Ensure the application is running locally with `npm run dev`
- [ ] Verify `.env.local` is configured with the required environment variables
- [ ] Have a sample PDF document ready for testing

## API Testing

### Upload Endpoint

- [ ] Send a POST request to `/api/upload` with a PDF file
- [ ] Include the `X-PROTECTED-KEY` header with the correct API key
- [ ] Verify the response contains:
  - [ ] `session_id` (12-character string)
  - [ ] `num_chunks` (number of text chunks created)
  - [ ] `approx_chars` (approximate number of characters in the document)
- [ ] Test with an invalid API key and confirm access is denied
- [ ] Test with a non-PDF file and confirm appropriate error handling

### Ask Endpoint

- [ ] Send a POST request to `/api/ask` with the following JSON body:
  ```json
  {
    "session_id": "SESSION_ID_FROM_UPLOAD",
    "question": "What is the main objective described in the PDF?"
  }
  ```
- [ ] Include the `X-PROTECTED-KEY` header with the correct API key
- [ ] Verify the response contains:
 - [ ] `answer` (LLM-generated response)
  - [ ] `sources` (array of relevant chunks with scores)
  - [ ] `used_model` (identifier for the model used)
  - [ ] `latency_ms` (response time in milliseconds)
- [ ] Test with an invalid session ID and confirm appropriate error handling
- [ ] Test with a missing question and confirm appropriate error handling
- [ ] Test with an invalid API key and confirm access is denied

## Sample Questions to Test

1. [ ] "What is the main objective described in the PDF?"
2. [ ] "List two technical components mentioned and short description."
3. [ ] "What limitations or next steps does the document mention?"

## UI Testing

- [ ] Navigate to the main page at `http://localhost:3000`
- [ ] Upload a PDF file using the file input
- [ ] Verify the upload response is displayed correctly
- [ ] Enter a question in the question input field
- [ ] Verify the answer and sources are displayed correctly
- [ ] Test error scenarios (e.g., upload without file, ask without question)

## Security Testing

- [ ] Attempt to access `/api/upload` without the proper API key
- [ ] Attempt to access `/api/ask` without the proper API key
- [ ] Verify that both requests are properly rejected with a 401 status

## Session Management Testing

- [ ] Upload a PDF and note the session ID
- [ ] Ask a question using that session ID shortly after upload (should succeed)
- [ ] Wait for the session to expire (default 1 hour) and try asking another question (should fail)
- [ ] Verify that expired sessions are properly cleaned up

## Performance Testing

- [ ] Upload a large PDF (100+ pages) and measure upload time
- [ ] Ask questions with different `top_k` values and measure response times
- [ ] Verify that the application handles concurrent requests properly

## Edge Case Testing

- [ ] Upload a PDF with no text content (images only)
- [ ] Upload a very small PDF (less than one chunk)
- [ ] Ask questions that are not relevant to the document content
- [ ] Test with special characters and unicode in questions

## Documentation Verification

- [ ] Verify that the README.md file is accurate and complete
- [ ] Confirm that all environment variables are properly documented
- [ ] Check that the mermaid diagram renders correctly in GitHub
- [ ] Verify that the LM Studio screenshot is accessible