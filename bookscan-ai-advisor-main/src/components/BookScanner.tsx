import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Search, BookOpen, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import BookRecommendation from "./BookRecommendation";

interface BookData {
  title: string;
  authors: string[];
  description: string;
  categories: string[];
  thumbnail: string;
  publishedDate: string;
  pageCount: number;
  averageRating: number;
  ratingsCount: number;
  isbn: string;
  recommendation?: {
    stars: number;
    score: number;
    reasoning: string;
  };
  scannedAt: string;
}

interface BookScannerProps {
  onBookScanned: (book: BookData) => void;
  userPreferences?: {
    favoriteGenres?: string[];
  };
}

const BookScanner: React.FC<BookScannerProps> = ({ onBookScanned, userPreferences }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [manualIsbn, setManualIsbn] = useState('');
  const [scannedBook, setScannedBook] = useState<BookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isScanning, startScan, stopScan } = useBarcodeScanner();

  const cleanISBN = (isbn: string): string => {
    // Rimuove tutto tranne i numeri e le X
    return isbn.replace(/[^0-9X]/g, '');
  };

  const validateISBN = (isbn: string): boolean => {
    const cleaned = cleanISBN(isbn);
    return cleaned.length === 10 || cleaned.length === 13;
  };

  const simulateIsbnScan = () => {
    // Lista più ampia di ISBN reali per demo
    const sampleISBNs = [
      '9780143127741', // Sapiens
      '9780316769174', // The Catcher in the Rye
      '9780544003415', // The Lord of the Rings
      '9780451524935', // 1984
      '9780142424179', // The Fault in Our Stars
      '9780061120084', // To Kill a Mockingbird
      '9780307277671', // The Da Vinci Code
      '9788804668827', // Io sono Malala
      '9788817050814', // L'alchimista
      '9788806220655', // Se questo è un uomo
    ];
    
    const randomISBN = sampleISBNs[Math.floor(Math.random() * sampleISBNs.length)];
    handleIsbnInput(randomISBN);
  };

  const fetchBookFromGoogleBooks = async (isbn: string): Promise<BookData> => {
    const cleanedISBN = cleanISBN(isbn);
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanedISBN}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Libro non trovato');
      }
      
      const book = data.items[0];
      const volumeInfo = book.volumeInfo;
      
      return {
        title: volumeInfo.title || 'Titolo sconosciuto',
        authors: volumeInfo.authors || ['Autore sconosciuto'],
        description: volumeInfo.description || 'Descrizione non disponibile',
        categories: volumeInfo.categories || ['Varie'],
        thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                  volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
                  'https://via.placeholder.com/150x200?text=No+Cover',
        publishedDate: volumeInfo.publishedDate || new Date().getFullYear().toString(),
        pageCount: volumeInfo.pageCount || 0,
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0,
        isbn: cleanedISBN,
        scannedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Errore Google Books API:', error);
      throw error;
    }
  };

  const fetchBookFromOpenLibrary = async (isbn: string): Promise<BookData> => {
    const cleanedISBN = cleanISBN(isbn);
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanedISBN}&format=json&jscmd=data`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const bookKey = `ISBN:${cleanedISBN}`;
      if (!data[bookKey]) {
        throw new Error('Libro non trovato');
      }
      
      const book = data[bookKey];
      
      return {
        title: book.title || 'Titolo sconosciuto',
        authors: book.authors?.map((author: any) => author.name) || ['Autore sconosciuto'],
        description: book.excerpts?.[0]?.text || 'Descrizione non disponibile',
        categories: book.subjects?.map((subject: any) => subject.name) || ['Varie'],
        thumbnail: book.cover?.medium || book.cover?.large || 'https://via.placeholder.com/150x200?text=No+Cover',
        publishedDate: book.publish_date || new Date().getFullYear().toString(),
        pageCount: book.number_of_pages || 0,
        averageRating: 0,
        ratingsCount: 0,
        isbn: cleanedISBN,
        scannedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Errore Open Library API:', error);
      throw error;
    }
  };

  const handleCameraScan = async () => {
    try {
      const scannedCode = await startScan();
      
      if (scannedCode) {
        console.log('ISBN scansionato dalla fotocamera:', scannedCode);
        await handleIsbnInput(scannedCode);
      }
    } catch (error) {
      console.error('Errore scansione fotocamera:', error);
      toast({
        title: "Errore fotocamera",
        description: "Impossibile utilizzare la fotocamera. Prova l'inserimento manuale.",
        variant: "destructive"
      });
    }
  };

  const handleIsbnInput = async (isbn: string) => {
    const cleanedISBN = cleanISBN(isbn);
    
    if (!validateISBN(cleanedISBN)) {
      setError("ISBN non valido. Inserisci un ISBN di 10 o 13 cifre.");
      toast({
        title: "ISBN non valido",
        description: "Inserisci un ISBN valido (10 o 13 cifre)",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      let bookData: BookData;
      
      try {
        bookData = await fetchBookFromGoogleBooks(cleanedISBN);
        console.log('Libro trovato con Google Books:', bookData.title);
      } catch (googleError) {
        console.log('Google Books fallito, tentativo con Open Library...');
        bookData = await fetchBookFromOpenLibrary(cleanedISBN);
        console.log('Libro trovato con Open Library:', bookData.title);
      }
      
      const recommendation = calculateRecommendation(bookData, userPreferences);
      
      const completeBookData = {
        ...bookData,
        recommendation,
        scannedAt: new Date().toISOString()
      };
      
      setScannedBook(completeBookData);
      
      toast({
        title: "Libro trovato!",
        description: `"${bookData.title}" è stato scansionato con successo`,
      });
      
    } catch (error) {
      console.error('Errore durante la ricerca:', error);
      setError("Libro non trovato. Verifica l'ISBN e riprova.");
      toast({
        title: "Libro non trovato",
        description: "Impossibile trovare il libro con questo ISBN. Verifica che sia corretto.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRecommendation = (bookData: BookData, preferences?: { favoriteGenres?: string[] }) => {
    if (!preferences) {
      return {
        stars: 3,
        score: 3.0,
        reasoning: "Completa il tuo profilo per ricevere raccomandazioni personalizzate"
      };
    }

    let score = bookData.averageRating || 3.0;
    let reasoning = [];

    // Logica di raccomandazione basata sui generi preferiti
    const bookGenres = bookData.categories || [];
    const favoriteGenres = preferences.favoriteGenres || [];
    
    const genreMatch = bookGenres.some(genre => 
      favoriteGenres.some(fav => genre.toLowerCase().includes(fav.toLowerCase()))
    );

    if (genreMatch) {
      score += 0.5;
      reasoning.push("Corrisponde ai tuoi generi preferiti");
    }

    // Bonus per libri ben recensiti
    if (bookData.averageRating >= 4.0) {
      score += 0.3;
      reasoning.push("Ottimamente recensito dalla community");
    }

    // Bonus per autori popolari
    if (bookData.ratingsCount > 10000) {
      score += 0.2;
      reasoning.push("Libro molto popolare");
    }

    score = Math.min(5.0, Math.max(1.0, score));
    const stars = Math.round(score);

    return {
      stars,
      score: parseFloat(score.toFixed(1)),
      reasoning: reasoning.join(", ") || "Analisi basata sui tuoi gusti"
    };
  };

  const handleAcceptBook = () => {
    if (scannedBook) {
      onBookScanned(scannedBook);
      setScannedBook(null);
      setManualIsbn('');
      setError(null);
    }
  };

  const handleRejectBook = () => {
    setScannedBook(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Camera className="w-6 h-6" />
            Scanner ISBN
          </CardTitle>
          <CardDescription>
            Scansiona il codice a barre ISBN con la fotocamera o inseriscilo manualmente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Camera Scanner */}
          <div className="space-y-4">
            <Button
              onClick={handleCameraScan}
              className="w-full h-24 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isScanning || isSearching}
            >
              {isScanning ? (
                <>
                  <Camera className="w-6 h-6 mr-2 animate-pulse" />
                  Scansionando...
                </>
              ) : isSearching ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Cercando libro...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 mr-2" />
                  Scansiona con Fotocamera
                </>
              )}
            </Button>

            {/* Demo Scanner */}
            <Button
              onClick={simulateIsbnScan}
              variant="outline"
              className="w-full h-16"
              disabled={isScanning || isSearching}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Demo Scanner (ISBN Casuale)
            </Button>
          </div>

          {/* Manual ISBN Input */}
          <div className="space-y-2">
            <Label htmlFor="isbn">Inserisci ISBN manualmente:</Label>
            <div className="flex gap-2">
              <Input
                id="isbn"
                placeholder="es. 9780143127741 o 0143127741"
                value={manualIsbn}
                onChange={(e) => {
                  setManualIsbn(e.target.value);
                  if (error) setError(null);
                }}
                className="bg-white/50 dark:bg-gray-700/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleIsbnInput(manualIsbn);
                  }
                }}
              />
              <Button
                onClick={() => handleIsbnInput(manualIsbn)}
                disabled={isSearching || !manualIsbn.trim()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Cerca
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supporta ISBN-10 (10 cifre) e ISBN-13 (13 cifre). I trattini sono opzionali.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Fotocamera Reale Attivata</p>
                <p>Usa la fotocamera del dispositivo per scansionare codici a barre ISBN. Funziona anche con Google Books e Open Library!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {scannedBook && (
        <BookRecommendation
          book={scannedBook}
          onAccept={handleAcceptBook}
          onReject={handleRejectBook}
        />
      )}
    </div>
  );
};

export default BookScanner;
