# Project Structure

```
.
├── pages/
│   ├── index.js                 # Main frontend page
│   └── api/
│       ├── upload.js            # PDF upload endpoint
│       └── ask.js               # Question answering endpoint
├── lib/
│   ├── config.js                # Environment configuration
│   ├── sessionStore.js          # In-memory session storage
│   ├── vectorStore.js           # Vector storage and similarity search
│   ├── llmClient.js             # LLM and embedding API clients
│   └── security.js              # Security middleware and utilities
├── README.md                    # Project overview and setup instructions
├── TESTING_CHECKLIST.md         # Testing procedures and checklists
├── DESIGN_NOTES.md              # Architecture and design decisions
├── PROJECT_STRUCTURE.md         # This file
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules
└── package.json                # Project dependencies and scripts
```

## Key Components

### Frontend (`pages/index.js`)
- Simple React UI for uploading PDFs and asking questions
- Makes API calls to backend endpoints
- Displays responses with sources

### Backend API Routes

#### Upload Endpoint (`pages/api/upload.js`)
- Accepts PDF files via multipart form data
- Extracts text and chunks it
- Generates embeddings for chunks
- Stores session data in memory
- Returns session ID and metadata

#### Ask Endpoint (`pages/api/ask.js`)
- Accepts questions with session ID
- Generates embedding for question
- Performs similarity search
- Constructs RAG prompt
- Calls LLM and returns response

### Library Modules

#### Configuration (`lib/config.js`)
- Loads environment variables
- Provides default values
- Exposes configuration to other modules

#### Session Store (`lib/sessionStore.js`)
- Manages in-memory session storage
- Handles session expiry
- Provides CRUD operations for sessions

#### Vector Store (`lib/vectorStore.js`)
- Implements similarity search
- Calculates cosine similarity
- Manages embeddings for chunks

#### LLM Client (`lib/llmClient.js`)
- Interfaces with different LLM providers
- Handles embedding generation
- Manages API calls and error handling

#### Security (`lib/security.js`)
- Implements API key validation
- Provides rate limiting
- Handles CORS and input validation