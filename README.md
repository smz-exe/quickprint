# QuickPrint

Client-side PDF printing for iOS/iPadOS via SII thermal printers using URL schemes.

## Features

- Upload PDF files with drag-and-drop
- Generate thumbnail previews
- Client-side Base64 encoding (750KB limit)
- Print via SII URL Print Agent
- Print history with retry functionality

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Requirements

- iOS/iPadOS device
- SII URL Print Agent app
- SII thermal printer (e.g., MP-B20) with Bluetooth connection

## Tech Stack

- Next.js 15.5.2 with Turbopack
- React 19.1.0
- TypeScript
- Tailwind CSS v4
- PDF.js for thumbnail generation
