// Browser-compatible TF-IDF implementation

interface DocumentVector {
  [term: string]: number;
}

export class TFIDF {
  private documents: string[] = [];
  private documentVectors: DocumentVector[] = [];
  private idf: { [term: string]: number } = {};

  addDocument(text: string) {
    this.documents.push(text.toLowerCase());
  }

  private tokenize(text: string): string[] {
    // Simple tokenization - split by whitespace and remove punctuation
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out very short words
  }

  private computeTF(term: string, document: string[]): number {
    const termCount = document.filter(word => word === term).length;
    return termCount / document.length;
  }

  private computeIDF(term: string): number {
    const documentsContainingTerm = this.documents.filter(doc => {
      const tokens = this.tokenize(doc);
      return tokens.includes(term);
    }).length;

    if (documentsContainingTerm === 0) return 0;
    return Math.log(this.documents.length / documentsContainingTerm);
  }

  build() {
    // Build IDF for all terms
    const allTerms = new Set<string>();
    this.documents.forEach(doc => {
      const tokens = this.tokenize(doc);
      tokens.forEach(token => allTerms.add(token));
    });

    allTerms.forEach(term => {
      this.idf[term] = this.computeIDF(term);
    });

    // Build TF-IDF vectors for each document
    this.documentVectors = this.documents.map(doc => {
      const tokens = this.tokenize(doc);
      const vector: DocumentVector = {};
      const uniqueTerms = new Set(tokens);

      uniqueTerms.forEach(term => {
        const tf = this.computeTF(term, tokens);
        const idf = this.idf[term] || 0;
        vector[term] = tf * idf;
      });

      return vector;
    });
  }

  tfidf(term: string, documentIndex: number): number {
    if (documentIndex < 0 || documentIndex >= this.documentVectors.length) {
      return 0;
    }
    return this.documentVectors[documentIndex][term] || 0;
  }

  getVector(documentIndex: number): number[] {
    if (documentIndex < 0 || documentIndex >= this.documentVectors.length) {
      return [];
    }
    return Object.values(this.documentVectors[documentIndex]);
  }

  getAllTerms(): string[] {
    return Object.keys(this.idf);
  }
}

