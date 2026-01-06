# PaperTime - ML Paper Recommendation Website

A modern, intelligent machine learning paper recommendation system that helps researchers discover relevant papers tailored to their interests.

## Features

- **Intelligent Recommendations**: Content-based recommendation algorithm using TF-IDF and cosine similarity to suggest papers based on your preferences
- **Hierarchical Subject Filters**: Filter papers by ML subfields (NLP, Computer Vision, Reinforcement Learning, etc.)
- **Boolean Search**: Advanced search with AND, OR, and NOT operators for precise queries
- **Paper-Type Filters**: Filter by Conference, Journal, Preprint, or Workshop papers
- **Key Points Extraction**: Automatically extracts 3-5 key points from paper abstracts
- **Code Availability Badges**: Identifies papers with available code repositories
- **Persistent Filters**: Your filter preferences are saved and restored across sessions
- **Minimalist Design**: Clean, scannable card-based UI with key metrics
- **Continuous Feedback**: Like/dislike papers to improve recommendations

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Source**: ArXiv API
- **Recommendation Algorithm**: Content-based using TF-IDF vectorization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PaperTime.git
cd PaperTime
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Get Recommendations**: Click the "Recommend Next" button to get personalized paper recommendations
2. **Search**: Type keywords in the search bar and press Enter, or use boolean operators (AND, OR, NOT)
3. **Filter**: Use the sidebar filters to narrow down by subject, paper type, or search query
4. **Provide Feedback**: Like or dislike papers to improve future recommendations
5. **Explore**: Click on paper titles to view them on ArXiv, or download PDFs directly

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment using GitHub Actions.

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Repository Name**:
   - The GitHub Actions workflow automatically detects your repository name
   - If your repository is not named "PaperTime", the workflow will still work correctly
   - The site will be available at `https://yourusername.github.io/your-repo-name/`

3. **Deploy**:
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy your site
   - Your site will be available at `https://yourusername.github.io/PaperTime/`

### Manual Build

To build the static site locally:

```bash
npm run build
```

The static files will be in the `out` directory.

## Project Structure

```
PaperTime/
├── app/
│   ├── components/       # React components
│   │   ├── FilterPanel.tsx
│   │   ├── PaperCard.tsx
│   │   ├── RecommendButton.tsx
│   │   └── SearchBar.tsx
│   ├── lib/              # Utility functions
│   │   ├── api-client.ts # Client-side API functions
│   │   ├── arxiv.ts      # ArXiv API client
│   │   ├── filters.ts    # Filter logic
│   │   ├── recommendation.ts # Recommendation algorithm
│   │   ├── summarization.ts # Key points extraction
│   │   └── tfidf.ts      # TF-IDF implementation
│   ├── stores/           # State management
│   │   └── filterStore.ts
│   ├── layout.tsx
│   └── page.tsx          # Main page
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions workflow
├── next.config.js
├── package.json
└── README.md
```

## Important Notes

### CORS and ArXiv API

The application makes API calls to ArXiv from the browser. Since ArXiv's API doesn't support CORS, the application uses a CORS proxy service (`api.allorigins.win`) to bypass this restriction. This allows the application to work entirely client-side without requiring a backend server.

If you encounter issues with the CORS proxy, you can:
- Set up your own CORS proxy server
- Use a different CORS proxy service
- Deploy a backend API to proxy requests

### Browser Compatibility

The application uses browser-native APIs (DOMParser for XML parsing) and is fully client-side, making it compatible with all modern browsers.

## How It Works

### Recommendation Algorithm

1. **Feature Extraction**: Papers are converted to TF-IDF vectors based on their titles and abstracts
2. **Similarity Calculation**: Cosine similarity is computed between papers
3. **Ranking**: Papers are ranked by:
   - Similarity to liked papers (50%)
   - Recency (30%)
   - Foundational importance (20%)

### Filtering

- **Subject Filters**: Maps hierarchical ML subjects to ArXiv categories
- **Paper Type**: Infers type from ArXiv comments and metadata
- **Boolean Search**: Parses AND/OR/NOT queries and matches against paper content

### Key Points Extraction

- Splits abstracts into sentences
- Scores sentences by length, keyword density, and position
- Selects top 3-5 sentences as key points

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- ArXiv for providing the paper database
- Next.js team for the excellent framework
- All the researchers whose papers make this tool useful

